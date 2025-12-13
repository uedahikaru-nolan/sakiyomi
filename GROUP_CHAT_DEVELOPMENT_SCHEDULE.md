# グループチャット機能 開発スケジュール

## 開発フェーズ

### Phase 1: データベース設計・構築 (Day 1-2)

#### Day 1: データベーステーブル作成
- [ ] マイグレーションファイル作成
  - `group_chats` テーブル
  - `group_chat_members` テーブル
  - `group_chat_messages` テーブル
  - インデックス作成
  - トリガー作成（updated_at自動更新）

#### Day 2: RLSポリシー設定
- [ ] group_chatsのRLSポリシー
- [ ] group_chat_membersのRLSポリシー
- [ ] group_chat_messagesのRLSポリシー
- [ ] Realtime publication設定
- [ ] 動作確認・テスト

---

### Phase 2: Server Actions実装 (Day 3-4)

#### Day 3: グループ管理のServer Actions
- [ ] `lib/actions/group-chat.ts` 作成
  - `createGroupChat()` - グループ作成
  - `getGroupChatsList()` - グループ一覧取得
  - `getGroupChatDetails()` - グループ詳細取得
  - `addGroupMembers()` - メンバー追加
  - `removeGroupMember()` - メンバー削除
  - 管理者権限チェック関数

#### Day 4: メッセージ管理のServer Actions
- [ ] メッセージ関連関数実装
  - `getGroupChatMessages()` - メッセージ取得
  - `sendGroupMessage()` - メッセージ送信
  - `getGroupUnreadCount()` - 未読数取得
  - `markGroupMessagesAsRead()` - 既読処理
- [ ] エラーハンドリング
- [ ] バリデーション実装

---

### Phase 3: Custom Hooks実装 (Day 5)

#### Day 5: React Hooks作成
- [ ] `lib/hooks/useGroupChats.ts`
  - グループチャット一覧管理
  - Realtime購読
  - 未読数の管理

- [ ] `lib/hooks/useGroupChatMessages.ts`
  - グループメッセージ管理
  - Realtime購読
  - メッセージ送信
  - 既読処理
  - 楽観的更新

---

### Phase 4: Admin側UI実装 (Day 6-8)

#### Day 6: グループチャット作成画面
- [ ] `/admin/group-chats/new/page.tsx` 作成
- [ ] ユーザー選択コンポーネント
  - `components/features/admin/user-selector.tsx`
  - 全員選択機能
  - 個別チェックボックス
  - 検索機能
- [ ] グループ作成フォーム
  - グループ名入力
  - 説明入力
  - バリデーション

#### Day 7: グループチャット一覧画面
- [ ] `/admin/group-chats/page.tsx` 作成
- [ ] グループ一覧コンポーネント
  - `components/features/admin/group-chat-list.tsx`
  - グループカード表示
  - メンバー数表示
  - 最後のメッセージ表示
- [ ] 新規作成ボタン
- [ ] 検索・フィルター機能

#### Day 8: グループチャット詳細・メッセージ画面
- [ ] `/admin/group-chats/[id]/page.tsx` 作成
- [ ] グループ情報表示コンポーネント
  - `components/features/admin/group-chat-header.tsx`
  - グループ名・説明
  - メンバー一覧
  - メンバー管理ボタン
- [ ] メッセージ表示エリア
  - `components/features/group-chat/group-message-list.tsx`
  - 既存のMessageBubbleを再利用
- [ ] メッセージ送信フォーム
  - `components/features/group-chat/group-message-input.tsx`
- [ ] メンバー追加モーダル

---

### Phase 5: User側UI実装 (Day 9-10)

#### Day 9: グループチャット一覧（User側）
- [ ] ダッシュボードにグループチャットセクション追加
  - または `/dashboard/group-chats/page.tsx` 作成
- [ ] グループチャットカード
  - `components/features/group-chat/group-chat-card.tsx`
  - グループ名
  - 最後のメッセージ
  - 未読バッジ
- [ ] Realtime更新

#### Day 10: グループチャット画面（User側）
- [ ] `/dashboard/group-chats/[id]/page.tsx` 作成
- [ ] グループ情報表示
- [ ] メッセージ一覧・送信
  - Admin側と同じコンポーネントを再利用
- [ ] 未読数管理
- [ ] Realtime更新
- [ ] レスポンシブ対応

---

### Phase 6: リアルタイム機能強化 (Day 11)

#### Day 11: Realtime統合とテスト
- [ ] Realtime購読の最適化
  - 接続管理
  - 再接続処理
  - エラーハンドリング
- [ ] 未読数のリアルタイム更新
- [ ] 新メンバー追加時の通知
- [ ] パフォーマンステスト

---

### Phase 7: UI/UX改善 (Day 12)

#### Day 12: 見た目とユーザビリティ向上
- [ ] レスポンシブデザイン調整
- [ ] ローディング状態の表示
- [ ] エラーメッセージの改善
- [ ] アニメーション追加
- [ ] アクセシビリティ対応
- [ ] メッセージ入力のUX改善
  - 送信中の表示
  - 文字数カウンター

---

### Phase 8: テスト・デバッグ (Day 13-14)

#### Day 13: 統合テスト
- [ ] グループ作成フローのテスト
- [ ] メッセージ送受信のテスト
- [ ] メンバー追加・削除のテスト
- [ ] 権限チェックのテスト
- [ ] Realtime更新のテスト

#### Day 14: バグフィックスと最終調整
- [ ] 発見されたバグの修正
- [ ] パフォーマンス最適化
- [ ] コードレビュー
- [ ] ドキュメント更新
- [ ] 本番環境デプロイ準備

---

## タスクチェックリスト

### データベース
- [ ] テーブル作成
- [ ] RLSポリシー設定
- [ ] インデックス作成
- [ ] Realtime publication設定

### Server Actions
- [ ] グループ作成
- [ ] グループ一覧取得
- [ ] グループ詳細取得
- [ ] メンバー追加・削除
- [ ] メッセージ送信
- [ ] メッセージ取得
- [ ] 未読数取得
- [ ] 既読処理

### Custom Hooks
- [ ] useGroupChats
- [ ] useGroupChatMessages

### Admin UI
- [ ] グループ作成画面
- [ ] グループ一覧画面
- [ ] グループ詳細画面
- [ ] メンバー管理UI

### User UI
- [ ] グループ一覧表示
- [ ] グループチャット画面
- [ ] 未読表示

### Realtime
- [ ] メッセージのRealtime更新
- [ ] メンバー変更のRealtime更新
- [ ] 未読数のRealtime更新

### テスト
- [ ] 機能テスト
- [ ] パフォーマンステスト
- [ ] セキュリティテスト

---

## 優先順位

### 高優先度（MVP）
1. データベース設計・構築
2. グループ作成機能（Admin）
3. メッセージ送受信機能
4. グループ一覧表示（Admin & User）
5. Realtime更新

### 中優先度
1. メンバー追加・削除機能
2. 未読数管理
3. 検索・フィルター機能

### 低優先度（将来的な拡張）
1. ファイル添付
2. メンション機能
3. グループアイコン
4. 既読表示（詳細）

---

## 開発時の注意点

### セキュリティ
- 必ず管理者権限チェックを実施
- RLSポリシーで二重チェック
- 入力値のバリデーション
- XSS対策

### パフォーマンス
- メッセージのページネーション
- インデックスの適切な使用
- Realtime接続の管理
- 不要な再レンダリング防止

### コード品質
- 既存のチャット機能のコードを参考に
- コンポーネントの再利用
- 一貫性のあるネーミング
- 適切なエラーハンドリング
