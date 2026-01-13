'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EnhancedMarkdownEditor } from '@/components/ui/enhanced-markdown-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateInstructorFeedback } from '@/lib/actions/post-feedback'
import { generateAIFeedback } from '@/lib/actions/ai-feedback'
import { useToast } from '@/lib/hooks/useToast'
import { VideoAnalysisButton } from '@/components/features/post-feedback/video-analysis-button'
import { Loader2, Save, Sparkles } from 'lucide-react'

interface InstructorFeedbackFormProps {
  feedbackId: string
  initialFeedbackGood?: string
  initialFeedbackMore?: string
  initialFeedbackNextPoints?: string
  initialFeedbackInsights?: string
  initialStatus: 'pending' | 'in_review' | 'completed'
  hasVideo?: boolean
  showVideoAnalysis?: boolean
}

export function InstructorFeedbackForm({
  feedbackId,
  initialFeedbackGood = '',
  initialFeedbackMore = '',
  initialFeedbackNextPoints = '',
  initialFeedbackInsights = '',
  initialStatus,
  hasVideo = false,
  showVideoAnalysis = true,
}: InstructorFeedbackFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedbackGood, setFeedbackGood] = useState(initialFeedbackGood)
  const [feedbackMore, setFeedbackMore] = useState(initialFeedbackMore)
  const [feedbackNextPoints, setFeedbackNextPoints] = useState(initialFeedbackNextPoints)
  const [feedbackInsights, setFeedbackInsights] = useState(initialFeedbackInsights)
  const [status, setStatus] = useState<'pending' | 'in_review' | 'completed'>(initialStatus)

  const handleGenerateAI = async () => {
    setIsGenerating(true)

    try {
      const result = await generateAIFeedback(feedbackId)

      if (result.error) {
        toast({
          title: 'エラー',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      if (result.data) {
        setFeedbackGood(result.data.good)
        setFeedbackMore(result.data.more)
        setFeedbackNextPoints(result.data.nextPoints)
        setFeedbackInsights(result.data.insights)
        toast({
          title: '成功',
          description: 'AIがフィードバックを生成しました',
        })
      }
    } catch (error) {
      console.error('Error generating AI feedback:', error)
      toast({
        title: 'エラー',
        description: 'AIフィードバックの生成に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!feedbackGood.trim() && !feedbackMore.trim() && !feedbackNextPoints.trim() && !feedbackInsights.trim()) {
      toast({
        title: 'エラー',
        description: '少なくとも1つのフィードバックを入力してください',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const result = await updateInstructorFeedback(
        feedbackId,
        feedbackGood,
        feedbackMore,
        feedbackNextPoints,
        feedbackInsights,
        status
      )

      if (result.error) {
        toast({
          title: 'エラー',
          description: result.error,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: '成功',
        description: 'フィードバックを保存しました',
      })
      router.refresh()
    })
  }

  return (
    <>
      <Card className="border-2 border-orange-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>講師フィードバック</CardTitle>
            <div className="flex items-center gap-3">
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as 'pending' | 'in_review' | 'completed')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">確認待ち</SelectItem>
                  <SelectItem value="in_review">レビュー中</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                </SelectContent>
              </Select>
              {showVideoAnalysis && (
                <VideoAnalysisButton
                  feedbackId={feedbackId}
                  hasVideo={hasVideo}
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAI}
                disabled={isGenerating || isPending}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI自動生成
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form id="instructor-feedback-form" onSubmit={handleSubmit} className="space-y-6">

            <Tabs defaultValue="good" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="good">Good</TabsTrigger>
                <TabsTrigger value="more">More</TabsTrigger>
                <TabsTrigger value="nextPoints">次回ポイント</TabsTrigger>
                <TabsTrigger value="insights">数値分析</TabsTrigger>
              </TabsList>

              <TabsContent value="good" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackGood">
                    Good
                    <span className="ml-2 text-xs text-gray-500">（マークダウン記法対応）</span>
                  </Label>
                  <EnhancedMarkdownEditor
                    value={feedbackGood}
                    onChange={setFeedbackGood}
                    placeholder="この投稿で効果的だった点を記入してください

例:
## ポイント1: 視覚的な魅力
- 冒頭のキャッチコピーが**目を引く**
- 色使いが*統一感*があって見やすい

## ポイント2: 構成
1. 導入がスムーズ
2. 展開に無駄がない
3. 結論が明確"
                    minHeight="60vh"
                  />
                </div>
              </TabsContent>

              <TabsContent value="more" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackMore">
                    More（狙いと表現のズレなど）
                    <span className="ml-2 text-xs text-gray-500">（マークダウン記法対応）</span>
                  </Label>
                  <EnhancedMarkdownEditor
                    value={feedbackMore}
                    onChange={setFeedbackMore}
                    placeholder="ターゲットと実際のコンテンツのズレ、改善できる点を記入してください

例:
### ターゲットとのズレ
- 20代女性向けだが、**使用している言葉が硬い**
- ビジュアルが若年層向けではない

### 改善提案
[ ] もっとカジュアルな表現を使う
[ ] 絵文字や装飾を増やす
[ ] BGMを流行りのものに変更"
                    minHeight="60vh"
                  />
                </div>
              </TabsContent>

              <TabsContent value="nextPoints" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackNextPoints">
                    次の投稿で意識すべきポイント
                    <span className="ml-2 text-xs text-gray-500">（マークダウン記法対応）</span>
                  </Label>
                  <EnhancedMarkdownEditor
                    value={feedbackNextPoints}
                    onChange={setFeedbackNextPoints}
                    placeholder="具体的なアクションプランや次回検証すべき仮説を記入してください

例:
# 次回のアクションプラン

## 優先度高
1. **冒頭3秒**のインパクトを強化
2. テロップの`フォントサイズ`を大きく

## 実験したいこと
- A/Bテストで背景色を変更
- 音楽のテンポを変えて反応を見る

> 重要: 必ず数値で効果を測定すること"
                    minHeight="60vh"
                  />
                </div>
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="feedbackInsights">
                    【投稿後】数値から見えた良い点 / 改善点
                    <span className="ml-2 text-xs text-gray-500">（マークダウン記法対応）</span>
                  </Label>
                  <EnhancedMarkdownEditor
                    value={feedbackInsights}
                    onChange={setFeedbackInsights}
                    placeholder="インサイトの数値を分析し、良かった指標と改善が必要な指標を記入してください

例:
## 📊 良かった指標
- **再生率**: 75% → 業界平均を上回る
- **保存数**: 50件 → 前回比+150%
- コメント率が`3.2%`で高エンゲージメント

## 📉 改善が必要な指標
- 平均視聴時間が**15秒**（動画尺30秒の50%）
  - 原因: 中盤で離脱が多い
  - 対策: 構成を見直す

---
### 総合評価
全体的には良い数値だが、**視聴維持率**の改善が急務"
                    minHeight="60vh"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </form>
      </CardContent>
    </Card>

    {/* Floating Action Buttons */}
    <div className="fixed bottom-6 right-6 flex gap-3 z-50">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.back()}
        disabled={isPending}
        className="bg-white shadow-lg hover:shadow-xl transition-shadow"
      >
        キャンセル
      </Button>
      <Button
        type="submit"
        form="instructor-feedback-form"
        disabled={isPending}
        className="shadow-lg hover:shadow-xl transition-shadow"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            保存中...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            フィードバックを保存
          </>
        )}
      </Button>
    </div>
  </>
  )
}
