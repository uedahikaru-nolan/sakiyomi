# グループチャット機能 要件定義書

## 1. 概要

### 1.1 目的
- 管理者が複数のユーザーを選択してグループチャットを作成できる機能を提供する
- ユーザー間のコミュニケーションを促進し、効率的な情報共有を実現する

### 1.2 主な機能
- **Admin側**
  - グループチャットの作成（全員選択 or 個別ユーザー選択）
  - グループ名の設定
  - グループチャット一覧の表示
  - グループチャットでのメッセージ送受信
  - メンバーの追加・削除

- **User側**
  - 参加しているグループチャット一覧の表示
  - グループチャットでのメッセージ送受信
  - 未読メッセージの表示
  - リアルタイム通知

---

## 2. データベース設計

### 2.1 group_chats テーブル
グループチャットの基本情報を管理

```sql
CREATE TABLE group_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES users(id),
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**カラム説明:**
- `id`: グループチャットの一意識別子
- `name`: グループ名
- `description`: グループの説明（オプション）
- `created_by`: グループを作成した管理者のID
- `last_message_at`: 最後のメッセージ送信日時
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 2.2 group_chat_members テーブル
グループチャットのメンバー管理

```sql
CREATE TABLE group_chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id uuid NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz,
  UNIQUE(group_chat_id, user_id)
);
```

**カラム説明:**
- `id`: メンバーレコードの一意識別子
- `group_chat_id`: グループチャットID
- `user_id`: ユーザーID
- `joined_at`: 参加日時
- `last_read_at`: 最後に既読した日時

### 2.3 group_chat_messages テーブル
グループチャットのメッセージ管理

```sql
CREATE TABLE group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id uuid NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 2000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**カラム説明:**
- `id`: メッセージの一意識別子
- `group_chat_id`: グループチャットID
- `sender_id`: 送信者のユーザーID
- `message`: メッセージ内容（最大2000文字）
- `created_at`: 作成日時
- `updated_at`: 更新日時

### 2.4 インデックス

```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_group_chat_members_user_id ON group_chat_members(user_id);
CREATE INDEX idx_group_chat_members_group_id ON group_chat_members(group_chat_id);
CREATE INDEX idx_group_chat_messages_group_id ON group_chat_messages(group_chat_id);
CREATE INDEX idx_group_chat_messages_created_at ON group_chat_messages(created_at DESC);
```

---

## 3. RLS (Row Level Security) ポリシー

### 3.1 group_chats テーブル

```sql
-- 読み取り: メンバーのみ閲覧可能
CREATE POLICY "Users can view groups they are members of"
ON group_chats FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM group_chat_members
    WHERE group_chat_members.group_chat_id = group_chats.id
    AND group_chat_members.user_id = auth.uid()
  )
);

-- 作成: 管理者のみ作成可能
CREATE POLICY "Admins can create groups"
ON group_chats FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 更新: 管理者のみ更新可能
CREATE POLICY "Admins can update groups"
ON group_chats FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);
```

### 3.2 group_chat_members テーブル

```sql
-- 読み取り: メンバーのみ閲覧可能
CREATE POLICY "Users can view group members"
ON group_chat_members FOR SELECT
TO authenticated
USING (
  group_chat_id IN (
    SELECT group_chat_id FROM group_chat_members
    WHERE user_id = auth.uid()
  )
);

-- 作成: 管理者のみメンバー追加可能
CREATE POLICY "Admins can add members"
ON group_chat_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 削除: 管理者のみメンバー削除可能
CREATE POLICY "Admins can remove members"
ON group_chat_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);
```

### 3.3 group_chat_messages テーブル

```sql
-- 読み取り: グループメンバーのみ閲覧可能
CREATE POLICY "Members can view group messages"
ON group_chat_messages FOR SELECT
TO authenticated
USING (
  group_chat_id IN (
    SELECT group_chat_id FROM group_chat_members
    WHERE user_id = auth.uid()
  )
);

-- 作成: グループメンバーのみ送信可能
CREATE POLICY "Members can send messages"
ON group_chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND group_chat_id IN (
    SELECT group_chat_id FROM group_chat_members
    WHERE user_id = auth.uid()
  )
);

-- 更新: 自分のメッセージのみ更新可能
CREATE POLICY "Users can update their own messages"
ON group_chat_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());
```

---

## 4. Server Actions

### 4.1 グループチャット管理

#### `createGroupChat(name, description, userIds)`
- グループチャットを作成
- メンバーを追加
- 管理者権限必須

#### `getGroupChatsList()`
- ユーザーが参加しているグループチャット一覧を取得
- 最後のメッセージ情報を含む

