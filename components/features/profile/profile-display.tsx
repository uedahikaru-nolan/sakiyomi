import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Calendar, Shield, Globe, Twitter, MapPin, Briefcase, MessageCircle, ExternalLink } from 'lucide-react'
import Image from 'next/image'

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
    id: string
    name: string
    nickname: string | null
    email: string
    role: string
    avatar_url: string | null
    created_at: string
    updated_at: string
  }
  profile: UserProfile | null
}

export function ProfileDisplay({ user, profile }: ProfileDisplayProps) {
  const getRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'スーパー管理者'
      case 'admin':
        return '管理者'
      case 'member':
        return 'メンバー'
      default:
        return role
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* アバターヘッダー */}
      {user.avatar_url && (
        <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-gray-200/50 shadow-lg overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <Image
                    src={user.avatar_url}
                    alt="アバター"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h2>
                {user.nickname && (
                  <p className="text-lg text-gray-600">@{user.nickname}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* アカウント情報 */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">アカウント情報</CardTitle>
          </div>
          <CardDescription>
            あなたのシステム上のアカウント情報です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <User className="h-4 w-4" />
                ユーザーID
              </div>
              <div className="text-base font-mono text-xs text-gray-900 break-all">{user.id}</div>
            </div>

            <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <Shield className="h-4 w-4" />
                役割
              </div>
              <div className="text-base">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${
                  user.role === 'super_admin' || user.role === 'admin'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                }`}>
                  {getRoleName(user.role)}
                </span>
              </div>
            </div>

            <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                登録日時
              </div>
              <div className="text-base text-gray-900">{formatDate(user.created_at)}</div>
            </div>

            <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                最終更新日時
              </div>
              <div className="text-base text-gray-900">{formatDate(user.updated_at)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基本情報 */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">基本情報</CardTitle>
          </div>
          <CardDescription>
            新規会員登録時に入力された情報です
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <User className="h-4 w-4" />
                お名前
              </div>
              <div className="text-base text-gray-900 font-medium">{user.name}</div>
            </div>

            {user.nickname && (
              <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <User className="h-4 w-4" />
                  ニックネーム
                </div>
                <div className="text-base text-gray-900 font-medium">@{user.nickname}</div>
              </div>
            )}

            <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <Mail className="h-4 w-4" />
                メールアドレス
              </div>
              <div className="text-base text-gray-900">{user.email}</div>
            </div>

            {profile?.discord_name && (
              <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  <MessageCircle className="h-4 w-4" />
                  Discord名
                </div>
                <div className="text-base text-gray-900">{profile.discord_name}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {profile && (
        <>
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200/50">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-900">オンボーディング情報</CardTitle>
              </div>
              <CardDescription>
                サービス開始時に入力された詳細情報です
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {profile.respondent_name && (
                  <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <User className="h-4 w-4" />
                      回答者名
                    </div>
                    <div className="text-base text-gray-900">{profile.respondent_name}</div>
                  </div>
                )}

                {profile.full_name && (
                  <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <User className="h-4 w-4" />
                      フルネーム
                    </div>
                    <div className="text-base text-gray-900">{profile.full_name}</div>
                  </div>
                )}

                {profile.teachable_email && (
                  <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <Mail className="h-4 w-4" />
                      Teachableメール
                    </div>
                    <div className="text-base text-gray-900">{profile.teachable_email}</div>
                  </div>
                )}
              </div>

              {profile.main_account_url && (
                <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    メインアカウントURL
                  </div>
                  <a
                    href={profile.main_account_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    {profile.main_account_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {profile.second_account_url && (
                <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    2アカウント目URL
                  </div>
                  <a
                    href={profile.second_account_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    {profile.second_account_url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {profile.join_reason && (
                <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-200">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MessageCircle className="h-4 w-4" />
                    入会理由
                  </div>
                  <div className="text-base text-gray-900 whitespace-pre-wrap">{profile.join_reason}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {(profile.bio || profile.website_url || profile.twitter_handle || profile.location || profile.occupation) && (
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200/50">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-indigo-900">追加プロフィール</CardTitle>
                </div>
                <CardDescription>
                  プロフィール編集で入力された追加情報です
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {profile.bio && (
                  <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                      <MessageCircle className="h-4 w-4" />
                      自己紹介
                    </div>
                    <div className="text-base text-gray-900 whitespace-pre-wrap">{profile.bio}</div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {profile.location && (
                    <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <MapPin className="h-4 w-4" />
                        所在地
                      </div>
                      <div className="text-base text-gray-900">{profile.location}</div>
                    </div>
                  )}

                  {profile.occupation && (
                    <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Briefcase className="h-4 w-4" />
                        職業
                      </div>
                      <div className="text-base text-gray-900">{profile.occupation}</div>
                    </div>
                  )}

                  {profile.website_url && (
                    <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Globe className="h-4 w-4" />
                        ウェブサイト
                      </div>
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
                      >
                        {profile.website_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {profile.twitter_handle && (
                    <div className="group p-4 rounded-xl border border-gray-200/50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                        <Twitter className="h-4 w-4" />
                        X (Twitter)
                      </div>
                      <div className="text-base text-gray-900">{profile.twitter_handle}</div>
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
