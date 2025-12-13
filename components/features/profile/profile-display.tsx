import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserProfile {
  // Basic user info
  name: string
  nickname: string | null
  email: string

  // Profile info from onboarding
  respondent_name: string | null
  full_name: string | null
  discord_name: string | null
  main_account_url: string | null
  second_account_url: string | null
  teachable_email: string | null
  join_reason: string | null

  // Optional profile info
  bio: string | null
  website_url: string | null
  twitter_handle: string | null
  location: string | null
  occupation: string | null
}

interface ProfileDisplayProps {
  user: {
    name: string
    nickname: string | null
    email: string
  }
  profile: UserProfile | null
}

export function ProfileDisplay({ user, profile }: ProfileDisplayProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            新規会員登録時に入力された情報です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">お名前</div>
              <div className="text-base">{user.name}</div>
            </div>

            {user.nickname && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">ニックネーム</div>
                <div className="text-base">{user.nickname}</div>
              </div>
            )}

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">メールアドレス</div>
              <div className="text-base">{user.email}</div>
            </div>

            {profile?.discord_name && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Discord名</div>
                <div className="text-base">{profile.discord_name}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {profile && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>オンボーディング情報</CardTitle>
              <CardDescription>
                サービス開始時に入力された詳細情報です
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {profile.respondent_name && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">回答者名</div>
                    <div className="text-base">{profile.respondent_name}</div>
                  </div>
                )}

                {profile.full_name && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">フルネーム</div>
                    <div className="text-base">{profile.full_name}</div>
                  </div>
                )}

                {profile.teachable_email && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Teachableメール</div>
                    <div className="text-base">{profile.teachable_email}</div>
                  </div>
                )}
              </div>

              {profile.main_account_url && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">メインアカウントURL</div>
                  <a
                    href={profile.main_account_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline"
                  >
                    {profile.main_account_url}
                  </a>
                </div>
              )}

              {profile.second_account_url && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">2アカウント目URL</div>
                  <a
                    href={profile.second_account_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:underline"
                  >
                    {profile.second_account_url}
                  </a>
                </div>
              )}

              {profile.join_reason && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">入会理由</div>
                  <div className="text-base whitespace-pre-wrap">{profile.join_reason}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {(profile.bio || profile.website_url || profile.twitter_handle || profile.location || profile.occupation) && (
            <Card>
              <CardHeader>
                <CardTitle>追加プロフィール</CardTitle>
                <CardDescription>
                  プロフィール編集で入力された追加情報です
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">自己紹介</div>
                    <div className="text-base whitespace-pre-wrap">{profile.bio}</div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {profile.location && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">所在地</div>
                      <div className="text-base">{profile.location}</div>
                    </div>
                  )}

                  {profile.occupation && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">職業</div>
                      <div className="text-base">{profile.occupation}</div>
                    </div>
                  )}

                  {profile.website_url && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">ウェブサイト</div>
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:underline"
                      >
                        {profile.website_url}
                      </a>
                    </div>
                  )}

                  {profile.twitter_handle && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">X (Twitter)</div>
                      <div className="text-base">{profile.twitter_handle}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
