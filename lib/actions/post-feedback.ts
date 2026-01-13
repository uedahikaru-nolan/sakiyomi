'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PostFeedbackFormData = {
  // 添削依頼情報
  prePostVideoUrl?: string
  postUrl?: string

  // 投稿の狙い
  targetAudience: string
  targetBenefit: string
  referencePostUrl?: string

  // 工夫した点
  first3Seconds?: string
  structureContent?: string
  shootingEditing?: string

  // インサイト
  videoDurationSeconds?: number
  viewCount?: number
  reachCount?: number
  averageWatchTimeSeconds?: number
  threeSecondRetentionRate?: number
  saveCount?: number
  commentCount?: number
  likeCount?: number
  shareCount?: number
  followCount?: number

  // 仮説
  goodPoints?: string
  badPoints?: string
  nextVerification?: string
}

export async function createPostFeedback(formData: PostFeedbackFormData) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  // Insert post feedback
  const { data, error } = await supabase
    .from('post_feedback')
    .insert({
      user_id: user.id,
      pre_post_video_url: formData.prePostVideoUrl,
      post_url: formData.postUrl,
      target_audience: formData.targetAudience,
      target_benefit: formData.targetBenefit,
      reference_post_url: formData.referencePostUrl,
      first_3_seconds: formData.first3Seconds,
      structure_content: formData.structureContent,
      shooting_editing: formData.shootingEditing,
      video_duration_seconds: formData.videoDurationSeconds,
      view_count: formData.viewCount,
      reach_count: formData.reachCount,
      average_watch_time_seconds: formData.averageWatchTimeSeconds,
      three_second_retention_rate: formData.threeSecondRetentionRate,
      save_count: formData.saveCount,
      comment_count: formData.commentCount,
      like_count: formData.likeCount,
      share_count: formData.shareCount,
      follow_count: formData.followCount,
      good_points: formData.goodPoints,
      bad_points: formData.badPoints,
      next_verification: formData.nextVerification,
      feedback_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating post feedback:', error)
    return { error: 'フィードバック依頼の作成に失敗しました' }
  }

  revalidatePath('/dashboard/post-feedback')
  return { data }
}

export async function getPostFeedback() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin'

  // Get post feedback
  let query = supabase
    .from('post_feedback')
    .select('*')
    .order('created_at', { ascending: false })

  // If not admin, only show user's own feedback
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data: feedbackData, error } = await query

  if (error) {
    console.error('Error fetching post feedback:', error)
    return { error: 'フィードバックの取得に失敗しました' }
  }

  // Fetch user data separately for each feedback
  if (feedbackData && feedbackData.length > 0) {
    const feedbackWithUsers = await Promise.all(
      feedbackData.map(async (feedback) => {
        const { data: userData } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', feedback.user_id)
          .single()

        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('user_id', feedback.user_id)
          .single()

        return {
          ...feedback,
          user: {
            ...userData,
            user_profiles: profileData ? [profileData] : [],
          },
        }
      })
    )

    return { data: feedbackWithUsers }
  }

  return { data: feedbackData }
}

export async function getPostFeedbackById(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  const { data: feedback, error } = await supabase
    .from('post_feedback')
    .select('*, ai_video_analysis, ai_video_analyzed_at')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching post feedback:', error)
    return { error: 'フィードバックの取得に失敗しました' }
  }

  // Fetch user data separately
  const { data: userData } = await supabase
    .from('users')
    .select('id, email')
    .eq('id', feedback.user_id)
    .single()

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('display_name')
    .eq('user_id', feedback.user_id)
    .single()

  const data = {
    ...feedback,
    user: {
      ...userData,
      user_profiles: profileData ? [profileData] : [],
    },
  }

  return { data }
}

export async function updatePostFeedback(
  id: string,
  formData: Partial<PostFeedbackFormData>
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  const { data, error } = await supabase
    .from('post_feedback')
    .update({
      pre_post_video_url: formData.prePostVideoUrl,
      post_url: formData.postUrl,
      target_audience: formData.targetAudience,
      target_benefit: formData.targetBenefit,
      reference_post_url: formData.referencePostUrl,
      first_3_seconds: formData.first3Seconds,
      structure_content: formData.structureContent,
      shooting_editing: formData.shootingEditing,
      video_duration_seconds: formData.videoDurationSeconds,
      view_count: formData.viewCount,
      reach_count: formData.reachCount,
      average_watch_time_seconds: formData.averageWatchTimeSeconds,
      three_second_retention_rate: formData.threeSecondRetentionRate,
      save_count: formData.saveCount,
      comment_count: formData.commentCount,
      like_count: formData.likeCount,
      share_count: formData.shareCount,
      follow_count: formData.followCount,
      good_points: formData.goodPoints,
      bad_points: formData.badPoints,
      next_verification: formData.nextVerification,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating post feedback:', error)
    return { error: 'フィードバックの更新に失敗しました' }
  }

  revalidatePath('/dashboard/post-feedback')
  return { data }
}

export async function updateInstructorFeedback(
  id: string,
  feedbackGood: string,
  feedbackMore: string,
  feedbackNextPoints: string,
  feedbackInsights: string,
  feedbackStatus: 'pending' | 'in_review' | 'completed'
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    return { error: '管理者権限がありません' }
  }

  const { data, error } = await supabase
    .from('post_feedback')
    .update({
      feedback_good: feedbackGood,
      feedback_more: feedbackMore,
      feedback_next_points: feedbackNextPoints,
      feedback_insights: feedbackInsights,
      feedback_status: feedbackStatus,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating instructor feedback:', error)
    return { error: 'フィードバックの更新に失敗しました' }
  }

  revalidatePath('/dashboard/post-feedback')
  revalidatePath('/admin/post-feedback')
  return { data }
}

export async function deletePostFeedback(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  const { error } = await supabase.from('post_feedback').delete().eq('id', id)

  if (error) {
    console.error('Error deleting post feedback:', error)
    return { error: 'フィードバックの削除に失敗しました' }
  }

  revalidatePath('/dashboard/post-feedback')
  return { success: true }
}

export async function uploadFeedbackVideo(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'ファイルが選択されていません' }
  }

  // Generate unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('post-feedback-videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Error uploading video:', error)
    return { error: `動画のアップロードに失敗しました: ${error.message}` }
  }

  console.log('Video uploaded successfully:', data.path)

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('post-feedback-videos').getPublicUrl(data.path)

  console.log('Public URL created:', publicUrl)

  return { data: { path: data.path, publicUrl } }
}
