# API仕様書

## 1. API概要

### 1.1 基本情報

- **ベースURL**: `https://api.sakiyomi.com/v1`
- **プロトコル**: HTTPS
- **レスポンス形式**: JSON
- **文字コード**: UTF-8
- **認証方式**: JWT (JSON Web Token)
- **APIバージョニング**: URLパスによるバージョン管理

### 1.2 共通仕様

#### 1.2.1 リクエストヘッダー

| ヘッダー名 | 必須 | 説明 | 例 |
|-----------|------|------|---|
| Authorization | ○ (認証が必要なエンドポイント) | Bearer形式のアクセストークン | `Bearer eyJhbGc...` |
| Content-Type | ○ (POST/PUT/PATCH) | コンテンツタイプ | `application/json` |
| Accept | - | 受け入れ可能な形式 | `application/json` |

#### 1.2.2 レスポンス形式

**成功レスポンス**:
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "meta": {
    "timestamp": "2025-12-02T10:00:00Z"
  }
}
```

**エラーレスポンス**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-12-02T10:00:00Z"
  }
}
```

#### 1.2.3 HTTPステータスコード

| ステータスコード | 説明 |
|----------------|------|
| 200 OK | リクエスト成功 |
| 201 Created | リソース作成成功 |
| 204 No Content | リクエスト成功（レスポンスボディなし） |
| 400 Bad Request | リクエストが不正 |
| 401 Unauthorized | 認証エラー |
| 403 Forbidden | 権限エラー |
| 404 Not Found | リソースが存在しない |
| 422 Unprocessable Entity | バリデーションエラー |
| 429 Too Many Requests | レート制限超過 |
| 500 Internal Server Error | サーバーエラー |
| 503 Service Unavailable | サービス利用不可 |

#### 1.2.4 エラーコード一覧

| コード | 説明 |
|-------|------|
| UNAUTHORIZED | 認証エラー |
| FORBIDDEN | 権限エラー |
| NOT_FOUND | リソースが見つからない |
| VALIDATION_ERROR | バリデーションエラー |
| RATE_LIMIT_EXCEEDED | レート制限超過 |
| INTERNAL_ERROR | サーバーエラー |
| SERVICE_UNAVAILABLE | サービス利用不可 |

---

## 2. 認証API

### 2.1 会員登録

**エンドポイント**: `POST /auth/register`

**概要**: 新規会員登録

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "山田太郎",
  "nickname": "yamada"
}
```

**バリデーション**:
- `email`: 必須、メール形式、最大255文字
- `password`: 必須、8文字以上64文字以下、半角英数字含む
- `name`: 必須、1〜100文字
- `nickname`: オプション、1〜50文字

**レスポンス** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "山田太郎",
      "nickname": "yamada",
      "status": "pending"
    },
    "message": "認証メールを送信しました。メールを確認してアカウントを有効化してください。"
  }
}
```

---

### 2.2 ログイン

**エンドポイント**: `POST /auth/login`

**概要**: メール・パスワードでログイン

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "山田太郎",
      "role": "member",
      "avatar_url": "https://..."
    }
  }
}
```

---

### 2.3 トークンリフレッシュ

**エンドポイント**: `POST /auth/refresh`

**概要**: アクセストークンの更新

**認証**: 不要（Refresh Tokenを使用）

**リクエストボディ**:
```json
{
  "refreshToken": "refresh_token_string"
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### 2.4 ログアウト

**エンドポイント**: `POST /auth/logout`

**認証**: 必要

**リクエストボディ**:
```json
{
  "refreshToken": "refresh_token_string"
}
```

**レスポンス** (204 No Content)

---

### 2.5 パスワードリセット申請

**エンドポイント**: `POST /auth/forgot-password`

**認証**: 不要

**リクエストボディ**:
```json
{
  "email": "user@example.com"
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "パスワードリセット用のメールを送信しました。"
  }
}
```

---

### 2.6 パスワードリセット実行

**エンドポイント**: `POST /auth/reset-password`

**認証**: 不要（トークンで認証）

**リクエストボディ**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "パスワードを変更しました。"
  }
}
```

---

## 3. ユーザーAPI

### 3.1 自分の情報取得

**エンドポイント**: `GET /users/me`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "山田太郎",
    "nickname": "yamada",
    "avatar_url": "https://...",
    "status": "active",
    "role": "member",
    "profile": {
      "bio": "自己紹介文",
      "website_url": "https://...",
      "location": "東京都"
    },
    "subscription": {
      "plan": "ベーシックプラン",
      "status": "active",
      "current_period_end": "2026-01-02T00:00:00Z"
    },
    "instagram": {
      "is_connected": true,
      "username": "instagram_handle",
      "followers_count": 5000
    },
    "gamification": {
      "current_rank": "Bird（鳥）",
      "total_xp": 1500,
      "level": 5,
      "badges_count": 12
    }
  }
}
```

