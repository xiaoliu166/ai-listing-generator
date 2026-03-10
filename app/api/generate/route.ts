import { NextRequest, NextResponse } from 'next/server'

interface GenerateRequest {
  apiKey: string
  groupId: string
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
- Output ONLY valid JSON`
}

// 模拟数据
function getMockResult(data: GenerateRequest): ListingResult {
  return {
    title: `${data.productName} - Premium Quality with Advanced Features | ${data.keywords.split(',')[0].trim()}`,
    bullet1: `【Advanced Technology】Equipped with cutting-edge ${data.keywords.split(',')[0].trim()} technology for superior performance.`,
    bullet2: `【Long Battery Life】Extended usage time ensures you stay connected throughout the day.`,
    bullet3: `【Premium Design】Ergonomic and stylish design provides maximum comfort.`,
    bullet4: `【Easy to Use】Simple plug-and-play setup works instantly with all your devices.`,
    bullet5: `【Customer Support】24/7 dedicated support and warranty included.`,
    description: `Introducing our premium ${data.productName}, designed for discerning customers who demand the best.

This exceptional product combines cutting-edge technology with elegant design to deliver an unparalleled experience.

Key Features:
• Advanced ${data.keywords.split(',')[0].trim()} technology
• Premium build quality
• Sleek, modern design
• Easy setup and intuitive operation
• Comprehensive warranty

Perfect for ${data.keywords}, this product is meticulously crafted to exceed your expectations.`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    
    if (!body.apiKey) {
      return NextResponse.json(
        { error: 'API Key 不能为空' },
        { status: 400 }
      )
    }
    
    if (!body.productName || !body.keywords) {
      return NextResponse.json(
        { error: '产品名称和关键词不能为空' },
        { status: 400 }
      )
    }

    // 测试模式
    if (body.apiKey === 'test') {
      return NextResponse.json({ 
        result: getMockResult(body),
        isTestMode: true 
      })
    }

    const prompt = buildPrompt(body)
    
    // MiniMax API 调用 - 需要 Group ID
    const groupId = body.groupId || ''
    
    if (!groupId) {
      // 没有 Group ID，尝试使用新版本 API
      const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${body.apiKey}`,
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [
            { role: 'system', content: 'You are an expert Amazon product listing copywriter.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('MiniMax API error (no group):', errorText)
        
        // API 失败，返回模拟数据并提示
        return NextResponse.json({ 
          result: getMockResult(body),
          warning: `API 调用失败: ${errorText.slice(0, 100)}。请检查 API Key 和 Group ID 是否正确。`
        })
      }

      const data = await response.json()
      return handleAIResponse(data, body)
    }

    // 有 Group ID 的情况 - 使用旧版 API
    const endpoint = `https://api.minimax.chat/v1/text/chatcompletion_pro?GroupId=${groupId}`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${body.apiKey}`,
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: 'You are an expert Amazon product listing copywriter.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MiniMax API error (with group):', errorText)
      return NextResponse.json({ 
        result: getMockResult(body),
        warning: `API 调用失败: ${errorText.slice(0, 100)}`
      })
    }

    const data = await response.json()
    return handleAIResponse(data, body)
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      result: getMockResult({ apiKey: '', groupId: '', productName: 'Sample', keywords: 'test', productFeatures: '', tone: 'professional' }),
      error: '服务异常'
    })
  }
}

function handleAIResponse(data: any, body: GenerateRequest): NextResponse {
  try {
    const content = data.choices?.[0]?.message?.content || ''
    console.log('AI response:', content)
    
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\w*\n?/, '').replace(/```$/, '')
    }
    
    let result: ListingResult
    try {
      result = JSON.parse(jsonStr)
    } catch {
      const match = jsonStr.match(/\{[\s\S]*\}/)
      if (match) {
        result = JSON.parse(match[0])
      } else {
        return NextResponse.json({ 
          result: getMockResult(body),
          warning: 'AI 响应格式解析失败，已返回测试数据'
        })
      }
    }
    
    result = {
      title: result?.title || '',
      bullet1: result?.bullet1 || '',
      bullet2: result?.bullet2 || '',
      bullet3: result?.bullet3 || '',
      bullet4: result?.bullet4 || '',
      bullet5: result?.bullet5 || '',
      description: result?.description || ''
    }
    
    return NextResponse.json({ result })
  } catch (e) {
    return NextResponse.json({ 
      result: getMockResult(body),
      warning: '响应解析失败，已返回测试数据'
    })
  }
}
