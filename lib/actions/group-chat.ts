'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/utils/get-user'

/**
 * 管理者権限チェック
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
 * グループチャットを作成
 */
export async function createGroupChat(
  name: string,
  description: string | null,
  userIds: string[]
) {
  try {
    const { user, supabase } = await requireAdmin()

    // バリデーション
    if (!name || name.trim().length === 0) {
      return { error: 'グループ名を入力してください' }
    }

    if (name.length > 100) {
      return { error: 'グループ名は100文字以内で入力してください' }
    }

    if (!userIds || userIds.length === 0) {
      return { error: '最低1人のメンバーを選択してください' }
    }

    // グループチャットを作成
    const { data: groupChat, error: groupError } = await supabase
      .from('group_chats')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError || !groupChat) {
      console.error('Failed to create group chat:', groupError)
      return { error: 'グループチャットの作成に失敗しました' }
    }

    // メンバーを追加
    const members = userIds.map(userId => ({
      group_chat_id: groupChat.id,
      user_id: userId,
    }))

    const { error: membersError } = await supabase
      .from('group_chat_members')
      .insert(members)

    if (membersError) {
      console.error('Failed to add members:', membersError)
      // グループは作成されたが、メンバー追加に失敗した場合はグループを削除
      await supabase.from('group_chats').delete().eq('id', groupChat.id)
      return { error: 'メンバーの追加に失敗しました' }
    }

    revalidatePath('/admin/group-chats')
    revalidatePath('/dashboard/group-chats')

    return { groupChat, success: true }
  } catch (error) {
    console.error('Error in createGroupChat:', error)
    return { error: 'グループチャットの作成に失敗しました' }
  }
}

/**
 * ユーザーが参加しているグループチャット一覧を取得
 */