---

### 3.2 自分の情報更新

**エンドポイント**: `PATCH /users/me`

**認証**: 必要

**リクエストボディ**:
```json
{
  "name": "山田太郎",
  "nickname": "yamada_new",
  "avatar_url": "https://...",
  "profile": {
    "bio": "新しい自己紹介",
    "website_url": "https://...",
    "location": "大阪府"
  }
}
```

**レスポンス** (200 OK): 更新後のユーザー情報

---

### 3.3 ユーザー情報取得（公開情報）

**エンドポイント**: `GET /users/:userId`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "山田太郎",
    "nickname": "yamada",
    "avatar_url": "https://...",
    "profile": {
      "bio": "自己紹介文",
      "website_url": "https://..."
    },
    "gamification": {
      "current_rank": "Bird（鳥）",
      "level": 5,
      "badges_count": 12,
      "favorite_badges": [...]
    }
  }
}
```

---

## 4. 学習管理API

### 4.1 カテゴリ一覧取得

**エンドポイント**: `GET /categories`

**認証**: 必要

**クエリパラメータ**: なし

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Instagram基礎",
        "slug": "instagram-basics",
        "description": "Instagramの基本を学ぶ",
        "icon_url": "https://...",
        "courses_count": 5
      }
    ]
  }
}
```

---

### 4.2 コース一覧取得

**エンドポイント**: `GET /courses`

**認証**: 必要

**クエリパラメータ**:
- `category_id` (オプション): カテゴリID
- `level` (オプション): レベル（beginner/intermediate/advanced）
- `page` (オプション): ページ番号（デフォルト: 1）
- `per_page` (オプション): 1ページあたりの件数（デフォルト: 20）

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "title": "Instagram初心者講座",
        "slug": "instagram-beginner",
        "description": "説明文",
        "thumbnail_url": "https://...",
        "level": "beginner",
        "duration_minutes": 120,
        "chapters_count": 5,
        "lessons_count": 20,
        "my_progress": {
          "completed_lessons": 5,
          "progress_percentage": 25
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

---

### 4.3 コース詳細取得

**エンドポイント**: `GET /courses/:courseId`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Instagram初心者講座",
    "description": "詳細説明",
    "thumbnail_url": "https://...",
    "level": "beginner",
    "duration_minutes": 120,
    "chapters": [
      {
        "id": "uuid",
        "title": "第1章: アカウント設計",
        "lessons": [
          {
            "id": "uuid",
            "title": "1-1: プロフィール最適化",
            "duration_seconds": 600,
            "is_free": false,
            "my_progress": {
              "status": "completed",
              "completed_at": "2025-12-01T10:00:00Z"
            }
          }
        ]
      }
    ]
  }
}
```

---

### 4.4 レッスン詳細取得

**エンドポイント**: `GET /lessons/:lessonId`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "1-1: プロフィール最適化",
    "description": "説明",
    "video_provider": "vimeo",
    "video_id": "123456789",
    "video_url": "https://player.vimeo.com/video/123456789",
    "thumbnail_url": "https://...",
    "duration_seconds": 600,
    "is_free": false,
    "my_progress": {
      "status": "in_progress",
      "last_position_seconds": 120,
      "progress_percentage": 20
    },
    "can_access": true
  }
}
```

---

### 4.5 学習進捗記録

**エンドポイント**: `POST /progress`

**認証**: 必要

**リクエストボディ**:
```json
{
  "lesson_id": "uuid",
  "status": "completed",
  "last_position_seconds": 600,
  "progress_percentage": 100
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "lesson_id": "uuid",
    "status": "completed",
    "progress_percentage": 100,
    "completed_at": "2025-12-02T10:00:00Z",
    "xp_earned": 50
  }
}
```

---

### 4.6 自分の学習進捗取得

**エンドポイント**: `GET /progress/me`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_lessons": 100,
      "completed_lessons": 25,
      "in_progress_lessons": 5,
      "progress_percentage": 25,
      "total_watch_time_minutes": 1200
    },
    "recent_progress": [
      {
        "lesson": {
          "id": "uuid",
          "title": "レッスンタイトル"
        },
        "status": "completed",
        "completed_at": "2025-12-02T10:00:00Z"
      }
    ]
  }
}
```

---

## 5. Instagram連携API

### 5.1 Instagram連携開始

**エンドポイント**: `POST /instagram/connect`

**認証**: 必要

**概要**: Instagram OAuth認証URLを返す

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "auth_url": "https://api.instagram.com/oauth/authorize?..."
  }
}
```

---

### 5.2 Instagram連携コールバック

**エンドポイント**: `POST /instagram/callback`

**認証**: 必要

