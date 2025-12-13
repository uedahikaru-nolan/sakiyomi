'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

/**
 * チャットルームを取得または作成
 * ユーザーごとに1つのチャットルームを自動作成
 */
export async function createOrGetChatRoom() {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // 既存のチャットルームを確認
    const { data: existingRoom, error: fetchError } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existingRoom) {
      return { chatRoom: existingRoom }
    }

    // チャットルームが存在しない場合は作成
    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({
        user_id: user.id,
        status: 'open',
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create chat room:', createError)
      return { error: 'チャットルームの作成に失敗しました' }
    }

    return { chatRoom: newRoom }
  } catch (error) {
    console.error('Error in createOrGetChatRoom:', error)
    return { error: 'チャットルームの取得に失敗しました' }
  }
}

/**
 * チャットメッセージ一覧を取得
 */
export async function getChatMessages(roomId: string, limit = 50, before?: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // チャットルームへのアクセス権限を確認
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('id, user_id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return { error: 'チャットルームが見つかりません' }
    }

    // ユーザーは自分のチャットルームのみ、運営者は全てのルームにアクセス可能
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin'
    if (!isAdmin && room.user_id !== user.id) {
      return { error: 'このチャットルームにアクセスする権限がありません' }
    }

    // メッセージ取得クエリ
    let query = supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .eq('chat_room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    // ページネーション用
    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Failed to fetch messages:', error)
      return { error: 'メッセージの取得に失敗しました' }
    }

    // 古い順に並び替え（表示用）
    const sortedMessages = messages?.reverse() || []

    return { messages: sortedMessages }
  } catch (error) {
    console.error('Error in getChatMessages:', error)
    return { error: 'メッセージの取得に失敗しました' }
  }
}

/**
 * メッセージを送信
 */
export async function sendMessage(roomId: string, message: string) {
  try {
    console.log('[sendMessage] Starting:', { roomId, messageLength: message.length })

    const user = await requireUser()
    console.log('[sendMessage] User:', { userId: user.id })

    const supabase = await createClient()

    // バリデーション
    const trimmedMessage = message.trim()
    if (!trimmedMessage) {
      console.log('[sendMessage] Validation error: Empty message')
      return { error: 'メッセージを入力してください' }
    }
    if (trimmedMessage.length > 2000) {
      console.log('[sendMessage] Validation error: Message too long')
      return { error: 'メッセージは2000文字以内で入力してください' }
    }

    // チャットルームの存在確認
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .select('id, user_id')
      .eq('id', roomId)
      .single()

    console.log('[sendMessage] Room check:', { room, roomError })

    if (roomError || !room) {
      console.error('[sendMessage] Room not found:', roomError)
      return { error: 'チャットルームが見つかりません' }
    }

    // アクセス権限確認
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('[sendMessage] User data:', { userData, userError })

    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin'
    if (!isAdmin && room.user_id !== user.id) {
      console.error('[sendMessage] Permission denied:', { isAdmin, roomUserId: room.user_id, currentUserId: user.id })
      return { error: 'このチャットルームにメッセージを送信する権限がありません' }
    }

    // メッセージ送信
    console.log('[sendMessage] Attempting to insert message...')
    const { data: newMessage, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        chat_room_id: roomId,
        sender_id: user.id,
        message: trimmedMessage,
        is_read: false,
      })
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .single()

    if (insertError) {
      console.error('[sendMessage] Insert error:', insertError)
      return { error: `メッセージの送信に失敗しました: ${insertError.message}` }
    }

    console.log('[sendMessage] Message sent successfully:', newMessage?.id)
    revalidatePath('/admin/chats')
    return { message: newMessage }
  } catch (error) {
    console.error('[sendMessage] Unexpected error:', error)
    return { error: `メッセージの送信に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}` }
  }
}

/**
 * メッセージを既読にする
 */
export async function markMessagesAsRead(roomId: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // チャットルームの存在確認
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('id, user_id')
      .eq('id', roomId)
      .single()

    if (!room) {
      return { error: 'チャットルームが見つかりません' }
    }

    // 自分以外が送信した未読メッセージを既読にする
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('chat_room_id', roomId)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    if (error) {
      console.error('Failed to mark messages as read:', error)
      return { error: '既読処理に失敗しました' }
    }

    revalidatePath('/admin/chats')
    return { success: true }
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error)
    return { error: '既読処理に失敗しました' }
  }
}

/**
 * 未読メッセージ数を取得
 */
export async function getUnreadCount() {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // ユーザーのチャットルームを取得
    const { data: room } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!room) {
      return { count: 0 }
    }

    // 自分以外が送信した未読メッセージをカウント
    const { count, error } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('chat_room_id', room.id)
      .eq('is_read', false)
      .neq('sender_id', user.id)

    if (error) {
      console.error('Failed to get unread count:', error)
      return { count: 0 }
    }

    return { count: count || 0 }
  } catch (error) {
    console.error('Error in getUnreadCount:', error)
    return { count: 0 }
  }
}
