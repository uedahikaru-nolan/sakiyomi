'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getGroupChatMessages,
  sendGroupMessage as sendGroupMessageAction,
  markGroupMessagesAsRead,
} from '@/lib/actions/group-chat'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface GroupChatMessage {
  id: string
  group_chat_id: string
  sender_id: string
  message: string
  created_at: string
  updated_at: string
  sender: {
    id: string
    name: string
    avatar_url: string | null
    role: string
  }
}

export function useGroupChatMessages(groupChatId: string | null) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // メッセージ取得
  const fetchMessages = useCallback(async () => {
    if (!groupChatId) return

    setIsLoading(true)
    setError(null)

    const result = await getGroupChatMessages(groupChatId)

    if (result.error) {
      setError(result.error)
    } else if (result.messages) {
      setMessages(result.messages)
    }

    setIsLoading(false)
  }, [groupChatId])

  // 初回読み込み
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Realtime購読
  useEffect(() => {
    if (!groupChatId) return

    const supabase = createClient()

    console.log('[Realtime] Setting up channel for group:', groupChatId)

    // チャンネルを作成
    const channel = supabase
      .channel(`group-chat-${groupChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages',
          filter: `group_chat_id=eq.${groupChatId}`,
        },
        async (payload) => {
          console.log('[Realtime] New group message received:', payload.new.id)

          // 新しいメッセージを取得して追加
          const { data: newMessageData, error } = await supabase
            .from('group_chat_messages')
            .select(`
              *,
              sender:users!sender_id(id, name, avatar_url, role)
            `)
            .eq('id', payload.new.id)
            .single()

          if (error) {
            console.error('[Realtime] Error fetching message:', error)
            return
          }

          if (newMessageData) {
            console.log('[Realtime] Adding message to list:', newMessageData.id)
            setMessages((prev) => {
              // 重複チェック
              const exists = prev.some(msg => msg.id === newMessageData.id)
              if (exists) {
                console.log('[Realtime] Message already exists, skipping')
                return prev
              }
              return [...prev, newMessageData as GroupChatMessage]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_chat_messages',
          filter: `group_chat_id=eq.${groupChatId}`,
        },
        (payload) => {
          console.log('[Realtime] Group message updated:', payload.new.id)
          // メッセージの更新
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } as GroupChatMessage : msg
            )
          )
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status)
      })

    channelRef.current = channel

    return () => {
      console.log('[Realtime] Cleaning up channel')
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [groupChatId])

  // メッセージ送信
  const sendMessage = async (message: string) => {
    if (!groupChatId) {
      console.error('No group chat ID provided')
      return false
    }

    setIsSending(true)
    setError(null)

    try {
      console.log('Sending group message:', { groupChatId, messageLength: message.length })
      const result = await sendGroupMessageAction(groupChatId, message)

      console.log('Send group message result:', result)

      if (result.error) {
        console.error('Group message send error:', result.error)
        setError(result.error)
        setIsSending(false)
        return false
      }

      // 送信成功したら即座にメッセージをリストに追加（楽観的更新）
      if (result.message) {
        console.log('Adding group message to list immediately')
        setMessages((prev) => {
          // 既に同じIDのメッセージがある場合は追加しない（重複防止）
          const exists = prev.some(msg => msg.id === result.message.id)
          if (exists) {
            console.log('Group message already exists, skipping')
            return prev
          }
          return [...prev, result.message as GroupChatMessage]
        })
      }

      setIsSending(false)
      return true
    } catch (err) {
      console.error('Unexpected error sending group message:', err)
      setError('メッセージの送信中に予期しないエラーが発生しました')
      setIsSending(false)
      return false
    }
  }

  // 既読処理
  const markAsRead = async () => {
    if (!groupChatId) return

    await markGroupMessagesAsRead(groupChatId)
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
