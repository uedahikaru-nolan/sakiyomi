'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'
import { createNotification } from './notifications'

export async function toggleReaction(targetType: 'post' | 'comment', targetId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  // Check if user already reacted
  const { data: existingReaction } = await supabase
    .from('reactions')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .eq('user_id', user.id)
    .single()

  if (existingReaction) {
    // Remove reaction
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existingReaction.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/community')
    return { success: true, action: 'removed' }
  } else {
    // Add reaction
    const { error } = await supabase.from('reactions').insert({
      target_type: targetType,
      target_id: targetId,
      user_id: user.id,
      reaction_type: 'like',
    })

    if (error) {
      return { error: error.message }
    }

    // Award XP to the user who is reacting
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      action_type: 'reaction',
      xp_amount: 5,
      description: 'いいねしました',
      related_entity_type: targetType,
      related_entity_id: targetId,
    })

    // Get post/comment author to send notification
    if (targetType === 'post') {
      const { data: post } = await supabase
        .from('posts')
        .select('user_id, title')
        .eq('id', targetId)
        .single()

      // Create notification for post author (if not reacting to own post)
      if (post && post.user_id !== user.id) {
        await createNotification(
          post.user_id,
          'reaction',
          `${user.name || user.email}さんがあなたの投稿「${post.title}」にいいねしました`,
          'post',
          targetId
        )
      }
    }

    revalidatePath('/dashboard/community')
    return { success: true, action: 'added' }
  }
}
