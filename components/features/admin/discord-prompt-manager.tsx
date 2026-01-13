'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, X, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { updatePromptSettings, activatePromptSettings } from '@/lib/actions/discord-prompt'

interface PromptSetting {
  id: string
  system_prompt: string
  tone_description: string | null
  additional_knowledge: string | null
  is_active: boolean
  created_at: string
}

interface DiscordPromptManagerProps {
  initialSettings: PromptSetting | null
}

export function DiscordPromptManager({ initialSettings }: DiscordPromptManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<PromptSetting | null>(initialSettings)

  const [systemPrompt, setSystemPrompt] = useState(settings?.system_prompt || '')
  const [toneDescription, setToneDescription] = useState(settings?.tone_description || '')
  const [additionalKnowledge, setAdditionalKnowledge] = useState(settings?.additional_knowledge || '')

  useEffect(() => {
    if (settings) {
      setSystemPrompt(settings.system_prompt)
      setToneDescription(settings.tone_description || '')
      setAdditionalKnowledge(settings.additional_knowledge || '')
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) {
      alert('プロンプト設定が見つかりません')
      return
    }

    if (!systemPrompt.trim()) {
      alert('システムプロンプトを入力してください')
      return
    }

    setIsSaving(true)

    try {
      const result = await updatePromptSettings(settings.id, {
        system_prompt: systemPrompt,
        tone_description: toneDescription || undefined,
        additional_knowledge: additionalKnowledge || undefined
      })

      if (result.success) {
        alert('プロンプト設定を保存しました')
        setSettings(result.data)
        window.location.reload()
      } else {
        alert(`保存に失敗しました: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving prompt settings:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {/* プロンプト設定ボタン */}
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg"
      >
        <Settings className="w-4 h-4 mr-2" />
        プロンプト設定
      </Button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Discordプロンプト設定</h2>
                  <p className="text-indigo-100 text-sm">AI返信の話し方や知識を設定</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* システムプロンプト */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  システムプロンプト <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  AIの基本的な役割や振る舞いを定義します。例：「あなたは〜の専門家です」
                </p>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  placeholder="例：あなたはSAKIYOMIスクールのDiscordサーバーの管理者です。Instagramマーケティングやソーシャルメディア運用の専門知識を持っています。"
                />
              </div>

              {/* 話し方・トーン */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  話し方・トーンの説明
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  返信の口調やスタイルを指定します。例：「親切で丁寧」「フランクでカジュアル」
                </p>
                <textarea
                  value={toneDescription}
                  onChange={(e) => setToneDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  placeholder="例：親切で丁寧、かつフレンドリーな口調で対応します。絵文字を適度に使用して親しみやすい雰囲気を出します。"
                />
              </div>

              {/* 追加の知識 */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  追加の知識・コンテキスト
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  AIが知っておくべき追加情報を記載します。サービス概要、よくある質問への回答など
                </p>
                <textarea
                  value={additionalKnowledge}
                  onChange={(e) => setAdditionalKnowledge(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none"
                  placeholder="例：SAKIYOMIスクールは、Instagram運用を学べるオンラインスクールです。フォロワー獲得、エンゲージメント向上、収益化などを支援しています。"
                />
              </div>

              {/* ナレッジベース連携の説明 */}
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-1">ナレッジベース自動連携</h4>
                      <p className="text-sm text-blue-800">
                        「返信管理」ページのナレッジベースに登録された情報も自動的にAI返信に活用されます。
                        よくある質問や重要な情報はナレッジベースに登録しておくことをおすすめします。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ステータス */}
              {settings?.is_active && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500 text-white">
                    現在有効
                  </Badge>
                  <span className="text-sm text-gray-600">
                    この設定が現在使用されています
                  </span>
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="font-bold"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
