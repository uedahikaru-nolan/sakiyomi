import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">お支払いが完了しました!</CardTitle>
          <CardDescription>
            プランへのご登録ありがとうございます
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            登録内容の確認メールを送信しました。
            <br />
            すぐにサービスをご利用いただけます。
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">ダッシュボードへ</Button>
            </Link>
            <Link href="/dashboard/plans" className="w-full">
              <Button variant="outline" className="w-full">
                プラン一覧に戻る
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
