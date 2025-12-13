# セキュリティ要件定義書

## 1. セキュリティ概要

### 1.1 セキュリティ方針

SAKIYOMIコミュニティプラットフォームは、会員の個人情報および決済情報を扱うため、高いセキュリティレベルを維持する。以下のセキュリティ基準に準拠する:

- **OWASP Top 10** への対応
- **PCI DSS** 準拠（Stripe利用により対応）
- **個人情報保護法** 準拠
- **GDPR** 基本対応（削除権等）

### 1.2 セキュリティ目標

1. **機密性（Confidentiality）**: 許可されたユーザーのみが情報にアクセスできる
2. **完全性（Integrity）**: データが改ざんされない
3. **可用性（Availability）**: サービスが継続的に利用可能
4. **認証性（Authentication）**: ユーザーの正当性を確認
5. **否認防止（Non-repudiation）**: 操作の証跡を記録

---

## 2. 認証・認可セキュリティ

### 2.1 パスワードセキュリティ

#### 2.1.1 パスワードポリシー

**必須要件**:
- 最小文字数: 8文字
- 最大文字数: 64文字
- 文字種: 半角英数字を含む（推奨: 記号も含む）

**推奨要件**:
- 大文字・小文字・数字・記号の組み合わせ
- 辞書攻撃対策（一般的な単語の禁止）
- 過去のパスワードとの重複禁止（直近3つ）

#### 2.1.2 パスワードハッシュ化

- **アルゴリズム**: bcrypt
- **Cost Factor**: 12（2^12回のハッシュ計算）
- **Salt**: 自動生成（bcrypt標準機能）

**実装例**:
```javascript
import bcrypt from 'bcrypt';

// パスワードハッシュ化
const hashedPassword = await bcrypt.hash(password, 12);

// パスワード検証
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

#### 2.1.3 パスワードリセット

- **トークン**: UUID v4（ランダム生成）
- **有効期限**: 1時間
- **ワンタイム**: 使用後は無効化
- **通知**: パスワード変更時にメール通知

---

### 2.2 JWT（JSON Web Token）セキュリティ

#### 2.2.1 アクセストークン

- **有効期限**: 15分
- **署名アルゴリズム**: HS256
- **署名鍵**: 256ビット以上のランダム文字列（環境変数で管理）
- **ペイロード**: 最小限の情報のみ（userId, email, role）

**ペイロード例**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "member",
  "iat": 1638446400,
  "exp": 1638447300
}
```

#### 2.2.2 リフレッシュトークン

- **有効期限**: 7日間
- **保存**: データベースに保存（ブラックリスト方式）
- **ローテーション**: 使用時に新しいトークンを発行
- **無効化**: ログアウト時、パスワード変更時

#### 2.2.3 トークン保管

**フロントエンド**:
- アクセストークン: メモリ（状態管理ライブラリ）
- リフレッシュトークン: HttpOnly Cookie（推奨）または Secure Local Storage

**セキュリティ設定**:
```javascript
// Cookie設定
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true, // HTTPS環境のみ
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7日
});
```

---

### 2.3 OAuth 2.0 セキュリティ

#### 2.3.1 Google OAuth

- **スコープ**: `email`, `profile`のみ（最小権限）
- **CSRF対策**: `state`パラメータの検証
- **PKCE**: Authorization Code Flow with PKCE使用

#### 2.3.2 LINE Login

- **スコープ**: `profile`, `email`
- **nonce**: リプレイ攻撃対策
- **トークン検証**: IDトークンの署名検証

---

### 2.4 ログイン保護

#### 2.4.1 ブルートフォース攻撃対策

- **ログイン試行制限**: 5回失敗でアカウントロック（30分間）
- **レート制限**: 5リクエスト/分/IP
- **CAPTCHA**: 3回失敗後に表示（reCAPTCHA v3）

**実装**:
```javascript
// Redisによるログイン試行回数管理
const loginAttempts = await redis.get(`login:${email}`);
if (loginAttempts >= 5) {
  throw new Error('アカウントがロックされています');
}
```

#### 2.4.2 不審なログイン検知

- **異なるIPからのログイン**: メール通知
- **異なるデバイスからのログイン**: メール通知
- **異常な時間帯のログイン**: ログ記録

---

### 2.5 多要素認証（MFA）（将来実装）

- **方式**: TOTP（Time-based One-Time Password）
- **アプリ**: Google Authenticator、Authy等
- **バックアップコード**: 10個生成

---

## 3. データセキュリティ

### 3.1 データ暗号化

#### 3.1.1 通信の暗号化

- **プロトコル**: HTTPS（TLS 1.3）
- **証明書**: Let's Encrypt / AWS Certificate Manager
- **HSTS**: Strict-Transport-Security ヘッダー設定
- **強制リダイレクト**: HTTP → HTTPS

