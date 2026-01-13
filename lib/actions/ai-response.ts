'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateDiscordResponse(messageContent: string, channelName: string, authorName: string) {
  console.log('[generateDiscordResponse] Starting...', { messageContent, channelName, authorName })

  try {
    const supabase = await createClient()

    // プロンプト設定を取得
    const { data: promptSettings } = await supabase
      .from('discord_prompt_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    console.log('[generateDiscordResponse] Prompt settings:', promptSettings)

    // ナレッジベースを取得
    const { data: knowledgeBase } = await supabase
      .from('knowledge_base')
      .select('title, content, category, tags')
      .eq('is_active', true)

    console.log('[generateDiscordResponse] Knowledge base:', knowledgeBase?.length, 'items')

    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    // ナレッジベースを文字列に整形
    let knowledgeBaseText = ''
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeBaseText = '\n\n【ナレッジベース（参考情報）】:\n'
      knowledgeBase.forEach((kb) => {
        knowledgeBaseText += `- ${kb.title}: ${kb.content}\n`
        if (kb.category) knowledgeBaseText += `  カテゴリ: ${kb.category}\n`
        if (kb.tags && kb.tags.length > 0) knowledgeBaseText += `  タグ: ${kb.tags.join(', ')}\n`
      })
    }

    // プロンプトを構築
    const systemPrompt = promptSettings?.system_prompt ||
      'あなたはSAKIYOMIスクールのDiscordサーバーの管理者です。Instagramマーケティングやソーシャルメディア運用の専門知識を持っています。'

    const toneDescription = promptSettings?.tone_description ||
      '親切で丁寧、かつフレンドリーな口調で対応します。絵文字を適度に使用して親しみやすい雰囲気を出します。'

    const additionalKnowledge = promptSettings?.additional_knowledge ||
      'SAKIYOMIスクールは、Instagram運用を学べるオンラインスクールです。フォロワー獲得、エンゲージメント向上、収益化などを支援しています。'

    const prompt = `${systemPrompt}

【話し方・トーン】:
${toneDescription}

【追加の知識・コンテキスト】:
${additionalKnowledge}
${knowledgeBaseText}

以下のメッセージに対して、上記の設定に従って返信案を日本語で作成してください。

【チャンネル】: #${channelName}
【送信者】: ${authorName}
【メッセージ内容】:
${messageContent}

【返信案作成のガイドライン】:
- 上記の話し方・トーンに従ってください
- ナレッジベースの情報を活用してください（該当する情報がある場合）
- 具体的で役立つ情報を提供してください
- 必要に応じて追加の質問をしてください
- 返信文のみを出力してください（説明や前置きは不要）

返信案:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log('[generateDiscordResponse] Success:', text.substring(0, 100))

    return {
      success: true,
      response: text.trim()
    }
  } catch (error) {
    console.error('[generateDiscordResponse] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '返信案の生成に失敗しました'
    }
  }
}
