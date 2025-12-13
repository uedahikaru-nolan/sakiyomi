'use client'

import { useState, useEffect } from 'react'

interface VideoPlayerProps {
  videoProvider: 'vimeo' | 'youtube'
  videoId: string
  videoUrl?: string | null
  onProgress?: (progress: number) => void
  onComplete?: () => void
  lastPosition?: number
}

export function VideoPlayer({
  videoProvider,
  videoId,
  videoUrl,
  onProgress,
  onComplete,
  lastPosition = 0,
}: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (videoProvider === 'vimeo') {
      // Load Vimeo Player API
      const script = document.createElement('script')
      script.src = 'https://player.vimeo.com/api/player.js'
      script.async = true
      script.onload = () => setIsReady(true)
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    } else if (videoProvider === 'youtube') {
      setIsReady(true)
    }
  }, [videoProvider])

  if (videoProvider === 'vimeo') {
    const vimeoUrl = videoUrl || `https://player.vimeo.com/video/${videoId}`

    return (
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`${vimeoUrl}?title=0&byline=0&portrait=0${lastPosition ? `#t=${lastPosition}s` : ''}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  if (videoProvider === 'youtube') {
    return (
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}${lastPosition ? `?start=${lastPosition}` : ''}`}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <p className="text-muted-foreground">サポートされていない動画形式です</p>
    </div>
  )
}