**ヘッダー設定**:
```javascript
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

#### 3.1.2 データベース暗号化

- **保存時暗号化（At Rest）**: PostgreSQL透過的データ暗号化（TDE）
- **通信時暗号化（In Transit）**: SSL/TLS接続

#### 3.1.3 機密データの暗号化

以下のデータは暗号化して保存:
- Instagramアクセストークン
- OAuthトークン
- 決済関連情報（Stripe使用のため最小限）

**暗号化方式**:
- **アルゴリズム**: AES-256-GCM
- **鍵管理**: AWS KMS / Google Cloud KMS
- **鍵ローテーション**: 年1回

**実装例**:
```javascript
import { encrypt, decrypt } from './crypto';

// 暗号化
const encryptedToken = encrypt(accessToken);
await db.save({ access_token: encryptedToken });

// 復号化
const decryptedToken = decrypt(encryptedToken);
```

---

### 3.2 個人情報保護

#### 3.2.1 個人情報の定義

以下を個人情報として扱う:
- 氏名、メールアドレス
- プロフィール情報
- Instagram連携情報
- 学習履歴
- 投稿・コメント履歴
- 決済情報

#### 3.2.2 アクセス制御

- **本人のみアクセス可能**: 個人情報、決済情報
- **管理者のみアクセス可能**: 全会員情報（必要最小限）
- **ロールベースアクセス制御（RBAC）**: 管理者の権限も細分化

#### 3.2.3 データ保持期間

| データ種別 | 保持期間 |
|-----------|---------|
| 会員情報 | 退会後3年間（法令要件） |
| 決済ログ | 7年間（法令要件） |
| アクセスログ | 1年間 |
| 操作ログ（監査ログ） | 3年間 |

#### 3.2.4 削除権（GDPR対応）

- **アカウント削除機能**: 会員自身が削除可能
- **完全削除**: 30日間の猶予期間後に完全削除
- **削除範囲**: 個人を特定できる全データ
- **保持データ**: 法令で保持が義務付けられたデータのみ匿名化して保持

---

### 3.3 データバックアップ

- **頻度**: 毎日深夜3:00
- **世代管理**: 30世代保持
- **保存先**: 別リージョンのS3
- **暗号化**: 保存時暗号化（AES-256）
- **復旧テスト**: 月1回実施

---

## 4. アプリケーションセキュリティ

### 4.1 OWASP Top 10 対策

#### 4.1.1 インジェクション対策

**SQL Injection**:
- **ORM使用**: Prisma（パラメータ化クエリ）
- **入力検証**: すべての入力をバリデーション
- **エスケープ処理**: 動的SQL使用時は必須

**実装例**:
```typescript
// ✓ 安全（Prisma使用）
const user = await prisma.user.findUnique({
  where: { email: inputEmail }
});

// ✗ 危険（生SQL）
const user = await db.query(`SELECT * FROM users WHERE email = '${inputEmail}'`);
```

**NoSQL Injection（MongoDB使用時）**:
- オブジェクトの直接使用禁止
- スキーマバリデーション

**XPath Injection**: XMLは使用しない（JSON使用）

---

#### 4.1.2 認証の不備対策

- JWT検証の徹底
- セッションタイムアウト（2時間）
- ログアウト後のトークン無効化

---

#### 4.1.3 機密データの露出対策

- **エラーメッセージ**: 詳細情報を含めない
- **スタックトレース**: 本番環境では非表示
- **デバッグ情報**: 本番環境では無効化
- **APIレスポンス**: 必要最小限の情報のみ

**実装例**:
```javascript
// ✗ 危険
res.status(500).json({ error: error.stack });

// ✓ 安全
res.status(500).json({ error: 'サーバーエラーが発生しました' });
// ログには詳細を記録
logger.error(error.stack);
```

---

#### 4.1.4 XML外部エンティティ（XXE）対策

- XML使用しない（JSON使用）

---

#### 4.1.5 アクセス制御の不備対策

- **認可チェック**: すべてのエンドポイントで実施
- **RBAC実装**: ロールベースのアクセス制御
- **水平権限昇格防止**: 他ユーザーのデータへのアクセス禁止

**実装例**:
```typescript
// リソースの所有者チェック
if (post.user_id !== currentUser.id && currentUser.role !== 'admin') {
  throw new ForbiddenError();
}
```

---

#### 4.1.6 セキュリティ設定ミス対策

- **デフォルト設定の変更**: デフォルトパスワード、ポート等
- **不要なサービス無効化**
- **セキュリティヘッダー設定**: 後述

---

#### 4.1.7 XSS（クロスサイトスクリプティング）対策

**対策**:
- **入力検証**: すべての入力をバリデーション
- **出力エスケープ**: HTMLエスケープ
- **Content Security Policy（CSP）**: 設定

**実装例（React）**:
```jsx
// Reactは自動的にエスケープ
<div>{user.name}</div>

