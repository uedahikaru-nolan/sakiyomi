'use client'

import { useState, useEffect, useCallback } from 'react'
import { createOrGetChatRoom, getUnreadCount } from '@/lib/actions/chat'
import { createClient } from '@/lib/supabase/client'

interface ChatRoom {
  id: string
  user_id: string
  status: string
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export function useChat() {
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // チャットルームを取得
  useEffect(() => {
    async function fetchChatRoom() {
      setIsLoading(true)
      setError(null)

      const result = await createOrGetChatRoom()

      if (result.error) {
        setError(result.error)
      } else if (result.chatRoom) {
        setChatRoom(result.chatRoom)
      }

      setIsLoading(false)
    }

    fetchChatRoom()
  }, [])

  // 未読件数を取得する関数
  const fetchUnreadCount = useCallback(async () => {
    const result = await getUnreadCount()
    if (result.count !== undefined) {
      setUnreadCount(result.count)
    }
  }, [])

  // 初回の未読件数取得
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // Realtime購読で未読件数をリアルタイム更新
  useEffect(() => {
    if (!chatRoom) return

    const supabase = createClient()

    console.log('[useChat] Setting up Realtime subscription for room:', chatRoom.id)

    const channel = supabase
      .channel(`chat-unread-${chatRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoom.id}`,
        },
        async (payload) => {
          console.log('[useChat] New message received:', payload.new)

          // 自分が送ったメッセージでなければ未読数を更新
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()

          if (user && payload.new.sender_id !== user.id) {
            console.log('[useChat] Message from other user, updating unread count')
            // チャットが開いていなければ未読数を増やす
            if (!isOpen) {
              setUnreadCount(prev => prev + 1)
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoom.id}`,
        },
        (payload) => {
          console.log('[useChat] Message updated:', payload.new)
          // 既読になった場合は未読数を再取得
          if (payload.new.is_read) {
            fetchUnreadCount()
          }
        }
      )
      .subscribe((status) => {
        console.log('[useChat] Subscription status:', status)
      })

    return () => {
      console.log('[useChat] Cleaning up Realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [chatRoom, isOpen, fetchUnreadCount])

  const openChat = () => {
    setIsOpen(true)
    // チャットを開いたら未読数を0にリセット
    setUnreadCount(0)
  }

  const closeChat = () => setIsOpen(false)

  const refreshUnreadCount = async () => {
    const result = await getUnreadCount()
    if (result.count !== undefined) {
      setUnreadCount(result.count)
    }
  }

  return {
    chatRoom,
    isLoading,
    error,
    isOpen,
    unreadCount,
    openChat,
    closeChat,
    refreshUnreadCount,
  }
}
