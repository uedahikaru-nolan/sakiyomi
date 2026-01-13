import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'プロンプトが指定されていません' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-preview' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const feedback = response.text()

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    return NextResponse.json(
      { error: 'AIフィードバックの生成に失敗しました' },
      { status: 500 }
    )
  }
}
