import { createClient } from '@/lib/supabase/client'

/**
 * クライアント側で動画をSupabase Storageにアップロード
 */
export async function uploadVideoToStorage(
  videoFile: File,
  lessonId: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient()

    // ファイルサイズチェック（1GB制限）
    const maxSize = 1024 * 1024 * 1024 // 1GB
    if (videoFile.size > maxSize) {
      return {
        error: `動画ファイルサイズが大きすぎます。1GB以下のファイルを選択してください。(現在: ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB)`
      }
    }

    // ファイル名を生成（レッスンID + タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `lessons/${lessonId}/${timestamp}.${fileExt}`

    // ファイルをアップロード
    const { data, error } = await supabase.storage
      .from('course-videos')
      .upload(fileName, videoFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Video upload error:', error)

      // エラーメッセージを詳細に
      if (error.message?.includes('exceeded the maximum allowed size')) {
        return { error: `動画ファイルサイズが大きすぎます (${(videoFile.size / (1024 * 1024)).toFixed(2)}MB)。1GB以下のファイルを選択してください。` }
      } else if (error.message?.includes('Bucket not found')) {
        return { error: 'ストレージバケットが見つかりません。管理者に連絡してください。' }
      } else {
        return { error: `動画のアップロードに失敗しました: ${error.message}` }
      }
    }

    // パブリックURLを取得
    const { data: urlData } = supabase.storage
      .from('course-videos')
      .getPublicUrl(fileName)

    return { url: urlData.publicUrl }
  } catch (error) {
    console.error('Error uploading video:', error)
    return { error: '動画のアップロード中にエラーが発生しました' }
  }
}
