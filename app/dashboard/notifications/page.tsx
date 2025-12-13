import Link from 'next/link'
import { requireUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { markAllNotificationsAsRead } from '@/lib/actions/notifications'

export default async function NotificationsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0

  async function handleMarkAllAsRead() {
    'use server'
    await markAllNotificationsAsRead()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">通知</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : 'すべての通知を確認済みです'}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={handleMarkAllAsRead}>
            <Button type="submit" variant="outline">
              すべて既読にする
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-colors ${
                notification.is_read ? 'bg-background' : 'bg-accent/50'
              }`}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {notification.type === 'comment' && '💬'}
                        {notification.type === 'reaction' && '❤️'}
                        {notification.type === 'achievement' && '🏆'}
                        {notification.type === 'course_update' && '📚'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!notification.is_read && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm">{notification.message}</p>
                    {notification.related_entity_type === 'post' && notification.related_entity_id && (
                      <Link
                        href={`/dashboard/community/${notification.related_entity_id}`}
                        className="text-xs text-primary hover:underline mt-2 inline-block"
                      >
                        投稿を見る →
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">通知はありません</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
