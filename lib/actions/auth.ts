'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // User record is automatically created by database trigger
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
    },
  })

  if (error) {
    console.error('Signup error:', error)

    // Provide user-friendly error messages
    if (error.message.includes('rate limit')) {
      return { error: 'セキュリティ上の理由により、しばらく時間をおいてから再度お試しください。（約1分後）' }
    }

    if (error.message.includes('already registered')) {
      return { error: 'このメールアドレスは既に登録されています。ログインしてください。' }
    }

    return { error: error.message }
  }

  // Check if email confirmation is required
  if (authData.user && !authData.session) {
    console.log('Email confirmation required for:', authData.user.email)
    return { error: 'メール確認が必要です。登録したメールアドレスに確認メールが送信されました。' }
  }

  // User record is automatically created by database trigger
  // Redirect to onboarding for new users
  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
