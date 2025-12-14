'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, MoreVertical, Circle, Sparkles } from 'lucide-react'
import { useChatMessages } from '@/lib/hooks/useChatMessages'
import { MessageList } from '@/components/features/chat/message-list'
import { cn } from '@/lib/utils/cn'
import { updateChatRoomStatus } from '@/lib/actions/admin-chat'
import { createClient } from '@/lib/supabase/client'
import { generateAIReply } from '@/lib/actions/ai-reply'
import { deleteMessage, updateMessage } from '@/lib/actions/chat'

interface AdminMessageAreaProps {
  roomId: string
}

export function AdminMessageArea({ roomId }: AdminMessageAreaProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { messages, isLoading, isSending, error, sendMessage, markAsRead } = useChatMessages(roomId)
  const [inputValue, setInputValue] = useState('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [roomStatus, setRoomStatus] = useState<string>('open')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingMessageText, setEditingMessageText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const statusMenuRef = useRef<HTMLDivElement>(null)

  // 現在のユーザーIDを取得
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    fetchCurrentUser()
  }, [])

  // チャットを開いたら既読処理
  useEffect(() => {
    markAsRead()
  }, [markAsRead])

  // メッセージから部屋のステータスを取得
  useEffect(() => {
    // ここでは最初のメッセージが読み込まれた際に、別途ルームデータを取得する必要があります
    // 今は簡易的にopenとします（後で改善可能）
  }, [messages])

  // ステータスメニューの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false)
      }
    }

    if (showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStatusMenu])

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const message = inputValue.trim()
    if (!message || isSending) return

    const success = await sendMessage(message)

    if (success) {
      setInputValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.focus()
      }
    }
  }

  // Cmd+Enter（またはCtrl+Enter）で送信、Enterで改行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // テキストエリアの自動リサイズ
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    const textarea = e.target
    textarea.style.height = '40px' // 最小高さにリセット
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200)
    textarea.style.height = `${newHeight}px`
  }

  // ステータス変更
  const handleStatusChange = async (newStatus: 'open' | 'resolved' | 'closed') => {
    const result = await updateChatRoomStatus(roomId, newStatus)

    if (!result.error) {
      setRoomStatus(newStatus)
      setShowStatusMenu(false)
    }
  }

  // AI返信生成
  const handleGenerateAIReply = async () => {
    if (!currentUserId || isGeneratingAI) return

    setIsGeneratingAI(true)

    try {
      const result = await generateAIReply(messages, currentUserId)

      if (result.error) {
        alert(`エラー: ${result.error}`)
      } else if (result.reply) {
        setInputValue(result.reply)
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
          textareaRef.current.style.height = `${newHeight}px`
          textareaRef.current.focus()
        }
      }
    } catch (error) {
      console.error('AI reply generation error:', error)
      alert('AI返信の生成に失敗しました')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // メッセージ編集
  const handleEditMessage = (messageId: string, currentMessage: string) => {
    setEditingMessageId(messageId)
    setEditingMessageText(currentMessage)
  }

  // メッセージ編集送信
  const handleSubmitEdit = async () => {
    if (!editingMessageId) return

    const trimmed = editingMessageText.trim()
    if (!trimmed) {
      alert('メッセージを入力してください')
      return
    }

    const result = await updateMessage(editingMessageId, trimmed)

    if (result.error) {
      alert(`エラー: ${result.error}`)
    } else {
      setEditingMessageId(null)
      setEditingMessageText('')
    }
  }

  // メッセージ削除
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('このメッセージを削除しますか?')) return

    const result = await deleteMessage(messageId)

    if (result.error) {
      alert(`エラー: ${result.error}`)
    }
  }

  // ユーザー情報を取得（最初のメッセージから）
  const userInfo = messages.length > 0
    ? messages.find(m => m.sender.role !== 'admin' && m.sender.role !== 'super_admin')?.sender
    : null

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { label: '対応中', color: 'text-green-600', bgColor: 'bg-green-50' }
      case 'resolved':
        return { label: '解決済', color: 'text-blue-600', bgColor: 'bg-blue-50' }
      case 'closed':
        return { label: 'クローズ', color: 'text-gray-600', bgColor: 'bg-gray-50' }
      default:
        return { label: '不明', color: 'text-gray-600', bgColor: 'bg-gray-50' }
    }
  }

  const statusInfo = getStatusInfo(roomStatus)

  return (
    <div className="flex h-full max-h-[80vh] flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b p-4 bg-white">
        <div className="flex items-center gap-3">
          {userInfo && (
            <>
              {userInfo.avatar_url ? (
                <img
                  src={userInfo.avatar_url}
                  alt={userInfo.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                  {userInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-sm">{userInfo.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Circle className={cn('h-2 w-2 fill-current', statusInfo.color)} />
                  <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ステータス変更メニュー */}
        <div className="relative" ref={statusMenuRef}>
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="メニュー"
          >
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>

          {showStatusMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
              <div className="py-1">
                <button
                  onClick={() => handleStatusChange('open')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Circle className="h-3 w-3 fill-current text-green-600" />
                  対応中にする
                </button>
                <button
                  onClick={() => handleStatusChange('resolved')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Circle className="h-3 w-3 fill-current text-blue-600" />
                  解決済にする
                </button>
                <button
                  onClick={() => handleStatusChange('closed')}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Circle className="h-3 w-3 fill-current text-gray-600" />
                  クローズする
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-muted-foreground">読み込み中...</div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center p-4">
            <div className="text-sm text-destructive">{error}</div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId || undefined}
            isAdminView={true}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </div>

      {/* 入力エリア */}
      <div className="border-t p-4 bg-white">
        {error && (
          <div className="mb-2 text-xs text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            <div className="font-semibold mb-1">エラー</div>
            <div>{error}</div>
          </div>
        )}

        {/* 編集モード */}
        {editingMessageId && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-900">メッセージを編集中</span>
              <button
                onClick={() => {
                  setEditingMessageId(null)
                  setEditingMessageText('')
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                キャンセル
              </button>
            </div>
            <div className="flex gap-2">
              <textarea
                value={editingMessageText}
                onChange={(e) => setEditingMessageText(e.target.value)}
                className="flex-1 resize-none rounded-md border border-blue-300 bg-white px-3 py-2 text-sm min-h-[60px]"
                placeholder="編集内容を入力..."
              />
              <button
                onClick={handleSubmitEdit}
                disabled={!editingMessageText.trim()}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-md',
                  'bg-blue-600 text-white hover:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors'
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className={cn(
              'flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[40px] max-h-[400px]'
            )}
            disabled={isSending}
            style={{ height: '40px' }}
          />
          <button
            type="button"
            onClick={handleGenerateAIReply}
            disabled={isGeneratingAI || isSending || messages.length === 0}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md',
              'bg-purple-600 text-white',
              'hover:bg-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
            aria-label="AI返信"
            title="AIで返信を生成"
          >
            {isGeneratingAI ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </button>
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md',
              'bg-orange-600 text-white',
              'hover:bg-orange-700',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
            aria-label="送信"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-2 text-xs text-muted-foreground">
          <span>Cmd+Enterで送信 / Enterで改行</span>
          {inputValue.length > 0 && (
            <span className="ml-2">
              {inputValue.length}/2000
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
