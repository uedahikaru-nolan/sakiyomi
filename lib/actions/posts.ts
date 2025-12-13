'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function createPost(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  const tags = formData.get('tags') as string
  const tagArray = tags
    ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    : []

  const { error } = await supabase.from('posts').insert({
    user_id: user.id,
    post_type: formData.get('post_type') as string,
    title: formData.get('title') as string,
    content: formData.get('content') as string,
    tags: tagArray,
    is_published: true,
    published_at: new Date().toISOString(),
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/community')
  redirect('/dashboard/community')
}

export async function deletePost(postId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/community')
  return { success: true }
}
