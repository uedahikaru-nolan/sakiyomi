import { requireUser } from '@/lib/utils/get-user'
import { OnboardingForm } from '@/components/features/onboarding/onboarding-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function OnboardingPage() {
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">ようこそ、SAKIYOMIへ！</CardTitle>
            <CardDescription>
              ご登録ありがとうございます。サービスを開始する前に、以下の情報をご入力ください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingForm userEmail={user.email || ''} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
