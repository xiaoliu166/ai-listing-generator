/**
 * 竞品分析 API
 * POST /api/analyze
 */

import { NextRequest, NextResponse } from 'next/server'
import { scrapeASIN, scrapeReviews, extractKeywords, analyzeSentiment, closeBrowser } from '@/lib/amazon-scraper'

// 用户会话（简化版 - 内存存储）
interface UserSession {
  userId: string
  dailyCount: number
  lastDate: string
  isPro: boolean
}

const sessions: Map<string, UserSession> = new Map()

function getSession(userId: string): UserSession {
  const today = new Date().toISOString().split('T')[0]
  
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      userId,
      dailyCount: 0,
      lastDate: today,
      isPro: false
    })
  }
  
  const session = sessions.get(userId)!
  
  // 新的一天，重置计数
  if (session.lastDate !== today) {
    session.dailyCount = 0
    session.lastDate = today
  }
  
  return session
}

interface AnalyzeRequest {
  asins: string[]  // 最多5个
  domain?: string  // com, co.uk, de, co.jp, es
  userId?: string
  includeReviews?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json()
    const { asins, domain = 'com', userId = 'anonymous', includeReviews = false } = body
    
    // 参数校验
    if (!asins || asins.length === 0) {
      return NextResponse.json({ error: '请提供 ASIN' }, { status: 400 })
    }
    
    if (asins.length > 5) {
      return NextResponse.json({ error: '最多支持 5 个 ASIN' }, { status: 400 })
    }
    
    // 检查次数限制（非付费用户每天1次）
    const session = getSession(userId)
    if (!session.isPro) {
      if (session.dailyCount >= 1) {
        return NextResponse.json({
          error: '免费版每天只能分析1次',
          upgrade: true,
          price: { monthly: 49, yearly: 399 }
        }, { status: 403 })
      }
      session.dailyCount++
    }
    
    // 并行抓取所有 ASIN
    const results = await Promise.allSettled(
      asins.map(async (asin) => {
        console.log(`[API] 开始分析 ASIN: ${asin}`)
        
        // 抓取 Listing
        let listing = null
        try {
          listing = await scrapeASIN(asin, domain)
        } catch (e) {
          console.error(`[API] 抓取失败: ${asin}`, e)
        }
        
        // 抓取评论（可选）
        let reviews = null
        if (includeReviews && listing) {
          try {
            const reviewData = await scrapeReviews(asin, domain, 50)
            reviews = reviewData.reviews
          } catch (e) {
            console.error(`[API] 抓取评论失败: ${asin}`, e)
          }
        }
        
        // 提取关键词
        let keywords: Array<{ word: string; count: number }> = []
        if (listing) {
          const fullText = [
            listing.title,
            listing.bullet1, listing.bullet2, listing.bullet3, listing.bullet4, listing.bullet5,
            listing.description
          ].filter(Boolean).join(' ')
          
          keywords = extractKeywords(fullText)
        }
        
        // 情感分析
        let sentiment = null
        if (reviews && reviews.length > 0) {
          sentiment = analyzeSentiment(reviews.map(r => ({
            content: r.content,
            rating: r.rating
          })))
        }
        
        return {
          asin,
          listing,
          keywords: keywords.slice(0, 10),
          reviewCount: reviews?.length || 0,
          sentiment,
          success: !!listing
        }
      })
    )
    
    // 处理结果
    const data = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          asin: asins[index],
          success: false,
          error: result.reason?.message || '未知错误'
        }
      }
    })
    
    // 统计
    const successCount = data.filter(d => d.success).length
    
    return NextResponse.json({
      success: true,
      data,
      summary: {
        total: asins.length,
        success: successCount,
        failed: asins.length - successCount,
        remainingFreeUses: session.isPro ? '无限' : Math.max(0, 1 - session.dailyCount)
      }
    })
    
  } catch (error: any) {
    console.error('[API] 分析失败:', error)
    return NextResponse.json({
      error: '分析失败',
      message: error.message
    }, { status: 500 })
  }
}

// 清理浏览器进程
export async function GET() {
  await closeBrowser()
  return NextResponse.json({ message: 'Browser closed' })
}
