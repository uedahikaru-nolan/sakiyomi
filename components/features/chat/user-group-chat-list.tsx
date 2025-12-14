'use client'

import { useGroupChats } from '@/lib/hooks/useGroupChats'
import { Users, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface GroupChat {
  id: string
  name: string
  description: string | null
  created_by: string
  last_message_at: string | null
  created_at: string
  updated_at: string
  member_count?: number
  unread_count?: number
  last_message?: string
}

interface UserGroupChatListProps {
  groups: GroupChat[]
  selectedGroupId: string | null
  onGroupSelect: (groupId: string) => void
}

export function UserGroupChatList({
  groups: initialGroups,
  selectedGroupId,
  onGroupSelect,
}: UserGroupChatListProps) {
  const { groups: realtimeGroups } = useGroupChats(initialGroups)
  const [searchQuery, setSearchQuery] = useState('')

  // 検索フィルター
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return realtimeGroups
    }

    const query = searchQuery.toLowerCase()
    return realtimeGroups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query)
    )
  }, [realtimeGroups, searchQuery])

  // 最終メッセージ日時でソート
  const sortedGroups = useMemo(() => {
    return [...filteredGroups].sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
      return bTime - aTime
    })
  }, [filteredGroups])

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col overflow-hidden">
      {/* ヘッダー */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">グループチャット</h2>
          <span className="text-sm text-muted-foreground">
            {realtimeGroups.length}件
          </span>
        </div>

        {/* 検索バー */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="グループを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* グループリスト */}
      <div className="flex-1 overflow-y-auto">
        {sortedGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? '検索結果が見つかりませんでした'
                : 'まだグループチャットに参加していません'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {sortedGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => onGroupSelect(group.id)}
                className={cn(
                  'w-full p-4 text-left transition-colors hover:bg-orange-50',
                  selectedGroupId === group.id && 'bg-orange-50 border-l-4 border-orange-600'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* グループアイコン */}
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                    <Users className="h-6 w-6" />
                  </div>

                  {/* グループ情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {group.name}
                      </h3>
                      {group.last_message_at && (
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(group.last_message_at), {
                            addSuffix: true,
                            locale: ja,
                          })}
                        </span>
                      )}
                    </div>

                    {/* 最終メッセージまたは説明 */}
                    {group.last_message ? (
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {group.last_message}
                      </p>
                    ) : group.description ? (
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {group.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic mb-1">
                        メッセージはまだありません
                      </p>
                    )}

                    {/* メンバー数と未読バッジ */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{group.member_count || 0}人</span>
                      </div>

                      {group.unread_count && group.unread_count > 0 && (
                        <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          {group.unread_count > 99 ? '99+' : group.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
