'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

export async function updateProfile(formData: FormData) {
  const user = await requireUser()
  const supabase = await createClient()

  // アバター画像の処理
  let avatarUrl: string | null = null
  const avatarFile = formData.get('avatar') as File | null

  if (avatarFile && avatarFile.size > 0) {
    try {
      // ファイル拡張子を取得
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // 既存のアバターを削除（存在する場合）
      const { data: existingUser } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      if (existingUser?.avatar_url) {
        try {
          // URLからファイルパスを抽出
          const url = new URL(existingUser.avatar_url)
          const pathParts = url.pathname.split('/')
          const bucketIndex = pathParts.indexOf('avatars')
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/')
            await supabase.storage
              .from('avatars')
              .remove([filePath])
          }
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError)
          // 削除失敗してもアップロードは続行
        }
      }

      // 新しい画像をアップロード
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return { error: `画像のアップロードに失敗しました: ${uploadError.message}` }
      }

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      avatarUrl = publicUrl
    } catch (error) {
      console.error('Avatar upload error:', error)
      return { error: '画像の処理中にエラーが発生しました' }
    }
  }

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
      avatar_url: avatarUrl,
      role: 'member',
      status: 'active',
    })
  } else {
    // Update existing user
    const updateData: any = {
      name: formData.get('name') as string,
      nickname: formData.get('nickname') as string,
    }

    // アバターURLがある場合のみ更新
    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    const { error: userError } = await supabase
      .from('users')
      .update(updateData)
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
