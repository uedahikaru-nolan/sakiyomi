'use server'

import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function getVideoAnalysis(feedbackId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'ユーザーが認証されていません' }
  }

  // Get feedback data with AI analysis
  const { data: feedback, error: feedbackError } = await supabase
    .from('post_feedback')
    .select('ai_video_analysis, ai_video_analyzed_at')
    .eq('id', feedbackId)
    .single()

  if (feedbackError || !feedback) {
    return { error: 'フィードバックデータの取得に失敗しました' }
  }

  if (!feedback.ai_video_analysis) {
    return { data: null }
  }

  return {
    data: {
      analysis: feedback.ai_video_analysis,
      analyzedAt: feedback.ai_video_analyzed_at
    }
  }
}

export async function analyzeVideoTranscription(feedbackId: string) {
  console.log('Starting video transcription and analysis for ID:', feedbackId)
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

  if (!feedback.pre_post_video_url) {
    return { error: '動画URLが登録されていません' }
  }

  console.log('Feedback data retrieved, video URL:', feedback.pre_post_video_url)

  try {
    // Initialize Gemini AI
    console.log('Initializing Gemini AI for video analysis...')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
    // Using gemini-3-pro-preview for advanced video analysis with multimodal capabilities
    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

    // Fetch video file
    console.log('Fetching video file...')
    const videoResponse = await fetch(feedback.pre_post_video_url)
    if (!videoResponse.ok) {
      throw new Error('動画ファイルの取得に失敗しました')
    }

    const videoBlob = await videoResponse.blob()
    const videoBuffer = await videoBlob.arrayBuffer()
    const videoBase64 = Buffer.from(videoBuffer).toString('base64')

    // Determine MIME type
    const mimeType = videoBlob.type || 'video/mp4'
    console.log('Video MIME type:', mimeType)

    // Prepare prompt for video analysis
    const prompt = `
あなたはInstagramマーケティングの専門講師です。この動画を視聴して、以下の観点から詳細な分析を行ってください。

【分析する観点】
1. 動画の内容を文字起こしして、話している内容を正確に記録してください
2. 冒頭3秒でどのように視聴者の注意を引いているか
3. 動画の構成と流れ（導入、展開、結論）
4. 映像の編集技術（カット、テロップ、エフェクトなど）
5. ターゲット視聴者層への訴求力
6. 改善できる点

【添削依頼情報】
ターゲット: ${feedback.target_audience || '未記入'}
ターゲットが得られること: ${feedback.target_benefit || '未記入'}
参考にした投稿: ${feedback.reference_post_url || '未記入'}

【会員が工夫した点】
冒頭3秒: ${feedback.first_3_seconds || '未記入'}
構成・内容: ${feedback.structure_content || '未記入'}
撮影・編集: ${feedback.shooting_editing || '未記入'}

以下の形式で分析結果を出力してください：

## 📝 動画の文字起こし
（動画内で話されている内容を時系列で詳しく記録してください）

## 🎬 動画分析

### 冒頭3秒の評価
（視聴者の注意を引く工夫、改善点を具体的に）

### 構成と流れ
（動画全体の構成、メッセージの伝わりやすさを評価）

### 編集技術
（カット、テロップ、BGM、エフェクトなどの評価）

### ターゲットへの訴求力
（設定したターゲットに対する訴求力を評価）

### 改善提案
（具体的な改善案を3〜5つ提示）

## ✨ 総合評価
（動画全体の評価と、次回作成時に意識すべき最重要ポイント）
`

    console.log('Analyzing video with AI...')
    const result = await model.generateContent([
      {
        inlineData: {
          data: videoBase64,
          mimeType: mimeType,
        },
      },
      prompt,
    ])

    const response = await result.response
    const analysisText = response.text()

    console.log('Video analysis completed, length:', analysisText.length)

    // Parse the analysis to extract sections
    const sections = {
      transcription: '',
      openingAnalysis: '',
      structureAnalysis: '',
      editingAnalysis: '',
      targetAppealAnalysis: '',
      improvements: '',
      overallEvaluation: '',
    }

    // Extract sections using regex patterns
    const transcriptionMatch = analysisText.match(/##\s*📝\s*動画の文字起こし([\s\S]*?)(?=##|$)/i)
    const openingMatch = analysisText.match(/###\s*冒頭3秒の評価([\s\S]*?)(?=###|##|$)/i)
    const structureMatch = analysisText.match(/###\s*構成と流れ([\s\S]*?)(?=###|##|$)/i)
    const editingMatch = analysisText.match(/###\s*編集技術([\s\S]*?)(?=###|##|$)/i)
    const targetMatch = analysisText.match(/###\s*ターゲットへの訴求力([\s\S]*?)(?=###|##|$)/i)
    const improvementsMatch = analysisText.match(/###\s*改善提案([\s\S]*?)(?=###|##|$)/i)
    const overallMatch = analysisText.match(/##\s*✨\s*総合評価([\s\S]*?)$/i)

    if (transcriptionMatch) sections.transcription = transcriptionMatch[1].trim()
    if (openingMatch) sections.openingAnalysis = openingMatch[1].trim()
    if (structureMatch) sections.structureAnalysis = structureMatch[1].trim()
    if (editingMatch) sections.editingAnalysis = editingMatch[1].trim()
    if (targetMatch) sections.targetAppealAnalysis = targetMatch[1].trim()
    if (improvementsMatch) sections.improvements = improvementsMatch[1].trim()
    if (overallMatch) sections.overallEvaluation = overallMatch[1].trim()

    console.log('Sections extracted:', {
      transcription: sections.transcription.length,
      openingAnalysis: sections.openingAnalysis.length,
      structureAnalysis: sections.structureAnalysis.length,
      editingAnalysis: sections.editingAnalysis.length,
      targetAppealAnalysis: sections.targetAppealAnalysis.length,
      improvements: sections.improvements.length,
      overallEvaluation: sections.overallEvaluation.length,
    })

    // Save analysis result to database
    console.log('Saving analysis result to database...')
    const analysisData = {
      ...sections,
      fullAnalysis: analysisText,
      analyzedAt: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('post_feedback')
      .update({
        ai_video_analysis: analysisData,
        ai_video_analyzed_at: new Date().toISOString()
      })
      .eq('id', feedbackId)

    if (updateError) {
      console.error('Failed to save analysis to database:', updateError)
      // Continue even if save fails - still return the analysis
    } else {
      console.log('Analysis saved to database successfully')
    }

    return {
      data: analysisData
    }
  } catch (error) {
    console.error('Error analyzing video:', error)
    return { error: '動画分析に失敗しました: ' + (error instanceof Error ? error.message : String(error)) }
  }
}