#### `getGroupChatDetails(groupChatId)`
- グループチャットの詳細情報を取得
- メンバー一覧を含む

#### `addGroupMembers(groupChatId, userIds)`
- グループにメンバーを追加
- 管理者権限必須

#### `removeGroupMember(groupChatId, userId)`
- グループからメンバーを削除
- 管理者権限必須

### 4.2 メッセージ管理

#### `getGroupChatMessages(groupChatId, limit?, before?)`
- グループチャットのメッセージを取得
- ページネーション対応

#### `sendGroupMessage(groupChatId, message)`
- グループチャットにメッセージを送信
- メンバー権限チェック

#### `getGroupUnreadCount(groupChatId)`
- グループチャットの未読メッセージ数を取得

#### `markGroupMessagesAsRead(groupChatId)`
- グループチャットのメッセージを既読にする
- last_read_atを更新

---

## 5. Admin側の機能

### 5.1 グループチャット作成画面
**パス:** `/admin/group-chats/new`

**機能:**
- グループ名入力
- グループ説明入力（オプション）
- ユーザー選択
  - 全員選択ボタン
  - 個別チェックボックス
  - 検索機能
- 作成ボタン

**バリデーション:**
- グループ名: 必須、1-100文字
- 最低1人のメンバーを選択

### 5.2 グループチャット一覧画面
**パス:** `/admin/group-chats`

**機能:**
- 作成したグループチャット一覧を表示
- 各グループの情報
  - グループ名
  - メンバー数
  - 最後のメッセージ
  - 作成日時
- 新規作成ボタン
- グループクリックで詳細画面へ

### 5.3 グループチャット詳細画面
**パス:** `/admin/group-chats/[id]`

**機能:**
- グループ情報表示
  - グループ名
  - メンバー一覧（アバター付き）
- メッセージ送受信エリア
- メンバー管理
  - メンバー追加ボタン
  - メンバー削除ボタン

---

## 6. User側の機能

### 6.1 グループチャット一覧表示
**場所:** ダッシュボード or 専用ページ

**機能:**
- 参加しているグループチャット一覧
- 各グループの情報
  - グループ名
  - 最後のメッセージ
  - 未読バッジ
- グループクリックでチャット画面へ

### 6.2 グループチャット画面
**パス:** `/dashboard/group-chats/[id]`

**機能:**
- グループ情報表示
  - グループ名
  - メンバー数
- メッセージ一覧表示
  - 送信者名とアバター
  - メッセージ内容
  - 送信日時
- メッセージ送信フォーム
- リアルタイム更新

---

## 7. リアルタイム機能

### 7.1 Realtime購読

**監視対象:**
- `group_chat_messages` テーブルの INSERT イベント
- `group_chat_members` テーブルの INSERT/DELETE イベント
- `group_chats` テーブルの UPDATE イベント

**動作:**
- 新しいメッセージが送信されたら即座に表示
- メンバーが追加/削除されたらメンバー一覧を更新
- グループ情報が更新されたら表示を更新

---

## 8. UI/UX要件

### 8.1 レスポンシブデザイン
- デスクトップ: 2カラムレイアウト（一覧 + 詳細）
- モバイル: 1カラムレイアウト（ページ遷移）

### 8.2 メッセージ表示
- 自分のメッセージ: 右寄せ、オレンジ色
- 他人のメッセージ: 左寄せ、グレー色
- 送信者名とアバターを表示
- 日付区切りを表示

### 8.3 未読表示
- 未読バッジをグループ一覧に表示
- 未読メッセージ数を表示

---

## 9. セキュリティ要件

### 9.1 権限チェック
- グループチャット作成: Admin/SuperAdminのみ
- メンバー追加/削除: Admin/SuperAdminのみ
- メッセージ送信: グループメンバーのみ
- メッセージ閲覧: グループメンバーのみ

### 9.2 データ検証
- メッセージ長: 1-2000文字
- グループ名: 1-100文字
- SQLインジェクション対策（Supabase RLSで実装）
- XSS対策（入力のサニタイズ）

---

## 10. パフォーマンス要件

### 10.1 メッセージ読み込み
- 初回: 最新50件を取得
- スクロール: 追加50件ずつ取得（無限スクロール）

### 10.2 リアルタイム更新
- WebSocket接続で低レイテンシ実現
- 接続切れ時の自動再接続

---

## 11. 今後の拡張機能（オプション）

- ファイル添付機能
- 画像プレビュー
- メンション機能 (@ユーザー名)
- グループアイコン設定
- グループの削除機能
- メッセージの編集・削除機能
- 既読表示（誰が読んだか）
- 通知設定（ミュート機能）
