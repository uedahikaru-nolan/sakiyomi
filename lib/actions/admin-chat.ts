'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

/**
 * 運営者権限チェック
 */
async function requireAdmin() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    throw new Error('管理者権限が必要です')
  }

  return { user, supabase }
}

/**
 * チャットルーム一覧を取得（運営者用）
 */
export async function getChatRoomsList(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
}) {
  try {
    const { supabase } = await requireAdmin()

    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    // クエリ構築
    let query = supabase
      .from('chat_rooms')
      .select(`
        *,
        user:users!user_id(id, name, email, avatar_url),
        messages:chat_messages(count)
      `, { count: 'exact' })

    // ステータスフィルタ
    if (params?.status && params.status !== 'all') {
      query = query.eq('status', params.status)
    }

    // ユーザー名検索
    if (params?.search) {
      query = query.ilike('user.name', `%${params.search}%`)
    }

    // ソート
    query = query.order('last_message_at', { ascending: false, nullsFirst: false })

    // ページネーション
    query = query.range(offset, offset + limit - 1)

    const { data: rooms, error, count } = await query

    if (error) {
      console.error('Failed to fetch chat rooms:', error)
      return { error: 'チャットルーム一覧の取得に失敗しました' }
    }

    // 各ルームの未読メッセージ数と最後のメッセージを取得
    const roomsWithUnread = await Promise.all(
      (rooms || []).map(async (room) => {
        // 未読メッセージ数を取得
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_room_id', room.id)
          .eq('is_read', false)
          .neq('sender_id', room.user_id)

        // 最後のメッセージを取得
        const { data: lastMessage } = await supabase
          .from('chat_messages')
          .select('message, created_at')
          .eq('chat_room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...room,
          unread_count: unreadCount || 0,
          last_message: lastMessage?.message || null,
          last_message_at: lastMessage?.created_at || room.last_message_at,
        }
      })
    )

    return {
      rooms: roomsWithUnread,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    console.error('Error in getChatRoomsList:', error)
    return { error: 'チャットルーム一覧の取得に失敗しました' }
  }
}

/**
 * チャットルーム詳細を取得
 */
export async function getChatRoomDetails(roomId: string) {
  try {
    const { supabase } = await requireAdmin()

    const { data: room, error } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        user:users!user_id(id, name, email, avatar_url, created_at)
      `)
      .eq('id', roomId)
      .single()

    if (error || !room) {
      console.error('Failed to fetch chat room:', error)
      return { error: 'チャットルームが見つかりません' }
    }

    // メッセージ数を取得
    const { count: messageCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_room_id', roomId)

    // 未読メッセージ数を取得
    const { count: unreadCount } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_room_id', roomId)
      .eq('is_read', false)
      .neq('sender_id', room.user_id)

    return {
      room: {
        ...room,
        message_count: messageCount || 0,
        unread_count: unreadCount || 0,
      },
    }
  } catch (error) {
    console.error('Error in getChatRoomDetails:', error)
    return { error: 'チャットルーム詳細の取得に失敗しました' }
  }
}

/**
 * チャットルームのステータスを更新
 */
export async function updateChatRoomStatus(roomId: string, status: 'open' | 'resolved' | 'closed') {
  try {
    const { supabase } = await requireAdmin()

    // バリデーション
    if (!['open', 'resolved', 'closed'].includes(status)) {
      return { error: '無効なステータスです' }
    }

    const { error } = await supabase
      .from('chat_rooms')
      .update({ status })
      .eq('id', roomId)

    if (error) {
      console.error('Failed to update chat room status:', error)
      return { error: 'ステータスの更新に失敗しました' }
    }

    revalidatePath('/admin/chats')
    return { success: true }
  } catch (error) {
    console.error('Error in updateChatRoomStatus:', error)
    return { error: 'ステータスの更新に失敗しました' }
  }
}

/**
 * チャット統計情報を取得
 */
export async function getChatStats() {
  try {
    const { supabase } = await requireAdmin()

    // 総チャットルーム数
    const { count: totalRooms } = await supabase
      .from('chat_rooms')
      .select('*', { count: 'exact', head: true })

    // オープンなチャットルーム数
    const { count: openRooms } = await supabase
      .from('chat_rooms')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')

    // 総メッセージ数
    const { count: totalMessages } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })

    // 未返信のチャットルーム数（最終メッセージが運営者以外）
    const { data: unrepliedRooms } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        user_id,
        messages:chat_messages(sender_id, created_at)
      `)
      .eq('status', 'open')
      .order('created_at', { foreignTable: 'messages', ascending: false })

    let unrepliedCount = 0
    for (const room of unrepliedRooms || []) {
      const lastMessage = room.messages?.[0]
      if (lastMessage && lastMessage.sender_id === room.user_id) {
        unrepliedCount++
      }
    }

    // 今日のメッセージ数
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayMessages } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    return {
      stats: {
        totalRooms: totalRooms || 0,
        openRooms: openRooms || 0,
        totalMessages: totalMessages || 0,
        unrepliedRooms: unrepliedCount,
        todayMessages: todayMessages || 0,
      },
    }
  } catch (error) {
    console.error('Error in getChatStats:', error)
    return { error: '統計情報の取得に失敗しました' }
  }
}
