'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function updateProfile(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  // Check if user exists in users table
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single()

  // If user doesn't exist, create it first
  if (!existingUser) {
    await supabase.from('users').insert({
      id: user.id,
      email: user.email!,
      name: formData.get('name') as string || user.email?.split('@')[0],
      nickname: formData.get('nickname') as string,
      role: 'member',
      status: 'active',
    })
  } else {
    // Update existing user
    const { error: userError } = await supabase
      .from('users')
      .update({
        name: formData.get('name') as string,
        nickname: formData.get('nickname') as string,
      })
      .eq('id', user.id)

    if (userError) {
      return { error: userError.message }
    }
  }

  // Update or insert user profile
  const profileData = {
    user_id: user.id,
    bio: formData.get('bio') as string,
    website_url: formData.get('website_url') as string,
    twitter_handle: formData.get('twitter_handle') as string,
    location: formData.get('location') as string,
    occupation: formData.get('occupation') as string,
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert(profileData, { onConflict: 'user_id' })

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
