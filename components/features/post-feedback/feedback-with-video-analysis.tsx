'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InstructorFeedbackForm } from '@/components/features/post-feedback/instructor-feedback-form'
import { VideoAnalysisButton } from '@/components/features/post-feedback/video-analysis-button'
import { Video, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackWithVideoAnalysisProps {
  feedbackId: string
  initialFeedbackGood?: string
  initialFeedbackMore?: string
  initialFeedbackNextPoints?: string
  initialFeedbackInsights?: string
  initialStatus: 'pending' | 'in_review' | 'completed'
  hasVideo: boolean
}

export function FeedbackWithVideoAnalysis({
  feedbackId,
  initialFeedbackGood,
  initialFeedbackMore,
  initialFeedbackNextPoints,
  initialFeedbackInsights,
  initialStatus,
  hasVideo,
}: FeedbackWithVideoAnalysisProps) {
  const [isVideoAnalysisOpen, setIsVideoAnalysisOpen] = useState(false)

  return (
    <div className="relative h-full">
      {/* Video Analysis Toggle Button - Always visible in top right */}
      {!isVideoAnalysisOpen && (
        <Button
          onClick={() => setIsVideoAnalysisOpen(true)}
          variant="outline"
          size="icon"
          className="absolute -top-12 right-0 shadow-md hover:shadow-lg transition-shadow z-10"
          title="AI動画分析を開く"
        >
          <Video className="w-4 h-4" />
        </Button>
      )}

      {/* Main Content Grid */}
      <div className={cn(
        "grid gap-6 transition-all duration-300 h-full",
        isVideoAnalysisOpen ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Instructor Feedback Form - Expands when video analysis is hidden */}
        <div className={cn(
          "transition-all duration-300 h-full overflow-hidden",
          !isVideoAnalysisOpen && "xl:col-span-1"
        )}>
          <InstructorFeedbackForm
            feedbackId={feedbackId}
            initialFeedbackGood={initialFeedbackGood}
            initialFeedbackMore={initialFeedbackMore}
            initialFeedbackNextPoints={initialFeedbackNextPoints}
            initialFeedbackInsights={initialFeedbackInsights}
            initialStatus={initialStatus}
            hasVideo={hasVideo}
            showVideoAnalysis={false}
          />
        </div>

        {/* Video Analysis Section - Only visible when open */}
        {isVideoAnalysisOpen && (
          <div className="h-full overflow-hidden flex flex-col">
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    AI動画分析
                  </CardTitle>
                  <Button
                    onClick={() => setIsVideoAnalysisOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="閉じる"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(100% - 73px)' }}>
                <VideoAnalysisButton
                  feedbackId={feedbackId}
                  hasVideo={hasVideo}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}