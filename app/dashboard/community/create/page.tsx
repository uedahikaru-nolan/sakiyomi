import { CreatePostForm } from '@/components/features/community/create-post-form'

export default function CreatePostPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">投稿作成</h1>
        <p className="text-muted-foreground">
          新しい投稿を作成してコミュニティと共有しましょう
        </p>
      </div>

      <CreatePostForm />
    </div>
  )
}
