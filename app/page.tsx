import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white p-24">
      <div className="max-w-5xl w-full text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-4">
          SAKIYOMIコミュニティ
        </h1>
        <p className="text-2xl text-gray-700 mb-8">
          Instagram成長支援プラットフォーム
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/auth/login">
            <Button size="lg">ログイン</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">新規登録</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-orange-200 hover:shadow-lg transition-shadow border-t-4 border-orange-500">
            <h3 className="text-xl font-semibold mb-2 text-orange-700">学習管理</h3>
            <p className="text-gray-600">
              動画コンテンツで効率的に学習
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-orange-200 hover:shadow-lg transition-shadow border-t-4 border-orange-500">
            <h3 className="text-xl font-semibold mb-2 text-orange-700">Instagram連携</h3>
            <p className="text-gray-600">
              成長を可視化して分析
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-orange-200 hover:shadow-lg transition-shadow border-t-4 border-orange-500">
            <h3 className="text-xl font-semibold mb-2 text-orange-700">コミュニティ</h3>
            <p className="text-gray-600">
              会員同士で交流・情報共有
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
