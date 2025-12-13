'use client'

import { useState, useEffect } from 'react'
import { Search, Users, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface User {
  id: string
  name: string
  email: string
  avatar_url: string | null
  role: string
}

interface UserSelectorProps {
  users: User[]
  selectedUserIds: string[]
  onSelectionChange: (userIds: string[]) => void
}

export function UserSelector({ users, selectedUserIds, onSelectionChange }: UserSelectorProps) {
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState(users)

  // 検索フィルター
  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users)
    } else {
      const searchLower = search.toLowerCase()
      setFilteredUsers(
        users.filter(
          user =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        )
      )
    }
  }, [search, users])

  // 全員選択
  const handleSelectAll = () => {
    onSelectionChange(users.map(u => u.id))
  }

  // 全員解除
  const handleDeselectAll = () => {
    onSelectionChange([])
  }

  // ユーザーの選択/解除
  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId))
    } else {
      onSelectionChange([...selectedUserIds, userId])
    }
  }

  const allSelected = selectedUserIds.length === users.length
  const someSelected = selectedUserIds.length > 0 && !allSelected

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="ユーザーを検索..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* 選択状態と操作ボタン */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {selectedUserIds.length}人選択中 / 全{users.length}人
          </span>
        </div>
        <div className="flex gap-2">
          {someSelected || allSelected ? (
            <button
              onClick={handleDeselectAll}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              全て解除
            </button>
          ) : (
            <button
              onClick={handleSelectAll}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              全員選択
            </button>
          )}
        </div>
      </div>

      {/* ユーザーリスト */}
      <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search.trim() ? '検索結果が見つかりません' : 'ユーザーがいません'}
          </div>
        ) : (
          filteredUsers.map(user => {
            const isSelected = selectedUserIds.includes(user.id)

            return (
              <label
                key={user.id}
                className={cn(
                  'flex items-center gap-3 p-3 cursor-pointer transition-colors',
                  'hover:bg-gray-50',
                  isSelected && 'bg-orange-50'
                )}
              >
                {/* チェックボックス */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'h-5 w-5 rounded border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-orange-600 border-orange-600'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleUser(user.id)}
                    className="sr-only"
                  />
                </div>

                {/* アバター */}
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* ユーザー情報 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                </div>

                {/* ロールバッジ */}
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                )}
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}
