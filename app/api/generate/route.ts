import { NextRequest, NextResponse } from 'next/server'

// MiniMax API 配置
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || ''
const MINIMAX_GROUP_ID = process.env.MINIMAX_GROUP_ID || ''

interface GenerateRequest {
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
    
    if (!body.productName || !body.keywords) {
      return NextResponse.json(
        { error: 'Product name and keywords are required' },
        { status: 400 }
      )
    }

    // 如果没有配置 MiniMax，返回模拟数据用于演示
    if (!MINIMAX_API_KEY || !MINIMAX_GROUP_ID) {
      console.warn('MiniMax API not configured, returning demo data')
      
      const demoResult: ListingResult = {
        title: `${body.productName} - ${body.keywords.split(',')[0].trim()} with Premium Quality`,
        bullet1: 'High-quality materials ensure durability and long-lasting performance',
        bullet2: 'Ergonomic design provides comfort for extended use',
        bullet3: 'Advanced technology delivers exceptional results',
        bullet4: 'Easy to use with clear instructions included',
        bullet5: '24/7 customer support and warranty included',
        description: `Introducing our premium ${body.productName}, designed to meet your highest expectations. 

Featuring cutting-edge technology and premium materials, this product delivers outstanding performance and reliability. Perfect for everyday use, it's been crafted with attention to detail and user experience in mind.

Key Benefits:
• Superior quality that stands the test of time
• User-friendly design for effortless operation
• Versatile functionality for multiple use cases
• Excellent value for money

Order now and experience the difference!`,
      }
      
      return NextResponse.json({ result: demoResult })
    }

    // 调用 MiniMax API
    const prompt = buildPrompt(body)
    
    const response = await fetch(
      `https://api.minimax.chat/v1/text/chatcompletion_pro?GroupId=${MINIMAX_GROUP_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
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
      throw new Error(`MiniMax API error: ${response.status}`)
    }

    const data = await response.json()
    
    // 解析 JSON 响应
    let result: ListingResult
    try {
      const content = data.choices?.[0]?.message?.content || ''
      result = JSON.parse(content)
    } catch {
      throw new Error('Failed to parse AI response')
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Error generating listing:', error)
    return NextResponse.json(
      { error: 'Failed to generate listing' },
      { status: 500 }
    )
  }
}
