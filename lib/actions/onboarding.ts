'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const profileData = {
    user_id: user.id,
    respondent_name: formData.get('respondent_name') as string,
    full_name: formData.get('full_name') as string,
    discord_name: formData.get('discord_name') as string,
    main_account_url: formData.get('main_account_url') as string,
    second_account_url: formData.get('second_account_url') as string || null,
    teachable_email: formData.get('teachable_email') as string,
    join_reason: formData.get('join_reason') as string,
    onboarding_completed: true,
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) {
    console.error('Onboarding error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
