# チャット機能 クイックリファレンス

実装時に素早く参照できるチートシートです。

---

## データベーステーブル

### chat_rooms
```sql
CREATE TABLE chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id),
  status varchar NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### chat_messages
```sql
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id),
  message text NOT NULL CHECK (char_length(message) <= 2000),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_room_created ON chat_messages(chat_room_id, created_at DESC);
```

---

## RLSポリシー

### chat_rooms
```sql
-- ユーザーは自分のチャットルームのみ閲覧可能
CREATE POLICY "Users can view own chat room"
  ON chat_rooms FOR SELECT
  USING (auth.uid() = user_id);

-- 運営者は全てのチャットルームを閲覧可能
CREATE POLICY "Admins can view all chat rooms"
  ON chat_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

### chat_messages
```sql
-- ユーザーは自分のチャットルームのメッセージのみ閲覧可能
CREATE POLICY "Users can view own room messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = chat_messages.chat_room_id
      AND user_id = auth.uid()
    )
  );

-- 運営者は全てのメッセージを閲覧可能
CREATE POLICY "Admins can view all messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

---

## Realtime設定

```sql
-- chat_messagesテーブルでRealtimeを有効化
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

---

## 主要なServer Actions

### `/lib/actions/chat.ts`

```typescript
// チャットルーム取得または作成
export async function createOrGetChatRoom()

// メッセージ一覧取得
export async function getChatMessages(roomId: string, limit?: number, before?: string)

// メッセージ送信
export async function sendMessage(roomId: string, message: string)

// 未読メッセージを既読にする
export async function markMessagesAsRead(roomId: string)

// 未読メッセージ数取得
export async function getUnreadCount()
```

### `/lib/actions/admin-chat.ts`

```typescript
// チャットルーム一覧取得（運営者用）
export async function getChatRoomsList(params: {
  page?: number
  limit?: number
  status?: string
  search?: string
})

// チャットルーム詳細取得
export async function getChatRoomDetails(roomId: string)

// チャットルームステータス更新
export async function updateChatRoomStatus(roomId: string, status: string)

// 統計情報取得
export async function getChatStats()
```

---

## カスタムフック

### `useChat`
```typescript
const {
  chatRoom,
  isLoading,
  error,
  openChat,
  closeChat
} = useChat()
```

### `useChatMessages`
```typescript
const {
  messages,
  isLoading,
  sendMessage,
  loadMore,
  hasMore
} = useChatMessages(roomId)
```

### `useUnreadCount`
```typescript
const { unreadCount, refresh } = useUnreadCount()
```

---

## 主要コンポーネント

### フローティングチャットボタン
```typescript
<FloatingChatButton />
```

### チャットウィンドウ
```typescript
<ChatWindow
  isOpen={isOpen}
  onClose={handleClose}
  roomId={roomId}
/>
```

### メッセージリスト
```typescript
<MessageList
  messages={messages}
  currentUserId={userId}
  onLoadMore={loadMore}
/>
```

### メッセージ入力
```typescript
<MessageInput
  onSend={handleSend}
  disabled={isSending}
/>
```

---

## Realtime購読

```typescript
// メッセージのリアルタイム購読
const channel = supabase
  .channel(`chat-room-${roomId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `chat_room_id=eq.${roomId}`
    },
    (payload) => {
      // 新しいメッセージを処理
      setMessages(prev => [...prev, payload.new])
    }
  )
  .subscribe()

// クリーンアップ
return () => {
  supabase.removeChannel(channel)
}
```

---

## バリデーション

```typescript
import { z } from 'zod'

const messageSchema = z.object({
  message: z.string()
    .min(1, 'メッセージを入力してください')
    .max(2000, 'メッセージは2000文字以内で入力してください')
    .trim()
})

const chatRoomStatusSchema = z.enum(['open', 'resolved', 'closed'])
```

---

## エラーハンドリング

```typescript
try {
  const result = await sendMessage(roomId, message)
  if (result.error) {
    // エラー処理
    toast.error(result.error)
    return
  }
  // 成功処理
  toast.success('メッセージを送信しました')
} catch (error) {
  console.error('Unexpected error:', error)
  toast.error('予期しないエラーが発生しました')
}
```

---

## レスポンシブデザイン

```typescript
// デスクトップ: 右下ポップアップ
// モバイル: フルスクリーンモーダル

<div className={cn(
  "fixed z-50",
  "md:bottom-24 md:right-6 md:w-96 md:h-[600px] md:rounded-lg md:shadow-xl",
  "max-md:inset-0 max-md:w-full max-md:h-full"
)}>
  {/* チャット内容 */}
</div>
```

---

## パフォーマンス最適化

```typescript
// メモ化
const memoizedMessages = useMemo(
  () => messages.map(formatMessage),
  [messages]
)

// 仮想スクロール（大量メッセージ対応）
import { useVirtualizer } from '@tanstack/react-virtual'

// デバウンス（入力中表示など）
import { useDebouncedValue } from '@/lib/hooks/useDebounce'
```

---

## テストケース例

```typescript
describe('sendMessage', () => {
  it('正常にメッセージを送信できる', async () => {
    const result = await sendMessage('room-id', 'Hello')
    expect(result.error).toBeUndefined()
  })

  it('空のメッセージは送信できない', async () => {
    const result = await sendMessage('room-id', '')
    expect(result.error).toBeDefined()
  })

  it('2000文字を超えるメッセージは送信できない', async () => {
    const longMessage = 'a'.repeat(2001)
    const result = await sendMessage('room-id', longMessage)
    expect(result.error).toBeDefined()
  })
})
```

---

## デプロイチェックリスト

- [ ] データベースマイグレーション実行
- [ ] RLSポリシー設定完了
- [ ] Realtime有効化確認
- [ ] 環境変数設定確認
- [ ] エラーログ監視設定
- [ ] パフォーマンス監視設定
- [ ] 運営者アカウント作成
- [ ] ユーザーマニュアル公開
- [ ] 運営者マニュアル共有

---

## トラブルシューティング

### メッセージが表示されない
1. RLSポリシーを確認
2. Realtime購読状態を確認
3. ネットワークタブでエラーを確認

### リアルタイム更新が動作しない
1. Realtimeが有効化されているか確認
2. チャンネル購読が成功しているか確認
3. WebSocket接続状態を確認

### パフォーマンスが遅い
1. メッセージのページネーション実装
2. 仮想スクロール導入
3. 画像の遅延読み込み

---

## 便利なSQLクエリ

```sql
-- 未返信のチャットルーム一覧
SELECT cr.*, u.name, u.email,
  (SELECT COUNT(*) FROM chat_messages
   WHERE chat_room_id = cr.id AND is_read = false AND sender_id != cr.user_id) as unread_count
FROM chat_rooms cr
JOIN users u ON cr.user_id = u.id
WHERE cr.status = 'open'
ORDER BY cr.last_message_at DESC NULLS LAST;

-- 特定期間のメッセージ統計
SELECT
  DATE(created_at) as date,
  COUNT(*) as message_count,
  COUNT(DISTINCT chat_room_id) as active_rooms
FROM chat_messages
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```
