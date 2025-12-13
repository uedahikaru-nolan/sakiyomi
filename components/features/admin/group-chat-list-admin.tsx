'use client'

import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Users, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface GroupChat {
  id: string
  name: string
  description: string | null
  members_count: number
  last_message: string | null
  last_message_sender: string | null
  last_message_at: string | null
  unread_count: number
  created_at: string
}

interface GroupChatListAdminProps {
  groups: GroupChat[]
  onSelectGroup?: (groupId: string) => void
  selectedGroupId?: string
}

export function GroupChatListAdmin({ groups, onSelectGroup, selectedGroupId }: GroupChatListAdminProps) {
  if (groups.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          グループチャットがありません
        </h3>
        <p className="text-sm text-muted-foreground">
          「グループ作成」ボタンから最初のグループチャットを作成しましょう
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {groups.map(group => (
        <button
          key={group.id}
          onClick={() => onSelectGroup?.(group.id)}
          className={cn(
            'w-full p-3 text-left transition-colors rounded-md',
            'hover:bg-gray-50',
            selectedGroupId === group.id && 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-600'
          )}
        >
          <div className="flex items-start gap-3">
            {/* グループアイコン */}
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                <Users className="h-5 w-5" />
              </div>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm truncate">
                  {group.name}
                </div>
                {group.last_message_at && (
                  <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {formatDistanceToNow(new Date(group.last_message_at), {
                      addSuffix: false,
                      locale: ja,
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className="text-xs text-muted-foreground truncate flex-1">
                  {group.last_message || 'メッセージはまだありません'}
                </div>
                {group.unread_count > 0 && (
                  <div className="flex-shrink-0 flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-semibold">
                    {group.unread_count > 9 ? '9+' : group.unread_count}
                  </div>
                )}
              </div>

              {/* メンバー数 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{group.members_count}人</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
