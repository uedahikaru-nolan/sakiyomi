import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/utils/get-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ReactionButton } from '@/components/features/community/reaction-button'

export default async function CommunityPage() {
  const user = await getUser()
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*, user:users(name, email)')
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get reaction counts and user reactions for all posts
  const postIds = posts?.map((p) => p.id) || []
  const { data: reactionCounts } = await supabase
    .from('reactions')
    .select('target_id')
    .eq('target_type', 'post')
    .in('target_id', postIds)

  const { data: userReactions } = user
    ? await supabase
        .from('reactions')
        .select('target_id')
        .eq('target_type', 'post')
        .eq('user_id', user.id)
        .in('target_id', postIds)
    : { data: [] }

  const { data: commentCounts } = await supabase
    .from('comments')
    .select('post_id')
    .is('deleted_at', null)
    .in('post_id', postIds)

  // Create maps for quick lookup
  const reactionCountMap: Record<string, number> = {}
  reactionCounts?.forEach((r) => {
    reactionCountMap[r.target_id] = (reactionCountMap[r.target_id] || 0) + 1
  })

  const userReactionSet = new Set(userReactions?.map((r) => r.target_id) || [])

  const commentCountMap: Record<string, number> = {}
  commentCounts?.forEach((c) => {
    commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">コミュニティ</h1>
          <p className="text-muted-foreground">
            会員同士で交流しましょう
          </p>
        </div>
        <Link href="/dashboard/community/create">
          <Button>投稿する</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {post.post_type === 'daily' && '日報'}
                    {post.post_type === 'question' && '質問'}
                    {post.post_type === 'achievement' && '成果報告'}
                    {post.post_type === 'general' && '一般'}
                  </Badge>
                  {post.tags && post.tags.length > 0 && post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Link href={`/dashboard/community/${post.id}`} className="hover:underline">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <CardDescription>
                  投稿者: {post.user?.name || post.user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm line-clamp-3">{post.content}</p>

                <div className="flex items-center gap-4 pt-2 border-t">
                  {user ? (
                    <ReactionButton
                      targetType="post"
                      targetId={post.id}
                      initialCount={reactionCountMap[post.id] || 0}
                      initialUserReacted={userReactionSet.has(post.id)}
                    />
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span className="text-base">🤍</span>
                      <span>{reactionCountMap[post.id] || 0} いいね</span>
                    </span>
                  )}
                  <Link
                    href={`/dashboard/community/${post.id}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    💬 {commentCountMap[post.id] || 0} コメント
                  </Link>
                  <Link
                    href={`/dashboard/community/${post.id}`}
                    className="text-sm text-primary hover:underline ml-auto"
                  >
                    続きを読む →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                まだ投稿がありません。最初の投稿をしてみましょう！
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
