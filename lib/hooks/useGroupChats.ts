'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGroupChatsList } from '@/lib/actions/group-chat'
import { logger } from '@/lib/utils/logger'

interface GroupChat {
  id: string
  name: string
  description: string | null
  created_by: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  members_count: number
  last_message: string | null
  last_message_sender: string | null
  unread_count: number
}

export function useGroupChats() {
  const [groups, setGroups] = useState<GroupChat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // グループ一覧を取得
  const fetchGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const result = await getGroupChatsList()

    if (result.error) {
      setError(result.error)
    } else if (result.groups) {
      setGroups(result.groups)
    }

    setIsLoading(false)
  }, [])

  // デバウンス付きのfetchGroups（2秒間新しいイベントがなければ実行）
  const debouncedFetchGroups = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchGroups()
    }, 2000)
  }, [fetchGroups])

  // 初回読み込み
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // Realtime購読で新しいメッセージやメンバー変更を監視
  useEffect(() => {
    const supabase = createClient()

    logger.log('[useGroupChats] Setting up Realtime subscription')

    const channel = supabase
      .channel('group-chats-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_messages',
        },
        async (payload) => {
          logger.log('[useGroupChats] New message received:', payload.new)

          // メッセージが送信されたグループの情報を更新
          const newMessage = payload.new as any

          setGroups(prevGroups => {
            return prevGroups.map(group => {
              if (group.id === newMessage.group_chat_id) {
                return {
                  ...group,
                  last_message_at: newMessage.created_at,
                  // メッセージ内容は再取得で更新されるため、ここではタイムスタンプのみ更新
                }
              }
              return group
            }).sort((a, b) => {
              // 最新メッセージが上に来るようにソート
              const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
              const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
              return bTime - aTime
            })
          })

          // 詳細情報を再取得（未読数など）- デバウンス付きで実行
          debouncedFetchGroups()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chats',
        },
        (payload) => {
          logger.log('[useGroupChats] New group created:', payload.new)
          // 新しいグループが作成されたら一覧を再取得
          fetchGroups()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_chat_members',
        },
        (payload) => {
          logger.log('[useGroupChats] Member added:', payload.new)
          // メンバーが追加されたら一覧を再取得
          fetchGroups()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'group_chat_members',
        },
        (payload) => {
          logger.log('[useGroupChats] Member removed:', payload.old)
          // メンバーが削除されたら一覧を再取得
          fetchGroups()
        }
      )
      .subscribe((status) => {
        logger.log('[useGroupChats] Subscription status:', status)
      })

    return () => {
      logger.log('[useGroupChats] Cleaning up Realtime subscription')
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [fetchGroups, debouncedFetchGroups])

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
  }
}
