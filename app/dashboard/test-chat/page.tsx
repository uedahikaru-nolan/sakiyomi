import { requireUser } from '@/lib/utils/get-user'
import { createClient } from '@/lib/supabase/server'
import { createOrGetChatRoom } from '@/lib/actions/chat'

export default async function TestChatPage() {
  const user = await requireUser()
  const supabase = await createClient()

  // チャットルームを取得または作成
  const roomResult = await createOrGetChatRoom()

  // ユーザー情報を取得
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // チャットルーム情報を取得
  let chatRoomData = null
  if (roomResult.chatRoom) {
    const { data } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomResult.chatRoom.id)
      .single()
    chatRoomData = data
  }

  // メッセージを取得
  let messagesData = null
  if (roomResult.chatRoom) {
    const { data } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users!sender_id(id, name, role)
      `)
      .eq('chat_room_id', roomResult.chatRoom.id)
      .order('created_at', { ascending: true })
    messagesData = data
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">チャット機能デバッグ</h1>

      {/* ユーザー情報 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">ユーザー情報</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(userData, null, 2)}
        </pre>
      </div>

      {/* チャットルーム情報 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">チャットルーム</h2>
        {roomResult.error ? (
          <div className="text-red-600">エラー: {roomResult.error}</div>
        ) : (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(chatRoomData, null, 2)}
          </pre>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">メッセージ ({messagesData?.length || 0}件)</h2>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
          {JSON.stringify(messagesData, null, 2)}
        </pre>
      </div>

      {/* RLSポリシーテスト */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">権限テスト</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold">ユーザーID:</span> {user.id}
          </div>
          <div>
            <span className="font-semibold">ロール:</span> {userData?.role}
          </div>
          <div>
            <span className="font-semibold">チャットルームのuser_id:</span> {chatRoomData?.user_id}
          </div>
          <div>
            <span className="font-semibold">一致:</span>{' '}
            {user.id === chatRoomData?.user_id ? '✅ はい' : '❌ いいえ'}
          </div>
        </div>
      </div>

      {/* 手動テスト用フォーム */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">手動メッセージ送信テスト</h2>
        <form action={async (formData: FormData) => {
          'use server'
          const { sendMessage } = await import('@/lib/actions/chat')
          const message = formData.get('message') as string
          if (roomResult.chatRoom) {
            const result = await sendMessage(roomResult.chatRoom.id, message)
            console.log('Manual send result:', result)
          }
        }} className="space-y-2">
          <input
            type="text"
            name="message"
            placeholder="テストメッセージ"
            className="w-full border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            送信
          </button>
        </form>
      </div>
    </div>
  )
}
