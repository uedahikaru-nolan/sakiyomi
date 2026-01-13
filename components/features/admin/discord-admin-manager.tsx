'use client'

import { useState } from 'react'
import { Shield, ShieldOff, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toggleDiscordUserAdmin } from '@/lib/actions/discord'

interface DiscordUser {
  id: number
  discord_id: string
  username: string
  avatar_url: string | null
  bot: boolean
  is_admin: boolean
}

interface DiscordAdminManagerProps {
  users: DiscordUser[]
}

export function DiscordAdminManager({ users }: DiscordAdminManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggleAdmin = async (discordUserId: string, currentIsAdmin: boolean) => {
    setLoading(discordUserId)
    try {
      console.log('[handleToggleAdmin] Toggling admin for:', discordUserId, 'to:', !currentIsAdmin)
      const result = await toggleDiscordUserAdmin(discordUserId, !currentIsAdmin)
      console.log('[handleToggleAdmin] Result:', result)

      if (!result.success) {
        alert(`管理者設定の更新に失敗しました: ${result.error || '不明なエラー'}`)
      } else {
        // 成功メッセージを表示
        alert(currentIsAdmin ? '管理者を解除しました' : '管理者に設定しました')
        // ページをリロードして最新の状態を取得
        window.location.reload()
      }
    } catch (error) {
      console.error('[handleToggleAdmin] Error toggling admin:', error)
      alert(`エラーが発生しました: ${error}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {/* 管理者管理ボタン */}
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg"
      >
        <Shield className="w-4 h-4 mr-2" />
        管理者管理
      </Button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Discord管理者管理</h2>
                  <p className="text-purple-100 text-sm">ユーザーの管理者権限を設定</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* コンテンツ */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-3">
                {users.map((user) => (
                  <Card
                    key={user.discord_id}
                    className={`border-2 transition-all duration-200 ${
                      user.is_admin
                        ? 'border-red-300 bg-red-50/50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        {/* ユーザー情報 */}
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${
                              user.is_admin
                                ? 'bg-gradient-to-br from-red-500 to-rose-600'
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            }`}
                          >
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-lg">
                                {user.username}
                              </p>
                              {user.bot && (
                                <Badge className="bg-indigo-500 text-white">BOT</Badge>
                              )}
                              {user.is_admin && (
                                <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold">
                                  管理者
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">ID: {user.discord_id}</p>
                          </div>
                        </div>

                        {/* トグルボタン */}
                        <Button
                          onClick={() => handleToggleAdmin(user.discord_id, user.is_admin)}
                          disabled={loading === user.discord_id}
                          variant={user.is_admin ? 'destructive' : 'default'}
                          className={`font-bold ${
                            user.is_admin
                              ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          }`}
                        >
                          {loading === user.discord_id ? (
                            '更新中...'
                          ) : user.is_admin ? (
                            <>
                              <ShieldOff className="w-4 h-4 mr-2" />
                              管理者解除
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              管理者に設定
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* フッター */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="font-bold"
              >
                閉じる
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
