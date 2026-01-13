'use client'

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, Video, Loader2 } from 'lucide-react'

interface VideoFile {
  file: File
  preview: string
  id: string
}

interface VideoUploaderProps {
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  maxSizeMB?: number
}

export function VideoUploader({ onFilesChange, maxFiles = 10, maxSizeMB = 1024 }: VideoUploaderProps) {
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // ファイルサイズチェック (1GB制限)
    const maxSize = 1024 * 1024 * 1024 // 1GB
    if (file.size > maxSize) {
      return `ファイルサイズは1GB以下にしてください (現在: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`
    }

    // ファイルタイプチェック
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska']
    if (!validTypes.includes(file.type)) {
      return '対応している動画形式: MP4, MOV, WebM, MKV'
    }

    return null
  }

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const newVideos: VideoFile[] = []
    let errorMsg: string | null = null

    Array.from(files).forEach((file) => {
      // 最大ファイル数チェック
      if (videos.length + newVideos.length >= maxFiles) {
        errorMsg = `最大${maxFiles}ファイルまでアップロード可能です`
        return
      }

      // ファイルバリデーション
      const validationError = validateFile(file)
      if (validationError) {
        errorMsg = validationError
        return
      }

      // プレビュー用のURL作成
      const preview = URL.createObjectURL(file)
      newVideos.push({
        file,
        preview,
        id: `${Date.now()}-${Math.random()}`,
      })
    })

    if (errorMsg) {
      setError(errorMsg)
      setTimeout(() => setError(null), 5000)
      return
    }

    const updatedVideos = [...videos, ...newVideos]
    setVideos(updatedVideos)
    onFilesChange(updatedVideos.map((v) => v.file))
    setError(null)
  }

  const removeVideo = (id: string) => {
    const video = videos.find((v) => v.id === id)
    if (video) {
      URL.revokeObjectURL(video.preview)
    }

    const updatedVideos = videos.filter((v) => v.id !== id)
    setVideos(updatedVideos)
    onFilesChange(updatedVideos.map((v) => v.file))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    addFiles(files)
  }

  return (
    <div className="space-y-5">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-300
          ${
            isDragging
              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 scale-105 shadow-xl'
              : 'border-gray-300 hover:border-orange-400 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-lg'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-5">
          <div className="p-5 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl shadow-lg ring-4 ring-orange-100">
            <Upload className="h-10 w-10 text-orange-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">
              動画ファイルをドラッグ＆ドロップ
            </p>
            <p className="text-base text-gray-600 mt-2 font-medium">
              または、クリックしてファイルを選択
            </p>
          </div>
          <div className="text-sm text-gray-500 space-y-1.5 font-medium">
            <p>対応形式: MP4, MOV, WebM, MKV</p>
            <p>最大サイズ: 1GB / 最大{maxFiles}ファイル</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl shadow-sm">
          <p className="text-base font-semibold text-red-800">{error}</p>
        </div>
      )}

      {/* Uploaded Videos List */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <p className="text-base font-bold text-gray-700">
            アップロード予定の動画 ({videos.length}/{maxFiles})
          </p>
          <div className="space-y-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
                    <Video className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-800 truncate">
                    {video.file.name}
                  </p>
                  <p className="text-sm text-gray-600 font-semibold mt-1">
                    {(video.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeVideo(video.id)}
                  className="flex-shrink-0 p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
