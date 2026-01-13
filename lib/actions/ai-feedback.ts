'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function generateAIFeedback(feedbackId: string) {
  console.log('Starting AI feedback generation for ID:', feedbackId)
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('User authentication failed:', userError)
    return { error: 'ユーザーが認証されていません' }
  }

  console.log('User authenticated:', user.id)

  // Check if user is admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
    console.error('User is not admin:', userData)
    return { error: '管理者権限がありません' }
  }

  console.log('User role verified:', userData.role)

  // Get feedback data
  const { data: feedback, error: feedbackError } = await supabase
    .from('post_feedback')
    .select('*')
    .eq('id', feedbackId)
    .single()

  if (feedbackError || !feedback) {
    console.error('Failed to get feedback data:', feedbackError)
    return { error: 'フィードバックデータの取得に失敗しました' }
  }

  console.log('Feedback data retrieved successfully')

  // Construct prompt for AI
  const prompt = `
あなたはInstagramマーケティングの専門講師です。以下の投稿フィードバック依頼を分析し、構造化されたフィードバックを提供してください。

【投稿の狙い】
ターゲット: ${feedback.target_audience || '未記入'}
ターゲットが得られること: ${feedback.target_benefit || '未記入'}
参考にした投稿: ${feedback.reference_post_url || '未記入'}

【工夫した点】
冒頭3秒: ${feedback.first_3_seconds || '未記入'}
構成・内容: ${feedback.structure_content || '未記入'}
撮影・編集: ${feedback.shooting_editing || '未記入'}

【インサイト】
動画の尺: ${feedback.video_duration_seconds ? `${feedback.video_duration_seconds}秒` : '未記入'}
閲覧数: ${feedback.view_count?.toLocaleString() || '未記入'}
リーチ数: ${feedback.reach_count?.toLocaleString() || '未記入'}
平均再生時間: ${feedback.average_watch_time_seconds ? `${feedback.average_watch_time_seconds}秒` : '未記入'}
3秒以上の再生率: ${feedback.three_second_retention_rate ? `${feedback.three_second_retention_rate}%` : '未記入'}
保存数: ${feedback.save_count?.toLocaleString() || '未記入'}
コメント数: ${feedback.comment_count?.toLocaleString() || '未記入'}
いいね数: ${feedback.like_count?.toLocaleString() || '未記入'}
シェア数: ${feedback.share_count?.toLocaleString() || '未記入'}
フォロー数: ${feedback.follow_count?.toLocaleString() || '未記入'}

【会員の仮説】
よかった点: ${feedback.good_points || '未記入'}
悪かった点: ${feedback.bad_points || '未記入'}
次回検証したいこと: ${feedback.next_verification || '未記入'}

以下の形式で、具体的で実践的なフィードバックを生成してください：

【Good】
・この投稿で効果的だった点を3〜5つ挙げてください
・会員の工夫が成果に繋がっている点を具体的に褒めてください

【More（狙いと表現のズレなど）】
・ターゲットと実際のコンテンツのズレがあれば指摘してください
・改善できる点を具体的に提案してください
・数値から見える課題を分析してください

【次の投稿で意識すべきポイント】
・具体的なアクションプランを3つ提示してください
・次回検証すべき仮説を提案してください

【投稿後：数値から見えた良い点 / 改善点】
・インサイトの数値を分析し、良かった指標を褒めてください
・改善が必要な指標とその対策を提案してください
・業界平均やベンチマークと比較した評価をしてください
`

  try {
    // Call Gemini API directly
    console.log('Initializing Gemini AI...')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

    console.log('Generating AI feedback...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedFeedback = response.text()

    console.log('AI feedback generated, length:', generatedFeedback.length)

    // Parse the AI response to extract the 4 sections
    const sections = {
      good: '',
      more: '',
      nextPoints: '',
      insights: '',
    }

    // Extract sections using regex patterns
    const goodMatch = generatedFeedback.match(/【Good】([\s\S]*?)(?=【|$)/i)
    const moreMatch = generatedFeedback.match(/【More[^】]*】([\s\S]*?)(?=【|$)/i)
    const nextMatch = generatedFeedback.match(/【次の投稿で意識すべきポイント】([\s\S]*?)(?=【|$)/i)
    const insightsMatch = generatedFeedback.match(/【投稿後[^】]*】([\s\S]*?)(?=【|$)/i)

    if (goodMatch) sections.good = goodMatch[1].trim()
    if (moreMatch) sections.more = moreMatch[1].trim()
    if (nextMatch) sections.nextPoints = nextMatch[1].trim()
    if (insightsMatch) sections.insights = insightsMatch[1].trim()

    console.log('Sections extracted:', {
      good: sections.good.length,
      more: sections.more.length,
      nextPoints: sections.nextPoints.length,
      insights: sections.insights.length,
    })

    return { data: sections }
  } catch (error) {
    console.error('Error generating AI feedback:', error)
    return { error: 'AIフィードバックの生成に失敗しました' }
  }
}
