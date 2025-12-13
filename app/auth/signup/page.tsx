import Link from 'next/link'
import { SignupForm } from '@/components/features/auth/signup-form'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="w-full max-w-md space-y-4">
        <SignupForm />

        <p className="text-center text-sm text-muted-foreground">
          既にアカウントをお持ちの方は{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
