'use client'

import { useState } from 'react'
import { Server, Hash, User, Calendar, Image, FileText, Shield, Sparkles, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { generateDiscordResponse } from '@/lib/actions/ai-response'

interface DiscordMessageCardProps {
  message: {
    id: number
    discord_id: string
    content: string | null
    created_at: string
    edited_at: string | null
    attachments: any
    embeds: any
  }
  guild: { name: string } | undefined
  channel: { name: string } | undefined
  author: {
    username: string
    is_admin: boolean
    bot: boolean
  } | undefined
}

export function DiscordMessageCard({ message, guild, channel, author }: DiscordMessageCardProps) {
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const hasAttachments = message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0
  const hasEmbeds = message.embeds && Array.isArray(message.embeds) && message.embeds.length > 0

  const handleGenerateResponse = async () => {
    if (!message.content) {
      alert('メッセージ内容がありません')
      return
    }

    setIsGenerating(true)
    setAiResponse(null)

    try {
      const result = await generateDiscordResponse(
        message.content,
        channel?.name || 'unknown',
        author?.username || 'unknown'
      )

      if (result.success && result.response) {
        setAiResponse(result.response)
      } else {
        alert(`返信案の生成に失敗しました: ${result.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('Error generating response:', error)
      alert('エラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyResponse = async () => {
    if (!aiResponse) return

    try {
      await navigator.clipboard.writeText(aiResponse)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('コピーに失敗しました')
    }
  }

  return (
    <div className="p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 space-y-4">
      {/* Header: Server, Channel, Author */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Server */}
        <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-lg">
          <Server className="w-4 h-4 text-purple-700" />
          <span className="text-sm font-bold text-purple-900">
            {guild?.name || message.discord_id}
          </span>
        </div>

        {/* Channel */}
        <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-lg">
          <Hash className="w-4 h-4 text-green-700" />
          <span className="text-sm font-bold text-green-900">
            {channel?.name || 'unknown'}
          </span>
        </div>

        {/* Author */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          author?.is_admin ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          {author?.is_admin ? (
            <Shield className="w-4 h-4 text-red-700" />
          ) : (
            <User className="w-4 h-4 text-blue-700" />
          )}
          <span className={`text-sm font-bold ${
            author?.is_admin ? 'text-red-900' : 'text-blue-900'
          }`}>
            {author?.username || 'unknown'}
          </span>
          {author?.is_admin && (
            <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold">
              管理者
            </Badge>
          )}
          {author?.bot && (
            <Badge className="bg-indigo-500 text-white text-xs">BOT</Badge>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg ml-auto">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700 font-medium">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: ja
            })}
          </span>
        </div>
      </div>

      {/* Message Content */}
      {message.content && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-gray-800 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      )}

      {/* Attachments & Embeds Indicators */}
      {(hasAttachments || hasEmbeds) && (
        <div className="flex gap-2 flex-wrap">
          {hasAttachments && (
            <div className="flex items-center gap-2 bg-amber-100 px-3 py-1.5 rounded-lg">
              <Image className="w-4 h-4 text-amber-700" />
              <span className="text-sm font-bold text-amber-900">
                添付ファイル: {message.attachments.length}件
              </span>
            </div>
          )}
          {hasEmbeds && (
            <div className="flex items-center gap-2 bg-rose-100 px-3 py-1.5 rounded-lg">
              <FileText className="w-4 h-4 text-rose-700" />
              <span className="text-sm font-bold text-rose-900">
                埋め込み: {message.embeds.length}件
              </span>
            </div>
          )}
        </div>
      )}

      {/* AI Response Section */}
      {aiResponse && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-900">AI返信案</span>
            </div>
            <Button
              onClick={handleCopyResponse}
              size="sm"
              variant="outline"
              className="bg-white hover:bg-purple-50 border-purple-300"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-green-600" />
                  <span className="text-green-600">コピー済み</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  コピー
                </>
              )}
            </Button>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
            {aiResponse}
          </p>
        </div>
      )}

      {/* Footer: Message metadata & AI Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-xs text-gray-500">
          <span>Message ID: {message.discord_id}</span>
          {message.edited_at && (
            <span className="text-amber-600 font-medium">編集済み</span>
          )}
        </div>

        {/* AI Response Button */}
        {message.content && (
          <Button
            onClick={handleGenerateResponse}
            disabled={isGenerating}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-md"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {isGenerating ? 'AI返信案作成中...' : 'AI返信案作成'}
          </Button>
        )}
      </div>
    </div>
  )
}
