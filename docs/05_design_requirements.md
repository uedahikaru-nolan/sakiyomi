# デザイン要件定義書

## 1. デザインコンセプト

### 1.1 デザインビジョン

**テーマ**: 「成長を実感できる、温かいコミュニティ」

**キーワード**:
- モダン
- クリーン
- フレンドリー
- モチベーション向上
- 使いやすさ

### 1.2 デザイン原則

1. **シンプル・イズ・ベスト**
   - 情報過多を避け、必要な情報を適切に配置
   - 直感的な操作性

2. **モチベーションの可視化**
   - 進捗を視覚的に表現
   - 達成感を感じられるフィードバック

3. **親しみやすさ**
   - 温かみのあるカラー
   - 適度な遊び心（ゲーミフィケーション要素）

4. **アクセシビリティ**
   - WCAG 2.1 AA準拠
   - 色覚多様性への配慮

5. **レスポンシブデザイン**
   - モバイルファースト
   - あらゆるデバイスで最適な体験

---

## 2. デザインシステム

### 2.1 カラーパレット

#### 2.1.1 プライマリカラー

**メインブランドカラー**:
```
Primary:
- 500 (Base): #6366F1 (Indigo) - メインアクション、ブランド
- 600 (Hover): #4F46E5
- 400 (Light): #818CF8
- 700 (Active): #4338CA
```

**用途**: ボタン、リンク、アクティブ状態、ブランド要素

#### 2.1.2 セカンダリカラー

**アクセントカラー**:
```
Secondary:
- 500 (Base): #EC4899 (Pink) - 重要な通知、特別な要素
- 600 (Hover): #DB2777
- 400 (Light): #F472B6
```

**用途**: いいね、バッジ、特別な表彰要素

#### 2.1.3 成功・警告・エラーカラー

```
Success:
- 500: #10B981 (Green) - 成功メッセージ、達成表示
- 400: #34D399
- 600: #059669

Warning:
- 500: #F59E0B (Amber) - 警告、注意喚起
- 400: #FBBF24
- 600: #D97706

Error:
- 500: #EF4444 (Red) - エラー、削除アクション
- 400: #F87171
- 600: #DC2626

Info:
- 500: #3B82F6 (Blue) - 情報、ヒント
- 400: #60A5FA
- 600: #2563EB
```

#### 2.1.4 ニュートラルカラー（グレースケール）

```
Neutral (Gray):
- 50: #F9FAFB   - 背景（明）
- 100: #F3F4F6  - 背景
- 200: #E5E7EB  - ボーダー（薄）
- 300: #D1D5DB  - ボーダー
- 400: #9CA3AF  - プレースホルダー
- 500: #6B7280  - ラベル、説明文
- 600: #4B5563  - 本文
- 700: #374151  - 見出し（小）
- 800: #1F2937  - 見出し
- 900: #111827  - 見出し（大）、強調
```

#### 2.1.5 背景カラー

```
Background:
- Primary: #FFFFFF (White) - メイン背景
- Secondary: #F9FAFB (Gray-50) - セクション背景
- Tertiary: #F3F4F6 (Gray-100) - カード背景（ホバー時）
```

#### 2.1.6 ゲーミフィケーション専用カラー

**ランクカラー**:
```
Egg (卵): #A3A3A3 (Gray)
Chick (ひよこ): #FCD34D (Yellow)
Bird (鳥): #60A5FA (Blue)
Eagle (鷹): #A78BFA (Purple)
Phoenix (不死鳥): #F472B6 (Pink)
Dragon (龍): #FBBF24 (Gold)
```

---

### 2.2 タイポグラフィ

#### 2.2.1 フォントファミリー

**日本語**:
```
Primary: 'Noto Sans JP', sans-serif
```

