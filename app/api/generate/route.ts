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

Output in JSON format with exactly these keys:
{
  "title": "Amazon product title (max 200 characters)",
  "bullet1": "Bullet point 1",
  "bullet2": "Bullet point 2", 
  "bullet3": "Bullet point 3",
  "bullet4": "Bullet point 4",
  "bullet5": "Bullet point 5",
  "description": "Product description"
}

Requirements:
- Use persuasive copy that drives conversions
- Naturally incorporate keywords
- Focus on customer benefits
- Output ONLY valid JSON, no explanation before or after`
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

    // 构建 prompt
    const prompt = buildPrompt(body)
    
    // MiniMax API 调用 - 尝试不同的端点格式
    const endpoints = [
      'https://api.minimax.chat/v1/text/chatcompletion_pro',
      'https://api.minimax.chat/v1/text/chatcompletion_v2'
    ]
    
    let lastError = null
    let data = null
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${body.apiKey}`,
          },
          body: JSON.stringify({
            model: 'abab6.5s-chat',
            messages: [
              {
                role: 'system',
                content: 'You are an expert Amazon product listing copywriter.'
              },
              {
                role: 'user', 
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2048,
          }),
        })

        if (response.ok) {
          data = await response.json()
          break
        } else {
          lastError = await response.text()
          console.error(`Endpoint ${endpoint} failed:`, lastError)
        }
      } catch (e) {
        lastError = e
        console.error(`Endpoint ${endpoint} error:`, e)
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: `API 调用失败: ${lastError}` },
        { status: 500 }
      )
    }
    
    // 解析 JSON 响应
    let result: ListingResult
    try {
      const content = data.choices?.[0]?.message?.content || ''
      console.log('Raw AI response:', content)
      
      // 尝试提取 JSON
      let jsonStr = content.trim()
      
      // 如果有 markdown 代码块，去掉
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\w*\n?/, '').replace(/```$/, '')
      }
      
      // 尝试直接解析
      try {
        result = JSON.parse(jsonStr)
      } catch {
        // 尝试在内容中找 JSON
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      }
      
      // 确保所有字段都存在
      result = {
        title: result.title || '',
        bullet1: result.bullet1 || '',
        bullet2: result.bullet2 || '',
        bullet3: result.bullet3 || '',
        bullet4: result.bullet4 || '',
        bullet5: result.bullet5 || '',
        description: result.description || ''
      }
      
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
