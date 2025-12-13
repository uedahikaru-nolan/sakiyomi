# グループチャット機能 クイックリファレンス

開発中に素早く参照できるコードスニペット集

---

## 📁 ファイル構成

```
supabase/migrations/
  └── YYYYMMDDHHMMSS_create_group_chat_tables.sql  # DBマイグレーション

lib/
  ├── actions/
  │   └── group-chat.ts                             # Server Actions
  └── hooks/
      ├── useGroupChats.ts                          # グループ一覧管理
      └── useGroupChatMessages.ts                   # メッセージ管理

components/features/
  ├── admin/
  │   ├── user-selector.tsx                         # ユーザー選択UI
  │   ├── group-chat-list.tsx                       # グループ一覧
  │   └── group-chat-header.tsx                     # グループヘッダー
  └── group-chat/
      ├── group-chat-card.tsx                       # グループカード
      ├── group-message-list.tsx                    # メッセージ一覧
      └── group-message-input.tsx                   # メッセージ入力

app/
  ├── admin/
  │   └── group-chats/
  │       ├── page.tsx                              # 一覧
  │       ├── new/
  │       │   └── page.tsx                          # 新規作成
  │       └── [id]/
  │           └── page.tsx                          # 詳細
  └── dashboard/
      └── group-chats/
          ├── page.tsx                              # 一覧
          └── [id]/
              └── page.tsx                          # チャット画面
```

---

## 🗄️ データベーススキーマ

### group_chats テーブル
```typescript
interface GroupChat {
  id: string
  name: string
  description: string | null
  created_by: string
  last_message_at: string | null
  created_at: string
  updated_at: string
}
```

### group_chat_members テーブル
```typescript
interface GroupChatMember {
  id: string
  group_chat_id: string
  user_id: string
  joined_at: string
  last_read_at: string | null
}
```

### group_chat_messages テーブル
```typescript
interface GroupChatMessage {
  id: string
  group_chat_id: string
  sender_id: string
  message: string
  created_at: string
  updated_at: string
}
```

---

## 🔧 Server Actions

### グループチャット作成
```typescript
// lib/actions/group-chat.ts
export async function createGroupChat(
  name: string,
  description: string | null,
  userIds: string[]
) {
  // 1. 管理者権限チェック
  // 2. グループ作成
  // 3. メンバー追加
  // 4. 返却
}

// 使用例
const result = await createGroupChat(
  'プロジェクトA',
  'プロジェクトAのメンバー',
  ['user-id-1', 'user-id-2', 'user-id-3']
)
```

### グループ一覧取得
```typescript
export async function getGroupChatsList() {
  // 1. 参加しているグループを取得
  // 2. 最後のメッセージ情報を含める
  // 3. 未読数を計算
}

// 使用例
const result = await getGroupChatsList()
// { groups: GroupChat[], error?: string }
```

### メッセージ送信
```typescript
export async function sendGroupMessage(
  groupChatId: string,
  message: string
) {
  // 1. メンバー権限チェック
  // 2. メッセージ送信
  // 3. last_message_at更新
}

// 使用例
const result = await sendGroupMessage(
  'group-id',
  'こんにちは！'
)
```

### メッセージ取得
```typescript
export async function getGroupChatMessages(
  groupChatId: string,
  limit = 50,
  before?: string
) {
  // ページネーション対応
}

// 使用例
const result = await getGroupChatMessages('group-id', 50)
```

---

## 🎣 Custom Hooks

### useGroupChats
```typescript
// lib/hooks/useGroupChats.ts
export function useGroupChats() {
  const [groups, setGroups] = useState<GroupChat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Realtime購読
  useEffect(() => {
    // group_chat_messages の INSERT を監視
    // group_chat_members の INSERT/DELETE を監視
  }, [])

  return { groups, isLoading, refetch }
}

// 使用例
function GroupChatList() {
  const { groups, isLoading } = useGroupChats()

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {groups.map(group => (
        <GroupChatCard key={group.id} group={group} />
      ))}
    </div>
  )
}
```

### useGroupChatMessages
```typescript
// lib/hooks/useGroupChatMessages.ts
export function useGroupChatMessages(groupChatId: string) {
  const [messages, setMessages] = useState<GroupChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)

  // Realtime購読
  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupChatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_chat_messages',
        filter: `group_chat_id=eq.${groupChatId}`
      }, (payload) => {
        // 新しいメッセージを追加
      })
      .subscribe()
  }, [groupChatId])

  const sendMessage = async (message: string) => {
    // 楽観的更新
    const result = await sendGroupMessage(groupChatId, message)
    return result.error ? false : true
  }

  return { messages, sendMessage, isSending }
}

// 使用例
function GroupChatWindow({ groupId }: { groupId: string }) {
  const { messages, sendMessage } = useGroupChatMessages(groupId)
  const [input, setInput] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await sendMessage(input)
    setInput('')
  }

  return (
    <div>
      <MessageList messages={messages} />
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button type="submit">送信</button>
      </form>
    </div>
  )
}
```

---

## 🎨 コンポーネント例

