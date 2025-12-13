'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function updateProgress(lessonId: string, progress: number, positionSeconds?: number) {
  const user = await requireUser()
  const supabase = await createClient()

  const status = progress >= 90 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'

  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status,
        progress_percentage: Math.min(100, Math.max(0, progress)),
        last_position_seconds: positionSeconds || 0,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,lesson_id' }
    )

  if (error) {
    return { error: error.message }
  }

  // Award XP if completed
  if (status === 'completed') {
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      action_type: 'video_complete',
      xp_amount: 100,
      description: 'レッスンを完了しました',
      related_entity_type: 'lesson',
      related_entity_id: lessonId,
    })
  }

  revalidatePath('/dashboard')
  return { success: true, status }
}

export async function markLessonComplete(lessonId: string) {
  return updateProgress(lessonId, 100)
}
