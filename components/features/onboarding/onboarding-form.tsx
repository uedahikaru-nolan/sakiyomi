'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface OnboardingFormProps {
  userEmail: string
}

export function OnboardingForm({ userEmail }: OnboardingFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await completeOnboarding(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="respondent_name">
          回答者名 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="respondent_name"
          name="respondent_name"
          type="text"
          placeholder="山田太郎"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="full_name">
          お名前（苗字・名前の間にスペースなしで入力） <span className="text-destructive">*</span>
        </Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="山田太郎"
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          ※スペースなしで入力してください（例: 山田太郎）
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discord_name">
          Discord名 <span className="text-destructive">*</span>
        </Label>
        <Input
          id="discord_name"
          name="discord_name"
          type="text"
          placeholder="yamada_taro#1234"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="main_account_url">
          運用しているアカウントURL（メインアカウント） <span className="text-destructive">*</span>
        </Label>
        <Input
          id="main_account_url"
          name="main_account_url"
          type="url"
          placeholder="https://instagram.com/your_account"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="second_account_url">
          運用しているアカウントURL（2アカウント目）
        </Label>
        <Input
          id="second_account_url"
          name="second_account_url"
          type="url"
          placeholder="https://instagram.com/your_second_account"
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          ※2つ目のアカウントがある場合のみ入力してください
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teachable_email">
          ティーチャブルに登録されたメールアドレス <span className="text-destructive">*</span>
        </Label>
        <Input
          id="teachable_email"
          name="teachable_email"
          type="email"
          placeholder="your@email.com"
          defaultValue={userEmail}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="join_reason">
          SAKIYOMIに入会した理由 <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="join_reason"
          name="join_reason"
          placeholder="入会した理由をご記入ください"
          rows={5}
          required
          disabled={loading}
          className="resize-none"
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading} size="lg">
        {loading ? '登録中...' : '登録を完了する'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        ※すべての必須項目（*）を入力してください
      </p>
    </form>
  )
}
