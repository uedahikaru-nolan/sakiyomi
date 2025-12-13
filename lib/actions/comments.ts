'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'
import { createNotification } from './notifications'

export async function createComment(postId: string, content: string, parentCommentId?: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    parent_comment_id: parentCommentId || null,
    content,
  })

  if (error) {
    return { error: error.message }
  }

  // Award XP
  await supabase.from('xp_transactions').insert({
    user_id: user.id,
    action_type: 'comment',
    xp_amount: 10,
    description: 'コメントを投稿しました',
    related_entity_type: 'comment',
    related_entity_id: postId,
  })

  // Get post author to send notification
  const { data: post } = await supabase
    .from('posts')
    .select('user_id, title')
    .eq('id', postId)
    .single()

  // Create notification for post author (if not commenting on own post)
  if (post && post.user_id !== user.id) {
    await createNotification(
      post.user_id,
      'comment',
      `${user.name || user.email}さんがあなたの投稿「${post.title}」にコメントしました`,
      'post',
      postId
    )
  }

  revalidatePath('/dashboard/community')
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/community')
  return { success: true }
}