// dangerouslySetInnerHTMLは禁止（または慎重に使用）
// <div dangerouslySetInnerHTML={{ __html: userInput }} />

// サニタイズが必要な場合
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userInput);
```

**CSP設定**:
```javascript
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://trusted-cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.sakiyomi.com;
```

---

#### 4.1.8 安全でないデシリアライゼーション対策

- **信頼できないデータのデシリアライズ禁止**
- **署名検証**: JWTの署名検証

---

#### 4.1.9 既知の脆弱性を持つコンポーネント使用対策

- **依存関係の定期更新**: 月1回
- **脆弱性スキャン**: `npm audit`, `yarn audit`
- **自動化**: Dependabot, Snyk使用

```bash
# 脆弱性チェック
npm audit
npm audit fix

# 自動化（GitHub Dependabot）
```

---

#### 4.1.10 ログとモニタリングの不足対策

- **セキュリティイベントのログ記録**: 後述
- **異常検知**: アラート設定
- **定期的なログレビュー**: 週1回

---

### 4.2 CSRF（クロスサイトリクエストフォージェリ）対策

**対策**:
- **SameSite Cookie**: `sameSite: 'strict'`
- **CSRFトークン**: 状態変更API（POST/PUT/DELETE）
- **Originヘッダー検証**

**実装例**:
```javascript
// CSRFトークン生成
import { generateToken, verifyToken } from 'csrf';
const csrfToken = generateToken(req, res);

// 検証
if (!verifyToken(req, res)) {
  throw new ForbiddenError('Invalid CSRF token');
}
```

---

### 4.3 セキュリティヘッダー

**必須ヘッダー**:
```javascript
// Next.js next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY' // クリックジャッキング対策
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // MIMEタイプスニッフィング対策
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block' // XSS対策（古いブラウザ用）
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};
```

---

### 4.4 入力検証

#### 4.4.1 バリデーションライブラリ

- **フロントエンド**: Zod
- **バックエンド**: Zod（共通スキーマ）

**実装例**:
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(64),
  name: z.string().min(1).max(100)
});

// バリデーション
const result = userSchema.safeParse(input);
if (!result.success) {
  throw new ValidationError(result.error);
}
```

#### 4.4.2 ホワイトリスト方式

- **許可する文字のみ受け入れ**
- ブラックリスト方式は原則使用しない

---

## 5. インフラセキュリティ

### 5.1 ネットワークセキュリティ

- **VPC（Virtual Private Cloud）**: データベースは非公開サブネット
- **セキュリティグループ**: 必要最小限のポート開放
- **ファイアウォール**: WAF（Web Application Firewall）使用
- **DDoS対策**: CloudFlare / AWS Shield使用

---

### 5.2 サーバーセキュリティ

- **OS最新化**: 定期的なパッチ適用
- **不要なサービス無効化**
- **SSH鍵認証**: パスワード認証無効化
- **ポート制限**: 必要最小限

---

### 5.3 データベースセキュリティ

- **接続制限**: アプリケーションサーバーからのみ
- **最小権限の原則**: アプリケーション用ユーザーは必要最小限の権限
- **監査ログ**: すべてのクエリをログ記録

---

### 5.4 環境変数管理

- **機密情報**: 環境変数で管理（コードに含めない）
- **管理ツール**: AWS Secrets Manager / Vercel Environment Variables
- **ローテーション**: 定期的な更新

**禁止事項**:
```javascript
// ✗ 危険（コードに直接記述）
const API_KEY = 'sk_live_xxxxxxxxxxxx';

// ✓ 安全（環境変数）
const API_KEY = process.env.STRIPE_API_KEY;
```

---

## 6. セキュリティ監視・ログ

### 6.1 セキュリティイベントログ

**記録対象**:
- ログイン成功/失敗
- パスワード変更
- 権限変更
- データベースへの書き込み操作
- API呼び出し（IPアドレス、ユーザーエージェント）
- エラー発生

**ログ形式**:
```json
{
  "timestamp": "2025-12-02T10:00:00Z",
  "event_type": "login_failed",
  "user_id": "uuid or null",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "email": "user@example.com",
    "reason": "invalid_password"
  }
}
```

---

### 6.2 異常検知・アラート

**アラート条件**:
- ログイン失敗の急増（5分間に10回以上）
- 大量のAPIリクエスト（DDoS攻撃の可能性）
- SQLエラーの急増（インジェクション攻撃の可能性）
- 深夜の管理者操作

