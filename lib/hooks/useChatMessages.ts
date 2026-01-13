'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getChatMessages, sendMessage as sendMessageAction, markMessagesAsRead } from '@/lib/actions/chat'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

interface ChatMessage {
  id: string
  chat_room_id: string
  sender_id: string
  message: string
  is_read: boolean
  created_at: string
  updated_at: string
  sender: {
    id: string
    name: string
    avatar_url: string | null
    role: string
  }
}

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // メッセージ取得
  const fetchMessages = useCallback(async () => {
    if (!roomId) return

    setIsLoading(true)
    setError(null)

    const result = await getChatMessages(roomId)

    if (result.error) {
      setError(result.error)
    } else if (result.messages) {
      setMessages(result.messages)
    }

    setIsLoading(false)
  }, [roomId])

  // 初回読み込み
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Realtime購読
  useEffect(() => {
    if (!roomId) return

    const supabase = createClient()

    logger.log('[Realtime] Setting up channel for room:', roomId)

    // チャンネルを作成
    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async (payload) => {
          logger.log('[Realtime] New message received:', payload.new.id)

          // 既にリストに存在するかチェック（楽観的更新で追加済みの場合）
          setMessages((prev) => {
            const exists = prev.some(msg => msg.id === payload.new.id)
            if (exists) {
              logger.log('[Realtime] Message already exists, skipping query')
              return prev
            }

            // 存在しない場合のみ、sender情報を取得
            ;(async () => {
              const { data: newMessageData, error } = await supabase
                .from('chat_messages')
                .select(`
                  *,
                  sender:users!sender_id(id, name, avatar_url, role)
                `)
                .eq('id', payload.new.id)
                .single()

              if (error) {
                logger.error('[Realtime] Error fetching message:', error)
                return
              }

              if (newMessageData) {
                logger.log('[Realtime] Adding message to list:', newMessageData.id)
                setMessages((prev) => {
                  // 再度重複チェック（非同期処理のため）
                  const exists = prev.some(msg => msg.id === newMessageData.id)
                  if (exists) {
                    return prev
                  }
                  return [...prev, newMessageData as ChatMessage]
                })
              }
            })()

            return prev
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        (payload) => {
          logger.log('[Realtime] Message updated:', payload.new.id)
          // メッセージの更新（既読など）
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } as ChatMessage : msg
            )
          )
        }
      )
      .subscribe((status) => {
        logger.log('[Realtime] Subscription status:', status)
      })

    channelRef.current = channel

    return () => {
      logger.log('[Realtime] Cleaning up channel')
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [roomId])

  // メッセージ送信
  const sendMessage = async (message: string) => {
    if (!roomId) {
      logger.error('No room ID provided')
      return false
    }

    setIsSending(true)
    setError(null)

    try {
      logger.log('Sending message:', { roomId, messageLength: message.length })
      const result = await sendMessageAction(roomId, message)

      logger.log('Send message result:', result)

      if (result.error) {
        logger.error('Message send error:', result.error)
        setError(result.error)
        setIsSending(false)
        return false
      }

      // 送信成功したら即座にメッセージをリストに追加（楽観的更新）
      if (result.message) {
        logger.log('Adding message to list immediately')
        setMessages((prev) => {
          // 既に同じIDのメッセージがある場合は追加しない（重複防止）
          const exists = prev.some(msg => msg.id === result.message.id)
          if (exists) {
            logger.log('Message already exists, skipping')
            return prev
          }
          return [...prev, result.message as ChatMessage]
        })
      }

      setIsSending(false)
      return true
    } catch (err) {
      logger.error('Unexpected error sending message:', err)
      setError('メッセージの送信中に予期しないエラーが発生しました')
      setIsSending(false)
      return false
    }
  }

  // 既読処理
  const markAsRead = async () => {
    if (!roomId) return

    await markMessagesAsRead(roomId)
  }

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  }
}
