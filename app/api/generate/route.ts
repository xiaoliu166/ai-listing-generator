import { NextRequest, NextResponse } from 'next/server'

interface GenerateRequest {
  apiKey: string
  productName: string
  keywords: string
  productFeatures: string
  tone: string
}

interface ListingResult {
  title: string
  bullet1: string
  bullet2: string
  bullet3: string
  bullet4: string
  bullet5: string
  description: string
}

// 生成提示词
function buildPrompt(data: GenerateRequest): string {
  const toneMap: Record<string, string> = {
    professional: 'Professional and business-like',
    casual: 'Casual and friendly',
    luxury: 'Luxury and premium',
    friendly: 'Warm and approachable',
  }

  return `You are an expert Amazon product listing copywriter. Generate a high-converting Amazon Listing based on the following information:

Product Name: ${data.productName}
Keywords: ${data.keywords}
Product Features: ${data.productFeatures || 'Not specified'}
Tone: ${toneMap[data.tone] || toneMap.professional}

Output in JSON format:
{
  "title": "Amazon product title (max 200 characters, include main keywords)",
  "bullet1": "Bullet point 1 (feature + benefit)",
  "bullet2": "Bullet point 2 (feature + benefit)",
  "bullet3": "Bullet point 3 (feature + benefit)",
  "bullet4": "Bullet point 4 (feature + benefit)",
  "bullet5": "Bullet point 5 (feature + benefit)",
  "description": "Product description (detailed, 200-500 words)"
}

Requirements:
- Use persuasive copy that drives conversions
- Naturally incorporate keywords
- Focus on customer benefits
- Follow Amazon best practices
- Output ONLY valid JSON, no explanation`
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    
    if (!body.apiKey) {
      return NextResponse.json(
        { error: 'API Key 不能为空，请在设置中输入您的 MiniMax API Key' },
        { status: 400 }
      )
    }
    
    if (!body.productName || !body.keywords) {
      return NextResponse.json(
        { error: '产品名称和关键词不能为空' },
        { status: 400 }
      )
    }

    // 用户提供了 API Key，使用用户的
    const userApiKey = body.apiKey
    
    // 调用 MiniMax API
    const prompt = buildPrompt(body)
    
    const response = await fetch(
      'https://api.minimax.chat/v1/text/chatcompletion_pro',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userApiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Amazon product listing copywriter.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = errorData?.base_resp?.status_msg || `API 请求失败: ${response.status}`
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // 解析 JSON 响应
    let result: ListingResult
    try {
      const content = data.choices?.[0]?.message?.content || ''
      // 尝试提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      result = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Parse error:', parseError)
      return NextResponse.json(
        { error: 'AI 响应格式解析失败，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Error generating listing:', error)
    return NextResponse.json(
      { error: '生成失败，请检查 API Key 是否正确' },
      { status: 500 }
    )
  }
}
