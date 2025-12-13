'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

// Check if user is admin
async function requireAdmin() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    throw new Error('Admin access required')
  }

  return user
}

// === User Management Actions ===

export async function updateUserRole(userId: string, role: 'member' | 'admin' | 'super_admin') {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserStatus(userId: string, status: 'active' | 'pending' | 'suspended' | 'cancelled') {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

// === Course Management Actions ===

export async function createCourse(formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('courses').insert({
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category_id: formData.get('category_id') as string,
    is_published: formData.get('is_published') === 'true',
    thumbnail_url: formData.get('thumbnail_url') as string || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('courses')
    .update({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category_id: formData.get('category_id') as string,
      is_published: formData.get('is_published') === 'true',
      thumbnail_url: formData.get('thumbnail_url') as string || null,
    })
    .eq('id', courseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

export async function deleteCourse(courseId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/courses')
  return { success: true }
}

// === Post Management Actions ===

export async function deletePost(postId: string) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/posts')
  return { success: true }
}

export async function updatePostStatus(postId: string, isPublished: boolean) {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('posts')
    .update({ is_published: isPublished })
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/posts')
  return { success: true }
}