### ユーザー選択コンポーネント
```typescript
// components/features/admin/user-selector.tsx
interface UserSelectorProps {
  selectedUserIds: string[]
  onSelectionChange: (userIds: string[]) => void
}

export function UserSelector({ selectedUserIds, onSelectionChange }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')

  const handleSelectAll = () => {
    onSelectionChange(users.map(u => u.id))
  }

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId))
    } else {
      onSelectionChange([...selectedUserIds, userId])
    }
  }

  return (
    <div>
      <input
        placeholder="ユーザー検索..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <button onClick={handleSelectAll}>全員選択</button>
      <div>
        {users.map(user => (
          <label key={user.id}>
            <input
              type="checkbox"
              checked={selectedUserIds.includes(user.id)}
              onChange={() => handleToggleUser(user.id)}
            />
            {user.name}
          </label>
        ))}
      </div>
    </div>
  )
}
```

### グループカード
```typescript
// components/features/group-chat/group-chat-card.tsx
interface GroupChatCardProps {
  group: GroupChat & {
    members_count: number
    last_message: string | null
    unread_count: number
  }
  onClick: () => void
}

export function GroupChatCard({ group, onClick }: GroupChatCardProps) {
  return (
    <button onClick={onClick} className="...">
      <h3>{group.name}</h3>
      <p className="text-sm text-muted-foreground">
        {group.members_count}人のメンバー
      </p>
      {group.last_message && (
        <p className="truncate text-xs">{group.last_message}</p>
      )}
      {group.unread_count > 0 && (
        <span className="badge">{group.unread_count}</span>
      )}
    </button>
  )
}
```

---

## 🔐 RLSポリシー参考

### メンバーのみ閲覧可能
```sql
CREATE POLICY "policy_name"
ON table_name FOR SELECT
TO authenticated
USING (
  group_chat_id IN (
    SELECT group_chat_id
    FROM group_chat_members
    WHERE user_id = auth.uid()
  )
);
```

### 管理者のみ実行可能
```sql
CREATE POLICY "policy_name"
ON table_name FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);
```

---

## ⚡ Realtime購読パターン

### 新しいメッセージの監視
```typescript
const channel = supabase
  .channel(`group-chat-${groupId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'group_chat_messages',
      filter: `group_chat_id=eq.${groupId}`
    },
    async (payload) => {
      // 送信者情報を取得
      const { data: messageWithSender } = await supabase
        .from('group_chat_messages')
        .select(`
          *,
          sender:users!sender_id(id, name, avatar_url, role)
        `)
        .eq('id', payload.new.id)
        .single()

      // メッセージを追加
      setMessages(prev => {
        const exists = prev.some(m => m.id === messageWithSender.id)
        if (exists) return prev
        return [...prev, messageWithSender]
      })
    }
  )
  .subscribe()
```

---

## 🧪 テストケース

### グループ作成のテスト
```typescript
// 正常系
- [x] 管理者がグループを作成できる
- [x] メンバーが正しく追加される
- [x] グループ名が正しく保存される

// 異常系
- [x] 一般ユーザーはグループを作成できない
- [x] グループ名が空の場合エラー
- [x] メンバーが0人の場合エラー
```

### メッセージ送信のテスト
```typescript
// 正常系
- [x] メンバーがメッセージを送信できる
- [x] 他のメンバーがリアルタイムで受信できる
- [x] last_message_atが更新される

// 異常系
- [x] メンバー以外は送信できない
- [x] メッセージが空の場合エラー
- [x] 2000文字を超える場合エラー
```

---

## 📊 パフォーマンス最適化

### メッセージの遅延読み込み
```typescript
function GroupMessageList({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    if (!hasMore) return

    const oldest = messages[0]?.created_at
    const result = await getGroupChatMessages(groupId, 50, oldest)

    if (result.messages && result.messages.length > 0) {
      setMessages(prev => [...result.messages, ...prev])
    } else {
      setHasMore(false)
    }
  }

  return (
    <div>
      {hasMore && <button onClick={loadMore}>過去のメッセージを読み込む</button>}
      {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
    </div>
  )
}
```

---

## 🚀 デプロイチェックリスト

- [ ] マイグレーション実行
- [ ] RLSポリシー有効化
- [ ] Realtime publication設定
- [ ] 環境変数設定
- [ ] パフォーマンステスト
- [ ] セキュリティチェック
- [ ] ユーザー受け入れテスト

---

## 💡 ベストプラクティス

1. **楽観的更新を使用**
   - メッセージ送信後、すぐにUIに反映
   - Realtimeで確認・同期

2. **適切なエラーハンドリング**
   - ユーザーにわかりやすいエラーメッセージ
   - リトライ機能の実装

3. **パフォーマンス**
   - ページネーションの実装
   - 不要な再レンダリング防止
   - useCallbackとuseMemoの活用

4. **セキュリティ**
   - Server Actionsで権限チェック
   - RLSで二重チェック
   - 入力値のサニタイズ

5. **コードの再利用**
   - 既存のチャット機能のコンポーネントを活用
   - 共通部分は抽象化
