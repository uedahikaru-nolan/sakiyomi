import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CommentSection } from '@/components/features/community/comment-section'
import { ReactionButton } from '@/components/features/community/reaction-button'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const user = await requireUser()
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*, user:users(id, name, email)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!post) {
    notFound()
  }

  const { data: comments } = await supabase
    .from('comments')
    .select('*, user:users(name, email)')
    .eq('post_id', post.id)
    .is('deleted_at', null)
    .is('parent_comment_id', null)
    .order('created_at', { ascending: true })

  const { count: reactionsCount } = await supabase
    .from('reactions')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', 'post')
    .eq('target_id', post.id)

  const { data: userReaction } = await supabase
    .from('reactions')
    .select('*')
    .eq('target_type', 'post')
    .eq('target_id', post.id)
    .eq('user_id', user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <a href="/dashboard/community" className="text-sm text-muted-foreground hover:text-primary">
        ← コミュニティに戻る
      </a>

      {/* Post */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {post.post_type === 'daily' && '日報'}
                  {post.post_type === 'question' && '質問'}
                  {post.post_type === 'achievement' && '成果報告'}
                  {post.post_type === 'general' && '一般'}
                </Badge>
                {post.tags && post.tags.length > 0 && post.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription className="mt-2">
                投稿者: {post.user.name} • {new Date(post.created_at).toLocaleDateString('ja-JP')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <ReactionButton
              targetType="post"
              targetId={post.id}
              initialCount={reactionsCount || 0}
              initialUserReacted={!!userReaction}
            />
            <span className="text-sm text-muted-foreground">
              💬 {comments?.length || 0} コメント
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardContent className="pt-6">
          <CommentSection
            postId={post.id}
            comments={comments || []}
            currentUserId={user.id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
