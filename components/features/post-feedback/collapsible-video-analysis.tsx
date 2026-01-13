'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VideoAnalysisButton } from '@/components/features/post-feedback/video-analysis-button'
import { Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleVideoAnalysisProps {
  feedbackId: string
  hasVideo: boolean
}

export function CollapsibleVideoAnalysis({ feedbackId, hasVideo }: CollapsibleVideoAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Collapsed state - just a small icon button
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="icon"
        className="ml-auto shadow-md hover:shadow-lg transition-shadow"
        title="AI動画分析を開く"
      >
        <Video className="w-4 h-4" />
      </Button>
    )
  }

  // Expanded state - full card with content
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-600" />
            AI動画分析
          </CardTitle>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="閉じる"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="border-t pt-6">
        <VideoAnalysisButton
          feedbackId={feedbackId}
          hasVideo={hasVideo}
        />
      </CardContent>
    </Card>
  )
}