**リクエストボディ**:
```json
{
  "code": "authorization_code_from_instagram"
}
```

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "instagram_account": {
      "id": "uuid",
      "username": "instagram_handle",
      "account_name": "アカウント名",
      "profile_picture_url": "https://...",
      "is_connected": true
    }
  }
}
```

---

### 5.3 Instagram連携解除

**エンドポイント**: `DELETE /instagram/disconnect`

**認証**: 必要

**レスポンス** (204 No Content)

---

### 5.4 Instagramプロフィール取得

**エンドポイント**: `GET /instagram/profile`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "username": "instagram_handle",
    "account_name": "アカウント名",
    "profile_picture_url": "https://...",
    "is_connected": true,
    "last_synced_at": "2025-12-02T10:00:00Z"
  }
}
```

---

### 5.5 Instagramメトリクス取得

**エンドポイント**: `GET /instagram/metrics`

**認証**: 必要

**クエリパラメータ**:
- `period` (オプション): 期間（7d/30d/90d/all、デフォルト: 30d）

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "current": {
      "followers_count": 5000,
      "following_count": 300,
      "media_count": 120
    },
    "growth": {
      "followers_change_7d": 50,
      "followers_change_30d": 200,
      "followers_change_percentage_7d": 1.0
    },
    "timeline": [
      {
        "date": "2025-12-01",
        "followers_count": 4950,
        "following_count": 300,
        "media_count": 120
      }
    ]
  }
}
```

---

## 6. コミュニティAPI

### 6.1 投稿一覧取得

**エンドポイント**: `GET /posts`

**認証**: 必要

**クエリパラメータ**:
- `post_type` (オプション): 投稿タイプ（daily/question/achievement/general）
- `tag` (オプション): タグでフィルター
- `sort` (オプション): ソート（latest/popular、デフォルト: latest）
- `page` (オプション): ページ番号
- `per_page` (オプション): 件数

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "name": "山田太郎",
          "avatar_url": "https://...",
          "current_rank": "Bird"
        },
        "post_type": "daily",
        "title": "今日の活動報告",
        "content": "本文...",
        "images": ["https://..."],
        "tags": ["日報", "成長"],
        "reactions_count": 15,
        "comments_count": 3,
        "my_reaction": "like",
        "created_at": "2025-12-02T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 6.2 投稿作成

**エンドポイント**: `POST /posts`

**認証**: 必要

**リクエストボディ**:
```json
{
  "post_type": "daily",
  "title": "今日の活動報告",
  "content": "本文...",
  "images": ["https://..."],
  "tags": ["日報", "成長"]
}
```

**レスポンス** (201 Created): 作成された投稿情報

---

### 6.3 投稿詳細取得

**エンドポイント**: `GET /posts/:postId`

**認証**: 必要

**レスポンス** (200 OK): 投稿詳細 + コメント一覧

---

### 6.4 投稿編集

**エンドポイント**: `PATCH /posts/:postId`

**認証**: 必要（自分の投稿のみ）

---

### 6.5 投稿削除

**エンドポイント**: `DELETE /posts/:postId`

**認証**: 必要（自分の投稿のみ）

**レスポンス** (204 No Content)

---

### 6.6 コメント投稿

**エンドポイント**: `POST /posts/:postId/comments`

**認証**: 必要

**リクエストボディ**:
```json
{
  "content": "コメント内容",
  "parent_comment_id": "uuid (返信の場合)"
}
```

**レスポンス** (201 Created)

---

### 6.7 リアクション追加

**エンドポイント**: `POST /posts/:postId/reactions`

**認証**: 必要

**リクエストボディ**:
```json
{
  "reaction_type": "like"
}
```

**レスポンス** (201 Created)

---

### 6.8 リアクション削除

**エンドポイント**: `DELETE /posts/:postId/reactions`

**認証**: 必要

**レスポンス** (204 No Content)

---

## 7. ゲーミフィケーションAPI

### 7.1 自分のランク取得

**エンドポイント**: `GET /gamification/rank`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "current_rank": {
      "level": 3,
      "name": "Bird（鳥）",
      "color": "#60A5FA",
      "icon_url": "https://..."
    },
    "next_rank": {
      "level": 4,
      "name": "Eagle（鷹）",
      "required_followers": 10000,
      "required_progress": 60
    },
    "progress_to_next": {
      "followers_progress": 50.0,
      "learning_progress": 45.0
    }
  }
}
```

---

### 7.2 XP取得履歴

**エンドポイント**: `GET /gamification/xp`

**認証**: 必要

