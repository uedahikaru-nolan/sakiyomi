import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MessageCircle, Server, Hash, User } from 'lucide-react'
import { DiscordAdminManager } from '@/components/features/admin/discord-admin-manager'
import { DiscordMessageCard } from '@/components/features/admin/discord-message-card'
import { DiscordPromptManager } from '@/components/features/admin/discord-prompt-manager'

interface DiscordMessage {
  id: number
  discord_id: string
  content: string | null
  author_id: string
  channel_id: string
  guild_id: string
  attachments: any
  embeds: any
  mentions: any
  reactions: any
  edited_at: string | null
  created_at: string
  stored_at: string
}

interface DiscordUser {
  id: number
  discord_id: string
  username: string
  avatar_url: string | null
  bot: boolean
  is_admin: boolean
}

interface Channel {
  discord_id: string
  name: string
  type: string | null
}

interface Guild {
  discord_id: string
  name: string
  icon_url: string | null
}

export default async function DiscordMessagesPage() {
  const supabase = await createClient()

  // SAKIYOMIスクールサーバーのみを表示
  const SAKIYOMI_GUILD_ID = '1258597978235731999'

  // Fetch messages with related data (SAKIYOMIスクールのみ)
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('guild_id', SAKIYOMI_GUILD_ID)
    .order('created_at', { ascending: false })
    .limit(50)

  // Fetch all related guilds, channels, and users (SAKIYOMIスクールのみ)
  const { data: guilds } = await supabase
    .from('guilds')
    .select('*')
    .eq('discord_id', SAKIYOMI_GUILD_ID)

  const { data: channels } = await supabase
    .from('channels')
    .select('*')
    .eq('guild_id', SAKIYOMI_GUILD_ID)

  const { data: discordUsers } = await supabase
    .from('discord_users')
    .select('*')

  // Get statistics (SAKIYOMIスクールのみ)
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', SAKIYOMI_GUILD_ID)

  const { count: totalGuilds } = await supabase
    .from('guilds')
    .select('*', { count: 'exact', head: true })
    .eq('discord_id', SAKIYOMI_GUILD_ID)

  const { count: totalChannels } = await supabase
    .from('channels')
    .select('*', { count: 'exact', head: true })
    .eq('guild_id', SAKIYOMI_GUILD_ID)

  const { count: totalUsers } = await supabase
    .from('discord_users')
    .select('*', { count: 'exact', head: true })

  // Get active prompt settings
  const { data: promptSettings } = await supabase
    .from('discord_prompt_settings')
    .select('*')
    .eq('is_active', true)
    .single()

  // Create lookup maps for efficient joins
  const guildMap = new Map<string, Guild>()
  guilds?.forEach(guild => guildMap.set(guild.discord_id, guild))

  const channelMap = new Map<string, Channel>()
  channels?.forEach(channel => channelMap.set(channel.discord_id, channel))

  const userMap = new Map<string, DiscordUser>()
  discordUsers?.forEach(user => userMap.set(user.discord_id, user))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Discordメッセージ管理
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Discordサーバーから収集したメッセージ一覧
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DiscordPromptManager initialSettings={promptSettings} />
            <DiscordAdminManager users={discordUsers || []} />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">総メッセージ数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalMessages || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">サーバー数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
              <Server className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalGuilds || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">チャンネル数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-md">
              <Hash className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalChannels || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-gray-800">ユーザー数</CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
              <User className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{totalUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200/50">
          <CardTitle className="text-gray-900 text-xl">最新メッセージ（最大50件）</CardTitle>
          <CardDescription className="text-base">
            Discordから収集したメッセージの一覧
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message: DiscordMessage) => {
                const guild = guildMap.get(message.guild_id)
                const channel = channelMap.get(message.channel_id)
                const author = userMap.get(message.author_id)

                return (
                  <DiscordMessageCard
                    key={message.id}
                    message={message}
                    guild={guild}
                    channel={channel}
                    author={author}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">
                メッセージデータがありません
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
