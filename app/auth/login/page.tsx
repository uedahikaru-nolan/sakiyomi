import Link from 'next/link'
import { LoginForm } from '@/components/features/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <div className="w-full max-w-md space-y-4">
        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          アカウントをお持ちでない方は{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
