import { requireUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/features/profile/profile-form'
import { ProfileDisplay } from '@/components/features/profile/profile-display'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function ProfilePage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      bio,
      website_url,
      twitter_handle,
      location,
      occupation,
      respondent_name,
      full_name,
      discord_name,
      main_account_url,
      second_account_url,
      teachable_email,
      join_reason
    `)
    .eq('user_id', user.id)
    .single()

  // If userData doesn't exist, create default data from auth user
  const displayUser = userData || {
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    nickname: null,
    email: user.email || '',
    avatar_url: null,
  }

  // Merge user and profile data for display
  const fullProfile = profile ? {
    ...displayUser,
    ...profile,
  } : null

  return (
    <div className="space-y-8">
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
          プロフィール
        </h1>
        <p className="text-gray-600">
          あなたの情報を管理します
        </p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-md p-1">
          <TabsTrigger
            value="view"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
          >
            プロフィール表示
          </TabsTrigger>
          <TabsTrigger
            value="edit"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg"
          >
            編集
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6 animate-in fade-in-50 duration-300">
          <ProfileDisplay user={displayUser} profile={fullProfile} />
        </TabsContent>

        <TabsContent value="edit" className="mt-6 animate-in fade-in-50 duration-300">
          <ProfileForm user={displayUser} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