**クエリパラメータ**:
- `period` (オプション): 7d/30d/all

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "total_xp": 1500,
    "current_level": 5,
    "xp_to_next_level": 150,
    "recent_transactions": [
      {
        "action_type": "video_complete",
        "xp_amount": 50,
        "description": "動画「〇〇」を視聴完了",
        "created_at": "2025-12-02T10:00:00Z"
      }
    ]
  }
}
```

---

### 7.3 取得バッジ一覧

**エンドポイント**: `GET /gamification/badges`

**認証**: 必要

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "earned_badges": [
      {
        "id": "uuid",
        "badge": {
          "name": "初めての一歩",
          "description": "初めて動画を視聴",
          "icon_url": "https://...",
          "category": "learning"
        },
        "earned_at": "2025-11-01T10:00:00Z",
        "is_favorite": true
      }
    ],
    "total_count": 12,
    "categories_count": {
      "learning": 5,
      "community": 4,
      "achievement": 3
    }
  }
}
```

---

### 7.4 ランキング取得

**エンドポイント**: `GET /gamification/leaderboard`

**認証**: 必要

**クエリパラメータ**:
- `type` (必須): ランキングタイプ（xp/followers/engagement）
- `period` (オプション): 7d/30d/all

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": "uuid",
          "name": "ユーザー名",
          "avatar_url": "https://...",
          "current_rank": "Dragon"
        },
        "value": 10000,
        "is_me": false
      }
    ],
    "my_ranking": {
      "rank": 25,
      "value": 1500
    }
  }
}
```

---

## 8. 通知API

### 8.1 通知一覧取得

**エンドポイント**: `GET /notifications`

**認証**: 必要

**クエリパラメータ**:
- `is_read` (オプション): 既読/未読フィルター
- `page` (オプション)
- `per_page` (オプション)

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "notification_type": "comment",
        "title": "新しいコメント",
        "content": "〇〇さんがあなたの投稿にコメントしました",
        "action_url": "/posts/xxx",
        "is_read": false,
        "created_at": "2025-12-02T10:00:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {...}
  }
}
```

---

### 8.2 通知を既読にする

**エンドポイント**: `PATCH /notifications/:notificationId/read`

**認証**: 必要

**レスポンス** (200 OK)

---

### 8.3 全通知を既読にする

**エンドポイント**: `POST /notifications/read-all`

**認証**: 必要

**レスポンス** (200 OK)

---

## 9. 管理者API

### 9.1 会員一覧取得

**エンドポイント**: `GET /admin/users`

**認証**: 必要（管理者のみ）

**クエリパラメータ**:
- `search` (オプション): 検索キーワード
- `status` (オプション): ステータスフィルター
- `plan_id` (オプション): プランフィルター
- `page`, `per_page`

**レスポンス** (200 OK): 会員一覧

---

### 9.2 会員詳細取得

**エンドポイント**: `GET /admin/users/:userId`

**認証**: 必要（管理者のみ）

**レスポンス** (200 OK): 会員詳細情報

---

### 9.3 会員情報編集

**エンドポイント**: `PATCH /admin/users/:userId`

**認証**: 必要（管理者のみ）

---

### 9.4 分析データ取得

**エンドポイント**: `GET /admin/analytics`

**認証**: 必要（管理者のみ）

**レスポンス** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 500,
      "active": 450,
      "new_this_month": 50
    },
    "subscriptions": {
      "active_subscriptions": 400,
      "mrr": 3920000,
      "churn_rate": 2.5
    },
    "engagement": {
      "dau": 200,
      "mau": 450,
      "avg_session_duration_minutes": 15
    }
  }
}
```

---

## 10. レート制限

### 10.1 制限値

| エンドポイント種別 | 制限 |
|-----------------|------|
| 認証API（ログイン） | 5リクエスト/分/IP |
| 認証API（登録） | 3リクエスト/時間/IP |
| 一般API | 100リクエスト/分/ユーザー |
| Instagram API呼び出し | 200リクエスト/時間 |

### 10.2 レスポンスヘッダー

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638446400
```

### 10.3 制限超過時のレスポンス

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "レート制限を超過しました。しばらく待ってから再試行してください。",
    "retry_after": 60
  }
}
```

---

## 11. Webhook（Stripe連携）

### 11.1 Webhookエンドポイント

**エンドポイント**: `POST /webhooks/stripe`

**認証**: Stripe署名検証

**処理するイベント**:
- `invoice.payment_succeeded`: 決済成功
- `invoice.payment_failed`: 決済失敗
- `customer.subscription.updated`: サブスクリプション更新
- `customer.subscription.deleted`: サブスクリプション削除

---

## 12. ページネーション

### 12.1 ページネーション形式

**リクエスト**:
```
GET /posts?page=2&per_page=20
```

**レスポンス**:
```json
{
  "success": true,
  "data": {
    "posts": [...]
  },
  "pagination": {
    "current_page": 2,
    "per_page": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": true
  }
}
```

---

**文書管理情報**
- バージョン: 1.0
- 作成日: 2025-12-02
- 最終更新日: 2025-12-02
- 承認状態: ドラフト