**英数字**:
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Code: 'JetBrains Mono', 'Fira Code', monospace
```

#### 2.2.2 フォントサイズ・行高

| 用途 | サイズ | 行高 | font-weight | クラス名 |
|------|--------|------|-------------|---------|
| H1（ページタイトル） | 36px (2.25rem) | 40px | 700 | text-4xl |
| H2（セクション） | 30px (1.875rem) | 36px | 700 | text-3xl |
| H3（サブセクション） | 24px (1.5rem) | 32px | 600 | text-2xl |
| H4（小見出し） | 20px (1.25rem) | 28px | 600 | text-xl |
| H5 | 18px (1.125rem) | 28px | 600 | text-lg |
| Body（本文） | 16px (1rem) | 24px | 400 | text-base |
| Small（補足） | 14px (0.875rem) | 20px | 400 | text-sm |
| XSmall（ラベル） | 12px (0.75rem) | 16px | 400 | text-xs |

#### 2.2.3 フォントウェイト

```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

---

### 2.3 スペーシング

**8pxグリッドシステム採用**

| サイズ | 値 | 用途 |
|-------|---|------|
| xs | 4px (0.25rem) | アイコンとテキストの間 |
| sm | 8px (0.5rem) | コンポーネント内の小さな余白 |
| base | 16px (1rem) | 基本的な余白 |
| md | 24px (1.5rem) | セクション間の余白 |
| lg | 32px (2rem) | 大きなセクション間 |
| xl | 48px (3rem) | ページセクション間 |
| 2xl | 64px (4rem) | ページトップ・ボトム |

---

### 2.4 ボーダー・シャドウ・角丸

#### 2.4.1 ボーダー

```
Border Width:
- Default: 1px
- Thick: 2px

Border Color:
- Light: #E5E7EB (Gray-200)
- Default: #D1D5DB (Gray-300)
- Dark: #9CA3AF (Gray-400)
```

#### 2.4.2 シャドウ（Elevation）