**通知先**: Slack, メール, PagerDuty

---

### 6.3 セキュリティ監視ツール

- **Sentry**: エラートラッキング
- **Datadog / CloudWatch**: インフラ・アプリケーション監視
- **AWS GuardDuty**: 脅威検出（AWSの場合）

---

## 7. インシデント対応

### 7.1 インシデントレベル

| レベル | 定義 | 対応時間 |
|-------|------|---------|
| Critical | データ漏洩、サービス全停止 | 即時 |
| High | 一部サービス停止、セキュリティ侵害 | 1時間以内 |
| Medium | パフォーマンス低下、部分的な障害 | 4時間以内 |
| Low | 軽微な不具合 | 1営業日以内 |

### 7.2 インシデント対応フロー

1. **検知**: 監視ツール、ユーザー報告
2. **初期対応**: 影響範囲の特定、応急処置（30分以内）
3. **調査**: 原因究明
4. **復旧**: システム復旧、データ復元
5. **報告**: ステークホルダーへの報告
6. **事後対応**: 原因分析、再発防止策
7. **通知**: 影響を受けたユーザーへの通知（必要に応じて）

### 7.3 データ漏洩時の対応

1. **即時遮断**: 侵入経路の遮断
2. **影響範囲の特定**: 漏洩データの特定
3. **法的義務の確認**: 個人情報保護委員会への報告義務確認
4. **ユーザー通知**: 影響を受けたユーザーへの通知
5. **再発防止**: セキュリティ強化

---

## 8. セキュリティテスト

### 8.1 テスト種別

- **脆弱性診断**: 年1回、外部専門業者に委託
- **ペネトレーションテスト**: リリース前、大規模アップデート前
- **セキュリティコードレビュー**: Pull Request毎
- **自動セキュリティスキャン**: CI/CD組み込み

### 8.2 自動テスト

```yaml
# GitHub Actions
- name: Security Audit
  run: npm audit

- name: Dependency Check
  uses: snyk/actions/node@master

- name: SAST (Static Application Security Testing)
  uses: github/codeql-action/analyze@v2
```

---

## 9. サードパーティセキュリティ

### 9.1 外部サービス利用時の確認事項

- **セキュリティ認証**: ISO 27001, SOC 2等
- **データ保管場所**: 日本国内または適切な地域
- **SLA**: サービスレベル保証
- **プライバシーポリシー**: GDPR準拠

### 9.2 使用するサービス

| サービス | 用途 | セキュリティ認証 |
|---------|------|----------------|
| Stripe | 決済 | PCI DSS Level 1 |
| Vercel | ホスティング | SOC 2 Type II |
| AWS | インフラ | ISO 27001, SOC 2 |
| SendGrid | メール送信 | SOC 2 Type II |

---

## 10. コンプライアンス

### 10.1 個人情報保護法

- **利用目的の明示**: プライバシーポリシーで明示
- **同意取得**: 登録時に同意チェックボックス
- **安全管理措置**: 技術的・組織的対策の実施
- **第三者提供**: 原則禁止（同意がある場合を除く）

### 10.2 特定商取引法

- **表示義務**: 運営者情報、返金ポリシー等の明示
- **誇大広告の禁止**

### 10.3 GDPR（EU一般データ保護規則）

- **削除権**: アカウント削除機能
- **データポータビリティ**: データエクスポート機能（将来実装）
- **プライバシーバイデザイン**: 設計段階からプライバシー配慮

---

## 11. 従業員セキュリティ

### 11.1 アクセス管理

- **最小権限の原則**: 必要最小限の権限のみ付与
- **定期的な権限レビュー**: 四半期ごと
- **退職時の権限削除**: 即時

### 11.2 セキュリティ教育

- **入社時研修**: セキュリティ基礎
- **定期研修**: 年2回
- **インシデント訓練**: 年1回

---

## 12. チェックリスト

### 12.1 リリース前セキュリティチェック

- [ ] すべての環境変数が設定されている
- [ ] 本番環境でデバッグモードが無効
- [ ] セキュリティヘッダーが設定されている
- [ ] HTTPS強制リダイレクトが有効
- [ ] CSPが適切に設定されている
- [ ] レート制限が有効
- [ ] ログイン試行制限が有効
- [ ] エラーメッセージに機密情報が含まれていない
- [ ] 依存関係の脆弱性スキャン完了
- [ ] ペネトレーションテスト完了
- [ ] バックアップ・復元テスト完了

---

**文書管理情報**
- バージョン: 1.0
- 作成日: 2025-12-02
- 最終更新日: 2025-12-02
- 承認状態: ドラフト
- 次回レビュー: 2026-06-02
