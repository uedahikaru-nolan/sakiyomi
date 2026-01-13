'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2, RefreshCw, Clock } from 'lucide-react'
import { analyzeVideoTranscription, getVideoAnalysis } from '@/lib/actions/video-analysis'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface VideoAnalysisButtonProps {
  feedbackId: string
  hasVideo: boolean
}

export function VideoAnalysisButton({ feedbackId, hasVideo }: VideoAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [analysis, setAnalysis] = useState<{
    transcription: string
    openingAnalysis: string
    structureAnalysis: string
    editingAnalysis: string
    targetAppealAnalysis: string
    improvements: string
    overallEvaluation: string
    fullAnalysis: string
    analyzedAt?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load existing analysis on mount
  useEffect(() => {
    const loadExistingAnalysis = async () => {
      try {
        const result = await getVideoAnalysis(feedbackId)
        if (result.data && result.data.analysis) {
          setAnalysis(result.data.analysis)
        }
      } catch (err) {
        console.error('Failed to load existing analysis:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadExistingAnalysis()
  }, [feedbackId])

  const handleAnalyze = async () => {
    if (!hasVideo) {
      setError('動画が登録されていません')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeVideoTranscription(feedbackId)

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setAnalysis(result.data)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('動画分析中にエラーが発生しました')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !hasVideo}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              動画を分析中...
            </>
          ) : analysis ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              再分析を実行
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              動画分析を実行
            </>
          )}
        </Button>

        {analysis?.analyzedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              最終分析: {format(new Date(analysis.analyzedAt), 'yyyy年M月d日 HH:mm', { locale: ja })}
            </span>
          </div>
        )}
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-6">
          {/* Transcription */}
          {analysis.transcription && (
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  📝 動画の文字起こし
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {analysis.transcription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Analysis Sections */}
          <Card className="border-2 border-purple-300 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                🎬 動画分析
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {analysis.openingAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">冒頭3秒の評価</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {analysis.openingAnalysis}
                  </p>
                </div>
              )}

              {analysis.structureAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">構成と流れ</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {analysis.structureAnalysis}
                  </p>
                </div>
              )}

              {analysis.editingAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">編集技術</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {analysis.editingAnalysis}
                  </p>
                </div>
              )}

              {analysis.targetAppealAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">ターゲットへの訴求力</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {analysis.targetAppealAnalysis}
                  </p>
                </div>
              )}

              {analysis.improvements && (
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">改善提案</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {analysis.improvements}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Evaluation */}
          {analysis.overallEvaluation && (
            <Card className="border-2 border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  ✨ 総合評価
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {analysis.overallEvaluation}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
