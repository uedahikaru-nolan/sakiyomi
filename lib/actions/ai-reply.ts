'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getActiveKnowledgeBase } from './knowledge-base'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

interface Message {
  id: string
  message: string
  sender_id: string
  created_at: string
  sender?: {
    name: string
  }
}

/**
 * チャット履歴を基にAIで返信文を生成
 */
export async function generateAIReply(messages: Message[], currentUserId: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: 'APIキーが設定されていません' }
    }

    // メッセージ履歴を整形（新しい順に並んでいる場合は逆順にする）
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // 最新10件のメッセージを使用
    const recentMessages = sortedMessages.slice(-10)

    // チャット履歴を文字列に変換
    const chatHistory = recentMessages
      .map((msg) => {
        const isAdmin = msg.sender_id === currentUserId
        const senderName = isAdmin ? '運営（あなた）' : (msg.sender?.name || 'ユーザー')
        return `${senderName}: ${msg.message}`
      })
      .join('\n')

    // 最後のメッセージが相手からのものか確認
    const lastMessage = recentMessages[recentMessages.length - 1]
    if (!lastMessage || lastMessage.sender_id === currentUserId) {
      return { error: '返信する相手のメッセージがありません' }
    }

    // ナレッジベースを取得
    const { knowledgeBase } = await getActiveKnowledgeBase()

    // ナレッジベースを文字列に変換
    const knowledgeContext = knowledgeBase && knowledgeBase.length > 0
      ? knowledgeBase
          .map((kb) => `【${kb.title}】\n${kb.content}`)
          .join('\n\n')
      : ''

    // プロンプトを作成
    const prompt = `あなたはカスタマーサポート担当者です。以下のチャット履歴を読んで、最後のユーザーメッセージに対する適切な返信を日本語で生成してください。

${knowledgeContext ? `ナレッジベース（参照情報）:
${knowledgeContext}

` : ''}チャット履歴:
${chatHistory}

要件:
- 丁寧で親切な対応を心がける
- 簡潔で分かりやすい文章にする
- 必要に応じて質問や確認を含める
- ナレッジベースに関連する情報がある場合は、それを参考にして回答する
- 返信文のみを出力し、余計な説明は不要

返信:`

    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text || text.trim().length === 0) {
      return { error: '返信の生成に失敗しました' }
    }

    return { reply: text.trim() }
  } catch (error) {
    console.error('AI reply generation error:', error)
    return { error: 'AI返信の生成中にエラーが発生しました' }
  }
}

/**
 * グループチャット用のAI返信生成
 */
export async function generateGroupAIReply(messages: Message[], currentUserId: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { error: 'APIキーが設定されていません' }
    }

    // メッセージ履歴を整形
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // 最新15件のメッセージを使用（グループチャットは複数人いるため多めに）
    const recentMessages = sortedMessages.slice(-15)

    // チャット履歴を文字列に変換
    const chatHistory = recentMessages
      .map((msg) => {
        const isAdmin = msg.sender_id === currentUserId
        const senderName = isAdmin ? '運営（あなた）' : (msg.sender?.name || 'メンバー')
        return `${senderName}: ${msg.message}`
      })
      .join('\n')

    // ナレッジベースを取得
    const { knowledgeBase } = await getActiveKnowledgeBase()

    // ナレッジベースを文字列に変換
    const knowledgeContext = knowledgeBase && knowledgeBase.length > 0
      ? knowledgeBase
          .map((kb) => `【${kb.title}】\n${kb.content}`)
          .join('\n\n')
      : ''

    // プロンプトを作成
    const prompt = `あなたはグループチャットの運営担当者です。以下のグループチャット履歴を読んで、適切な返信を日本語で生成してください。

${knowledgeContext ? `ナレッジベース（参照情報）:
${knowledgeContext}

` : ''}チャット履歴:
${chatHistory}

要件:
- グループ全体に向けた丁寧な対応を心がける
- 簡潔で分かりやすい文章にする
- 必要に応じて全員への呼びかけや確認を含める
- ナレッジベースに関連する情報がある場合は、それを参考にして回答する
- 返信文のみを出力し、余計な説明は不要

返信:`

    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text || text.trim().length === 0) {
      return { error: '返信の生成に失敗しました' }
    }

    return { reply: text.trim() }
  } catch (error) {
    console.error('AI reply generation error:', error)
    return { error: 'AI返信の生成中にエラーが発生しました' }
  }
}
