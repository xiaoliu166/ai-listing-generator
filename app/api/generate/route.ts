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

  return `You are an expert Amazon product listing copywriter. Generate a high-converting Amazon Listing based on the the following information:

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

// 模拟数据（用于测试）
function getMockResult(data: GenerateRequest): ListingResult {
  return {
    title: `${data.productName} - Premium Quality with Advanced Features | ${data.keywords.split(',')[0].trim()}`,
    bullet1: `【Advanced Technology】Equipped with cutting-edge ${data.keywords.split(',')[0].trim()} technology for superior performance and reliability.`,
    bullet2: `【Long Battery Life】Extended usage time ensures you stay connected throughout the day without frequent charging.`,
    bullet3: `【Premium Design】Ergonomic and stylish design provides maximum comfort for everyday use.`,
    bullet4: `【Easy to Use】Simple plug-and-play setup works instantly with all your devices.`,
    bullet5: `【Customer Support】24/7 dedicated support and warranty included for peace of mind.`,
    description: `Introducing our premium ${data.productName}, designed for discerning customers who demand the best.

This exceptional product combines cutting-edge technology with elegant design to deliver an unparalleled experience. Whether you're a beginner or a professional, you'll appreciate the thoughtful features that make everyday tasks effortless.

Key Features:
• Advanced ${data.keywords.split(',')[0].trim()} technology for optimal performance
• Premium build quality that ensures long-lasting durability
• Sleek, modern design that complements any lifestyle
• Easy setup and intuitive operation
• Comprehensive warranty and responsive customer support

Perfect for ${data.keywords}, this product is meticulously crafted to exceed your expectations. Experience the difference today!

What's in the Box:
1x ${data.productName}
1x User Manual
1x Warranty Card

Order now and transform your experience!`,
  }
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

    // 测试模式：apiKey 为 "test" 时返回模拟数据
    if (body.apiKey === 'test') {
      return NextResponse.json({ 
        result: getMockResult(body),
        isTestMode: true 
      })
    }

    // 构建 prompt
    const prompt = buildPrompt(body)
    
    // MiniMax API 调用
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MiniMax API error:', errorText)
      
      // 如果 API 失败，返回测试数据并提示用户
      const mockResult = getMockResult(body)
      return NextResponse.json({ 
        result: mockResult,
        warning: `API 调用失败，已返回测试数据。请检查 API Key 是否正确。错误信息: ${errorText}`
      })
    }

    const data = await response.json()
    
    // 解析 JSON 响应
    let result: ListingResult
    try {
      const content = data.choices?.[0]?.message?.content || ''
      console.log('Raw AI response:', content)
      
      // 清理内容，提取 JSON
      let jsonStr = content.trim()
      
      // 去掉 markdown 代码块
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\w*\n?/, '').replace(/```$/, '')
      }
      
      // 尝试解析
      try {
        result = JSON.parse(jsonStr)
      } catch {
        // 尝试找 JSON 部分
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found')
        }
      }
      
      // 补全字段
      result = {
        title: result?.title || '',
        bullet1: result?.bullet1 || '',
        bullet2: result?.bullet2 || '',
        bullet3: result?.bullet3 || '',
        bullet4: result?.bullet4 || '',
        bullet5: result?.bullet5 || '',
        description: result?.description || ''
      }
      
    } catch (parseError) {
      console.error('Parse error:', parseError)
      // 解析失败也返回测试数据
      const mockResult = getMockResult(body)
      return NextResponse.json({ 
        result: mockResult,
        warning: 'AI 响应解析失败，已返回测试数据'
      })
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Error generating listing:', error)
    
    // 即使出错也返回测试数据
    const mockResult = getMockResult({
      apiKey: '',
      productName: 'Sample Product',
      keywords: 'sample, test',
      productFeatures: '',
      tone: 'professional'
    })
    return NextResponse.json({ 
      result: mockResult,
      error: '服务异常，已返回测试数据'
    })
  }
}