export async function getGroupChatsList() {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // ユーザーが参加しているグループを取得
    const { data: memberGroups, error: memberError } = await supabase
      .from('group_chat_members')
      .select('group_chat_id')
      .eq('user_id', user.id)

    if (memberError) {
      console.error('Failed to fetch member groups:', memberError)
      return { error: 'グループチャット一覧の取得に失敗しました' }
    }

    const groupIds = memberGroups?.map(m => m.group_chat_id) || []

    if (groupIds.length === 0) {
      return { groups: [] }
    }

    // グループの詳細情報を取得
    const { data: groups, error: groupsError } = await supabase
      .from('group_chats')
      .select(`
        *,
        creator:users!created_by(id, name, avatar_url)
      `)
      .in('id', groupIds)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (groupsError) {
      console.error('Failed to fetch groups:', groupsError)
      return { error: 'グループチャット一覧の取得に失敗しました' }
    }

    // 各グループのメンバー数、最後のメッセージ、未読数を取得
    const groupsWithDetails = await Promise.all(
      (groups || []).map(async (group) => {
        // メンバー数を取得
        const { count: memberCount } = await supabase
          .from('group_chat_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_chat_id', group.id)

        // 最後のメッセージを取得
        const { data: lastMessage } = await supabase
          .from('group_chat_messages')
          .select('message, created_at, sender:users!sender_id(name)')
          .eq('group_chat_id', group.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // 未読数を取得（last_read_at以降のメッセージ数）
        const { data: memberData } = await supabase
          .from('group_chat_members')
          .select('last_read_at')
          .eq('group_chat_id', group.id)
          .eq('user_id', user.id)
          .single()

        let unreadCount = 0
        if (memberData) {
          const { count } = await supabase
            .from('group_chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('group_chat_id', group.id)
            .neq('sender_id', user.id)
            .gt('created_at', memberData.last_read_at || '1970-01-01')

          unreadCount = count || 0
        }

        return {
          ...group,
          members_count: memberCount || 0,
          last_message: lastMessage?.message || null,
          last_message_sender: lastMessage?.sender?.name || null,
          last_message_at: lastMessage?.created_at || group.last_message_at,
          unread_count: unreadCount,
        }
      })
    )

    return { groups: groupsWithDetails }
  } catch (error) {
    console.error('Error in getGroupChatsList:', error)
    return { error: 'グループチャット一覧の取得に失敗しました' }
  }
}

/**
 * グループチャットの詳細情報を取得
 */
export async function getGroupChatDetails(groupChatId: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // グループの基本情報を取得
    const { data: group, error: groupError } = await supabase
      .from('group_chats')
      .select(`
        *,
        creator:users!created_by(id, name, email, avatar_url)
      `)
      .eq('id', groupChatId)
      .single()

    if (groupError || !group) {
      console.error('Failed to fetch group:', groupError)
      return { error: 'グループチャットが見つかりません' }
    }

    // メンバー一覧を取得
    const { data: members, error: membersError } = await supabase
      .from('group_chat_members')
      .select(`
        *,
        user:users!user_id(id, name, email, avatar_url, role)
      `)
      .eq('group_chat_id', groupChatId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Failed to fetch members:', membersError)
      return { error: 'メンバー情報の取得に失敗しました' }
    }

    // メッセージ数を取得
    const { count: messageCount } = await supabase
      .from('group_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('group_chat_id', groupChatId)

    return {
      group: {
        ...group,
        members: members || [],
        message_count: messageCount || 0,
      },
    }
  } catch (error) {
    console.error('Error in getGroupChatDetails:', error)
    return { error: 'グループチャット詳細の取得に失敗しました' }
  }
}

/**
 * グループにメンバーを追加
 */
export async function addGroupMembers(groupChatId: string, userIds: string[]) {
  try {
    const { supabase } = await requireAdmin()

    if (!userIds || userIds.length === 0) {
      return { error: '追加するメンバーを選択してください' }
    }

    // グループが存在するか確認
    const { data: group } = await supabase
      .from('group_chats')
      .select('id')
      .eq('id', groupChatId)
      .single()

    if (!group) {
      return { error: 'グループチャットが見つかりません' }
    }

    // 既存のメンバーを取得
    const { data: existingMembers } = await supabase
      .from('group_chat_members')
      .select('user_id')
      .eq('group_chat_id', groupChatId)

    const existingUserIds = existingMembers?.map(m => m.user_id) || []

    // 新しいメンバーのみをフィルタリング
    const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId))

    if (newUserIds.length === 0) {
      return { error: '選択されたユーザーは既にメンバーです' }
    }

    // メンバーを追加
    const members = newUserIds.map(userId => ({
      group_chat_id: groupChatId,
      user_id: userId,
    }))

    const { error: insertError } = await supabase
      .from('group_chat_members')
      .insert(members)

    if (insertError) {
      console.error('Failed to add members:', insertError)
      return { error: 'メンバーの追加に失敗しました' }
    }

    revalidatePath('/admin/group-chats')
    revalidatePath(`/admin/group-chats/${groupChatId}`)
    revalidatePath('/dashboard/group-chats')

    return { success: true, addedCount: newUserIds.length }
  } catch (error) {
    console.error('Error in addGroupMembers:', error)
    return { error: 'メンバーの追加に失敗しました' }
  }
}

/**
 * グループからメンバーを削除
 */
export async function removeGroupMember(groupChatId: string, userId: string) {
  try {
    const { supabase } = await requireAdmin()

    const { error: deleteError } = await supabase
      .from('group_chat_members')
      .delete()
      .eq('group_chat_id', groupChatId)
      .eq('user_id', userId)

    if (deleteError) {
      console.error('Failed to remove member:', deleteError)
      return { error: 'メンバーの削除に失敗しました' }
    }

    revalidatePath('/admin/group-chats')
    revalidatePath(`/admin/group-chats/${groupChatId}`)
    revalidatePath('/dashboard/group-chats')

    return { success: true }
  } catch (error) {
    console.error('Error in removeGroupMember:', error)
    return { error: 'メンバーの削除に失敗しました' }
  }
}