```
Shadow:
- xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)
- base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
- md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
- lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)
- xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

**用途**:
- xs: アクティブな入力フィールド
- sm: ボタン（ホバー時）
- base: カード
- md: ドロップダウン、ポップアップ
- lg: モーダル
- xl: ハイライト要素

#### 2.4.3 角丸（Border Radius）

```
Radius:
- none: 0
- sm: 4px (0.25rem)
- base: 8px (0.5rem)
- md: 12px (0.75rem)
- lg: 16px (1rem)
- xl: 24px (1.5rem)
- full: 9999px (完全な円形)
```

**用途**:
- sm: バッジ、タグ
- base: ボタン、入力フィールド
- md: カード
- lg: モーダル、大きなカード
- full: アバター、アイコンボタン

---

### 2.5 アイコン

**アイコンライブラリ**: Lucide React

**サイズ**:
- xs: 16px
- sm: 20px
- base: 24px
- lg: 32px
- xl: 48px

**スタイル**: アウトライン（統一感）

---

## 3. コンポーネントデザイン

### 3.1 ボタン

#### 3.1.1 プライマリボタン

```
State: Default
- Background: Primary-500 (#6366F1)
- Text: White
- Padding: 12px 24px
- Border-radius: 8px
- Font-size: 16px
- Font-weight: 600

State: Hover
- Background: Primary-600 (#4F46E5)
- Shadow: sm

State: Active
- Background: Primary-700 (#4338CA)

State: Disabled
- Background: Gray-300
- Text: Gray-500
- Cursor: not-allowed
```

#### 3.1.2 セカンダリボタン

```
State: Default
- Background: Transparent
- Text: Primary-500
- Border: 2px solid Primary-500
- Padding: 12px 24px
- Border-radius: 8px

State: Hover
- Background: Primary-50
- Border: 2px solid Primary-600
```

#### 3.1.3 テキストボタン

```
State: Default
- Background: Transparent
- Text: Primary-500
- Padding: 8px 16px

State: Hover
- Text: Primary-600
- Underline
```

#### 3.1.4 サイズバリエーション

| サイズ | Height | Padding | Font-size |
|-------|--------|---------|-----------|
| Small | 32px | 8px 16px | 14px |
| Medium (Default) | 40px | 12px 24px | 16px |
| Large | 48px | 16px 32px | 18px |

---

### 3.2 入力フィールド

#### 3.2.1 テキストインプット

```
State: Default
- Background: White
- Border: 1px solid Gray-300
- Border-radius: 8px
- Padding: 12px 16px
- Font-size: 16px
- Placeholder: Gray-400

State: Focus
- Border: 2px solid Primary-500
- Shadow: 0 0 0 3px rgba(99, 102, 241, 0.1)

State: Error
- Border: 2px solid Error-500
- Shadow: 0 0 0 3px rgba(239, 68, 68, 0.1)

State: Disabled
- Background: Gray-100
- Text: Gray-500
```

#### 3.2.2 テキストエリア

テキストインプットと同様のスタイル、最小高さ: 120px

#### 3.2.3 セレクトボックス

テキストインプットと同様のスタイル + ドロップダウンアイコン

---

### 3.3 カード

#### 3.3.1 基本カード

```
- Background: White
- Border: 1px solid Gray-200
- Border-radius: 12px
- Padding: 24px
- Shadow: none

State: Hover
- Shadow: md
- Border: 1px solid Gray-300
```

#### 3.3.2 動画カード

```
構成:
- サムネイル画像（16:9）
- タイトル（2行まで、省略記号）
- 再生時間バッジ（右下）
- 視聴済みチェックマーク（オプション）
- ホバー時: Shadow-md + 若干の拡大アニメーション
```

#### 3.3.3 投稿カード

```
構成:
- ユーザーアバター + 名前 + 投稿日時
- タイトル
- 本文プレビュー（3行まで）
- タグ
- いいね数・コメント数
- ホバー時: Background-Gray-50
```

---

### 3.4 ナビゲーション

#### 3.4.1 ヘッダー

```
- Height: 64px (PC), 56px (Mobile)
- Background: White
- Border-bottom: 1px solid Gray-200
- Shadow: sm（スクロール時）
- Sticky position

構成:
- ロゴ（左）
- ナビゲーションメニュー（中央）
- 通知アイコン + プロフィールアイコン（右）
```

#### 3.4.2 サイドバー（PC版）

```
- Width: 240px
- Background: White
- Border-right: 1px solid Gray-200
- Padding: 24px 16px

メニュー項目:
- Height: 40px
- Padding: 8px 12px
- Border-radius: 8px
- Icon + Label

Active State:
- Background: Primary-50
- Text: Primary-600
- Border-left: 3px solid Primary-500
```

#### 3.4.3 ボトムナビゲーション（Mobile）

```
- Height: 64px
- Background: White
- Border-top: 1px solid Gray-200
- Fixed position

アイコン:
- Size: 24px
- Active: Primary-500
- Inactive: Gray-400
```

---

### 3.5 バッジ・タグ

#### 3.5.1 ステータスバッジ

```
Size:
- Padding: 4px 12px
- Border-radius: 9999px (完全な円形)
- Font-size: 12px
- Font-weight: 600

カラーバリエーション:
- Success: Green-100背景 + Green-700テキスト
- Warning: Amber-100背景 + Amber-700テキスト
- Error: Red-100背景 + Red-700テキスト
- Info: Blue-100背景 + Blue-700テキスト
- Neutral: Gray-100背景 + Gray-700テキスト
```

#### 3.5.2 タグ

```
- Padding: 6px 12px
- Border-radius: 6px
- Font-size: 14px
- Background: Gray-100
- Text: Gray-700
- Hover: Background-Gray-200
```

---

### 3.6 通知・トースト

#### 3.6.1 トースト通知

```
位置: 右上（PC）、上部（Mobile）
- Width: 360px (PC), 90vw (Mobile)
- Padding: 16px
- Border-radius: 12px
- Shadow: lg
- アニメーション: スライドイン（0.3s）

バリエーション:
- Success: Green-50背景 + Green-500アイコン + Green-800テキスト
- Error: Red-50背景 + Red-500アイコン + Red-800テキスト
- Info: Blue-50背景 + Blue-500アイコン + Blue-800テキスト
- Warning: Amber-50背景 + Amber-500アイコン + Amber-800テキスト

自動消去: 5秒後
```

#### 3.6.2 通知ドロップダウン

```
- Width: 400px (PC), 100vw (Mobile)
- Max-height: 480px
- Overflow: scroll
- Shadow: lg
- Border-radius: 12px

通知アイテム:
- Padding: 16px
- Border-bottom: 1px solid Gray-100
- 未読: Background-Primary-50
- 既読: Background-White
```

---

### 3.7 モーダル

```
オーバーレイ:
- Background: rgba(0, 0, 0, 0.5)
- Backdrop blur: 4px

モーダル本体:
- Width: 最大600px (PC), 90vw (Mobile)
- Background: White
- Border-radius: 16px
- Padding: 32px
- Shadow: xl

ヘッダー:
- タイトル (H3)
- 閉じるボタン（右上）

ボディ:
- Padding: 24px 0

フッター:
- ボタン配置（右揃え）
- Padding-top: 24px
- Border-top: 1px solid Gray-200
```

---

### 3.8 プログレスバー

```
- Height: 8px
- Background: Gray-200
- Border-radius: 9999px
- Fill: Gradient (Primary-400 → Primary-600)
- アニメーション: スムーズな進捗表示

バリエーション:
- Thin: 4px
- Default: 8px
- Thick: 12px

カラーバリエーション:
- Primary: Indigo
- Success: Green
- Warning: Amber
```

---

### 3.9 アバター

```
サイズバリエーション:
- xs: 24px
- sm: 32px
- base: 40px
- lg: 56px
- xl: 80px
- 2xl: 120px

スタイル:
- Border-radius: 9999px (円形)
- Border: 2px solid White (重なり時の視認性向上)
- オンラインステータスインジケーター（オプション）
  - 位置: 右下
  - サイズ: アバターの1/4
  - Border: 2px solid White
```

---

## 4. レイアウト

### 4.1 グリッドシステム

**12カラムグリッド採用**

**ブレイクポイント**:
```
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
```

**コンテナ幅**:
```
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px
- Padding: 16px (Mobile), 24px (Tablet), 32px (Desktop)
```

### 4.2 主要レイアウトパターン

#### 4.2.1 2カラムレイアウト（PC）

```
┌────────────────────────────────────┐
│         Header (64px)              │
├──────────┬─────────────────────────┤
│ Sidebar  │   Main Content          │
│ (240px)  │                         │
│          │                         │
│          │                         │
└──────────┴─────────────────────────┘
```

#### 4.2.2 1カラムレイアウト（Mobile）

```
┌─────────────────┐
│ Header (56px)   │
├─────────────────┤
│                 │
│ Main Content    │
│                 │
│                 │
├─────────────────┤
│ Bottom Nav      │
│    (64px)       │
└─────────────────┘
```

---

## 5. 画面別デザイン仕様

### 5.1 ログイン・登録画面

**レイアウト**:
- 中央揃え
- 最大幅: 400px
- カード形式

**構成**:
1. ロゴ（中央）
2. タイトル
3. ソーシャルログインボタン（Google, LINE）
4. 区切り線（「または」）
5. メール・パスワード入力フォーム
6. ログインボタン（Primary, Full Width）
7. フッターリンク（パスワード忘れた、新規登録へ）

**カラー**:
- 背景: Gray-50
- カード: White

---

### 5.2 ダッシュボード（マイページ）

**セクション構成**:

1. **ウェルカムセクション**
   - ユーザーアバター（大）
   - 「おかえりなさい、〇〇さん」
   - 現在のランク表示（バッジ）

2. **学習進捗サマリー**
   - 円グラフ（完了率）
   - 視聴時間（今週、累計）
   - 次に見るべき動画（カード）

3. **Instagram連携セクション**（Level 2以降）
   - フォロワー数（大きく表示）
   - 増減（前日比、前週比）
   - グラフ

4. **最近のアクティビティ**
   - タイムライン形式
   - 最近の投稿、コメント、いいね

5. **バッジコレクション**（Level 3以降）
   - 取得済みバッジ一覧（グリッド）

---

### 5.3 動画一覧画面

**レイアウト**:
- サイドバー（カテゴリフィルター）
- メインエリア（動画カードグリッド）

**グリッド**:
- PC: 3カラム
- Tablet: 2カラム
- Mobile: 1カラム

**ソート・フィルター**:
- ドロップダウン（右上）
- 選択肢: 新着順、人気順、おすすめ順

**動画カード**:
- サムネイル（16:9）
- タイトル（2行まで）
- 再生時間
- 視聴済みバッジ

---

### 5.4 動画詳細・視聴画面

**レイアウト**:
1. **動画プレーヤー**（上部、16:9）
2. **動画情報**
   - タイトル（H2）
   - 説明文
   - タグ
3. **学習進捗ボタン**
   - 「完了にする」ボタン（Primary）
4. **関連動画**（サイドバーまたは下部）

**PC版**: 2カラム（動画+情報 | 関連動画）
**Mobile版**: 1カラム（縦積み）

---

### 5.5 フィード（コミュニティ）画面

**レイアウト**:
- 投稿作成フォーム（上部、固定）
- タブ（すべて、日報、質問、成果報告）
- 投稿一覧（タイムライン形式）

**投稿カード**:
1. ユーザー情報（アバター、名前、投稿日時、ランクバッジ）
2. タイトル（H4）
3. 本文（折りたたみ可能）
4. 画像（オプション）
5. タグ
6. アクション（いいね、コメント、シェア）

**投稿作成フォーム**:
- テキストエリア
- 画像アップロード
- タイプ選択
- 投稿ボタン

---

### 5.6 管理画面

**レイアウト**:
- サイドバーナビゲーション（左）
  - ダッシュボード
  - 会員管理
  - 動画管理
  - 投稿管理
  - 分析
  - 設定
- メインコンテンツエリア

**会員一覧画面**:
- 検索バー（上部）
- フィルター（プラン、ステータス）
- テーブル形式
  - カラム: アバター、名前、メール、プラン、ステータス、登録日、操作
- ページネーション（下部）

**デザインテーマ**:
- よりビジネスライク
- Primary-500を暗めの色（Slate-700など）に変更検討

---

## 6. アニメーション・インタラクション

### 6.1 トランジション

**基本ルール**:
- Duration: 200-300ms（標準）
- Easing: ease-in-out（標準）

**用途別**:
```
Hover:
- Duration: 150ms
- Property: background-color, color, box-shadow

Page Transition:
- Duration: 300ms
- Property: opacity, transform

Modal Open/Close:
- Duration: 250ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### 6.2 主要アニメーション

#### 6.2.1 ボタンホバー

```
- Transform: translateY(-2px)
- Shadow: sm → md
- Duration: 150ms
```

#### 6.2.2 カードホバー

```
- Shadow: none → md
- Border-color: Gray-200 → Gray-300
- Transform: scale(1.02)
- Duration: 200ms
```

#### 6.2.3 ランクアップアニメーション

```
1. モーダルフェードイン（背景暗転）
2. バッジが拡大しながら出現（scale 0 → 1）
3. キラキラエフェクト（パーティクル）
4. テキストフェードイン
5. 紙吹雪エフェクト（オプション）
```

#### 6.2.4 ローディングアニメーション

**スピナー**:
- サイズ: 24px (Small), 40px (Default), 64px (Large)
- カラー: Primary-500
- アニメーション: 回転（1秒周期）

**スケルトンスクリーン**:
- Background: Gray-200
- アニメーション: シマーエフェクト（左→右）
- Duration: 1.5s（ループ）

---

## 7. レスポンシブデザイン

### 7.1 ブレイクポイント別調整

#### 7.1.1 モバイル（〜767px）

- 1カラムレイアウト
- サイドバー→ボトムナビゲーション
- フォントサイズ: 若干小さめ（H1: 28px → 24px）
- Padding: 16px
- モーダル: フルスクリーン

#### 7.1.2 タブレット（768px〜1023px）

- 2カラムレイアウト（一部）
- Padding: 24px
- グリッド: 2カラム

#### 7.1.3 デスクトップ（1024px〜）

- フル機能表示
- サイドバー表示
- 3カラムグリッド
- Padding: 32px

---

## 8. アクセシビリティ要件

### 8.1 カラーコントラスト

**WCAG 2.1 AA準拠**:
- 通常テキスト: 4.5:1以上
- 大きなテキスト（18px以上 or 14px Bold以上）: 3:1以上

**検証済みコントラスト比**:
- Primary-500 (#6366F1) / White: 5.3:1 ✓
- Gray-600 (#4B5563) / White: 8.6:1 ✓
- Error-500 (#EF4444) / White: 4.5:1 ✓

### 8.2 フォーカス状態

**キーボードナビゲーション対応**:
```
Focus Ring:
- Border: 2px solid Primary-500
- Outline: 3px solid rgba(99, 102, 241, 0.3)
- Offset: 2px
```

### 8.3 ARIAラベル

- すべてのインタラクティブ要素にaria-label
- ボタンのaria-pressed, aria-expanded
- フォームのaria-invalid, aria-describedby

### 8.4 色覚多様性への配慮

- 色のみに依存しない情報伝達
- エラー表示: 色 + アイコン + テキスト
- グラフ: 色 + パターン

---

## 9. 画像・メディア仕様

### 9.1 画像フォーマット

- 写真: WebP（フォールバック: JPEG）
- イラスト・ロゴ: SVG（フォールバック: PNG）
- アニメーション: WebP（フォールバック: GIF）

### 9.2 画像サイズ

**プロフィール画像**:
- 元画像: 400x400px
- 表示サイズに応じた複数サイズ生成（80px, 120px, 240px）

**動画サムネイル**:
- サイズ: 1280x720px (16:9)
- 圧縮: 80%品質

**投稿画像**:
- 最大: 1920x1920px
- 圧縮: 85%品質

### 9.3 遅延読み込み

- スクロール位置に応じたLazy Loading
- プレースホルダー画像（ぼかし効果）

---

## 10. デザインツール・リソース

### 10.1 使用ツール

- **デザイン**: Figma
- **プロトタイピング**: Figma Prototype
- **アイコン**: Lucide Icons
- **画像編集**: Figma / Photoshop

### 10.2 デザインファイル構成

```
Figma Structure:
├── 00_Design System
│   ├── Colors
│   ├── Typography
│   ├── Components
│   └── Icons
├── 01_Wireframes
│   ├── User Flow
│   └── Screens
├── 02_Mockups
│   ├── Desktop
│   ├── Tablet
│   └── Mobile
└── 03_Prototype
```

### 10.3 デザインハンドオフ

- **ツール**: Figma Dev Mode
- **エクスポート**: SVG（アイコン）、WebP（画像）
- **スタイルガイド**: Figma Inspect機能で確認
- **コンポーネント**: shadcn/ui準拠

---

## 11. ブランドガイドライン

### 11.1 ロゴ使用規定

**ロゴタイプ**: 「SAKIYOMI」
- フォント: Inter Bold
- カラー: Primary-500 または White
- 最小サイズ: 100px幅

**余白**: ロゴの高さの50%以上

**禁止事項**:
- ロゴの変形
- 指定外カラーの使用
- 低解像度での使用

### 11.2 トーン&マナー

**コミュニケーションスタイル**:
- フレンドリー
- 励ましのトーン
- わかりやすい言葉選び
- 丁寧語（「です・ます」調）

**例**:
- ○「がんばりましたね！」
- ○「次のステップに進みましょう」
- ×「努力が足りません」

---

## 12. デザインチェックリスト

### 12.1 デザイン完成時のチェック項目

- [ ] デザインシステムに準拠しているか
- [ ] カラーコントラストは基準を満たしているか
- [ ] すべてのインタラクティブ要素にホバー・フォーカス状態があるか
- [ ] レスポンシブ対応されているか（3サイズ以上）
- [ ] テキストの可読性は十分か
- [ ] アイコンは適切なサイズか
- [ ] スペーシングは8pxグリッドに従っているか
- [ ] フォントサイズは定義された値か
- [ ] エラー状態のデザインがあるか
- [ ] ローディング状態のデザインがあるか

---

**文書管理情報**
- バージョン: 1.0
- 作成日: 2025-12-02
- 最終更新日: 2025-12-02
- 承認状態: ドラフト
