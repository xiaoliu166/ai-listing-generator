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

function buildPrompt(data: GenerateRequest): string {
  const toneMap: Record<string, string> = {
    professional: 'Professional and business-like',
    casual: 'Casual and friendly',
    luxury: 'Luxury and premium',
    friendly: 'Warm and approachable',
  }

  return `Generate an Amazon product listing. 

Product: ${data.productName}
Keywords: ${data.keywords}
Features: ${data.productFeatures || 'Not specified'}
Tone: ${toneMap[data.tone] || toneMap.professional}

Output ONLY valid JSON:
{"title":"...","bullet1":"...","bullet2":"...","bullet3":"...","bullet4":"...","bullet5":"...","description":"..."}`
}

function getMockResult(data: GenerateRequest): ListingResult {
  // 根据 tone 返回不同的前缀
  const tonePrefix: Record<string, string> = {
    professional: 'Premium',
    casual: 'Awesome',
    luxury: 'Exclusive',
    friendly: 'Amazing'
  }
  
  const prefix = tonePrefix[data.tone] || tonePrefix.professional
  const keyword = data.keywords.split(',')[0].trim()
  
  return {
    title: `${prefix} ${data.productName} - ${keyword} Edition`,
    bullet1: `Advanced ${keyword} technology for superior performance.`,
    bullet2: `Long battery life for all-day use.`,
    bullet3: `Premium ergonomic design for maximum comfort.`,
    bullet4: `Easy setup and intuitive operation.`,
    bullet5: `24/7 customer support and warranty included.`,
    description: `${prefix} ${data.productName} with advanced features. Perfect for ${data.keywords}.`,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    
    // 参数校验 - 优先校验必要参数
    if (!body.productName || !body.keywords) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }
    
    if (!body.apiKey || body.apiKey === 'test') {
      return NextResponse.json({ 
        result: getMockResult(body),
        isTestMode: true 
      })
    }

    const prompt = buildPrompt(body)
    const { apiKey, groupId } = body

    // 尝试多个 API 版本
    const endpoints = [
      // 尝试新版 API (不需要 Group ID)
      {
        url: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
        body: {
          model: 'abab6.5s-chat',
          messages: [
            { role: 'system', content: 'You are a professional Amazon listing writer. Always output valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }
      },
      // 尝试旧版 API (需要 Group ID)
      ...(groupId ? [{
        url: `https://api.minimax.chat/v1/text/chatcompletion_pro?GroupId=${groupId}`,
        body: {
          model: 'abab6.5s-chat',
          messages: [
            { role: 'system', content: 'You are a professional Amazon listing writer. Always output valid JSON.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        }
      }] : [])
    ]

    let lastError = ''
    
    for (const ep of endpoints) {
      try {
        const response = await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(ep.body),
        })

        if (!response.ok) {
          lastError = await response.text()
          continue
        }

        const data = await response.json()
        console.log('MiniMax response:', JSON.stringify(data).slice(0, 500))
        
        // 提取内容
        const content = data?.choices?.[0]?.message?.content || ''
        
        // 尝试解析 JSON
        let result: ListingResult
        try {
          // 尝试直接解析
          result = JSON.parse(content)
        } catch {
          // 尝试提取 JSON
          const match = content.match(/\{[\s\S]*\}/)
          if (match) {
            result = JSON.parse(match[0])
          } else {
            throw new Error('No JSON found')
          }
        }

        // 确保字段完整
        if (result?.title) {
          return NextResponse.json({ result })
        }
        
        lastError = 'Invalid response structure'
      } catch (e: any) {
        lastError = e.message
      }
    }

    // 所有 API 都失败，返回模拟数据
    return NextResponse.json({ 
      result: getMockResult(body),
      warning: `API 调用失败: ${lastError.slice(0, 100)}。已返回测试数据。`
    })
    
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ 
      result: getMockResult({ apiKey: '', groupId: '', productName: 'Sample', keywords: 'test', productFeatures: '', tone: 'professional' }),
      warning: '服务异常，已返回测试数据'
    })
  }
}