/**
 * グループチャットのメッセージを取得
 */
export async function getGroupChatMessages(
  groupChatId: string,
  limit = 50,
  before?: string
) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // メンバー権限チェック
    const { data: member } = await supabase
      .from('group_chat_members')
      .select('id')
      .eq('group_chat_id', groupChatId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return { error: 'このグループチャットにアクセスする権限がありません' }
    }

    // メッセージを取得
    let query = supabase
      .from('group_chat_messages')
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .eq('group_chat_id', groupChatId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Failed to fetch messages:', error)
      return { error: 'メッセージの取得に失敗しました' }
    }

    // 新しい順から古い順に並び替え
    const sortedMessages = (messages || []).reverse()

    return { messages: sortedMessages }
  } catch (error) {
    console.error('Error in getGroupChatMessages:', error)
    return { error: 'メッセージの取得に失敗しました' }
  }
}

/**
 * グループチャットにメッセージを送信
 */
export async function sendGroupMessage(groupChatId: string, message: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // バリデーション
    if (!message || message.trim().length === 0) {
      return { error: 'メッセージを入力してください' }
    }

    if (message.length > 2000) {
      return { error: 'メッセージは2000文字以内で入力してください' }
    }

    // メンバー権限チェック
    const { data: member } = await supabase
      .from('group_chat_members')
      .select('id')
      .eq('group_chat_id', groupChatId)
      .eq('user_id', user.id)
      .single()

    if (!member) {
      return { error: 'このグループチャットにメッセージを送信する権限がありません' }
    }

    // メッセージを送信
    const { data: newMessage, error: insertError } = await supabase
      .from('group_chat_messages')
      .insert({
        group_chat_id: groupChatId,
        sender_id: user.id,
        message: message.trim(),
      })
      .select(`
        *,
        sender:users!sender_id(id, name, avatar_url, role)
      `)
      .single()

    if (insertError || !newMessage) {
      console.error('Failed to send message:', insertError)
      return { error: 'メッセージの送信に失敗しました' }
    }

    return { message: newMessage, success: true }
  } catch (error) {
    console.error('Error in sendGroupMessage:', error)
    return { error: 'メッセージの送信に失敗しました' }
  }
}

/**
 * グループチャットの未読メッセージ数を取得
 */
export async function getGroupUnreadCount(groupChatId: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // last_read_atを取得
    const { data: memberData } = await supabase
      .from('group_chat_members')
      .select('last_read_at')
      .eq('group_chat_id', groupChatId)
      .eq('user_id', user.id)
      .single()

    if (!memberData) {
      return { count: 0 }
    }

    // last_read_at以降の未読メッセージ数を取得
    const { count } = await supabase
      .from('group_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('group_chat_id', groupChatId)
      .neq('sender_id', user.id)
      .gt('created_at', memberData.last_read_at || '1970-01-01')

    return { count: count || 0 }
  } catch (error) {
    console.error('Error in getGroupUnreadCount:', error)
    return { count: 0 }
  }
}

/**
 * グループチャットのメッセージを既読にする
 */
export async function markGroupMessagesAsRead(groupChatId: string) {
  try {
    const user = await requireUser()
    const supabase = await createClient()

    // last_read_atを現在時刻に更新
    const { error } = await supabase
      .from('group_chat_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('group_chat_id', groupChatId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Failed to mark messages as read:', error)
      return { error: '既読処理に失敗しました' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in markGroupMessagesAsRead:', error)
    return { error: '既読処理に失敗しました' }
  }
}

/**
 * 全ユーザーリストを取得（Admin用）
 */
export async function getAllUsers() {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, role')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to fetch users:', error)
      return { error: 'ユーザー一覧の取得に失敗しました' }
    }

    return { users: users || [] }
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    return { error: 'ユーザー一覧の取得に失敗しました' }
  }
}
