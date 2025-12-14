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
      <div>
        <h1 className="text-3xl font-bold">プロフィール</h1>
        <p className="text-muted-foreground">
          あなたの情報を管理します
        </p>
      </div>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="view">プロフィール表示</TabsTrigger>
          <TabsTrigger value="edit">編集</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          <ProfileDisplay user={displayUser} profile={fullProfile} />
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <ProfileForm user={displayUser} profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
