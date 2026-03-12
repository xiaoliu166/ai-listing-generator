/**
 * 亚马逊竞品分析爬虫
 * 负责抓取 ASIN 的 Listing 和评论数据
 */

import puppeteer, { Browser, Page } from 'puppeteer'

let browser: Browser | null = null

// 获取浏览器实例
async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ]
    })
  }
  return browser
}

// 关闭浏览器
export async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}

interface ListingData {
  asin: string
  title: string
  rating: string
  reviews: string
  bullet1: string
  bullet2: string
  bullet3: string
  bullet4: string
  bullet5: string
  description: string
  price: string
  images: string[]
}

// 抓取 ASIN Listing 信息
export async function scrapeASIN(asin: string, domain: string = 'com'): Promise<ListingData> {
  const url = `https://www.amazon.${domain}/dp/${asin}`
  
  console.log(`[爬虫] 开始抓取: ${url}`)
  
  const browser = await getBrowser()
  const page = await browser.newPage()
  
  // 设置视口
  await page.setViewport({ width: 1920, height: 1080 })
  
  // 设置 User Agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // 等待页面加载
    await page.waitForSelector('#productTitle', { timeout: 15000 }).catch(() => null)
    
    // 提取数据
    const data = await page.evaluate(() => {
      const getText = (selector: string) => {
        const el = document.querySelector(selector)
        return el ? el.textContent?.trim() || '' : ''
      }
      
      const getAllText = (selector: string) => {
        const els = document.querySelectorAll(selector)
        return Array.from(els).map(el => el.textContent?.trim()).filter(Boolean)
      }
      
      return {
        title: getText('#productTitle'),
        rating: getText('#acrPopover .a-icon-alt'),
        reviews: getText('#acrCustomerReviewText'),
        bullet1: getText('#feature-bullets li:nth-child(1)'),
        bullet2: getText('#feature-bullets li:nth-child(2)'),
        bullet3: getText('#feature-bullets li:nth-child(3)'),
        bullet4: getText('#feature-bullets li:nth-child(4)'),
        bullet5: getText('#feature-bullets li:nth-child(5)'),
        description: getText('#productDescription p'),
        price: getText('.a-price .a-offscreen') || getText('#priceblock_ourprice') || getText('#priceblock_dealprice'),
        images: Array.from(document.querySelectorAll('#altImages img')).slice(0, 5).map(img => (img as HTMLImageElement).src)
      }
    })
    
    await page.close()
    
    console.log(`[爬虫] 抓取成功: ${asin}`)
    
    return {
      asin,
      ...data
    }
    
  } catch (error: any) {
    await page.close()
    console.error(`[爬虫] 抓取失败: ${asin}`, error.message)
    throw new Error(`抓取失败: ${error.message}`)
  }
}

interface ReviewData {
  asin: string
  reviews: Array<{
    rating: number
    title: string
    content: string
    date: string
    verified: boolean
  }>
  totalReviews: number
}

// 抓取评论
export async function scrapeReviews(asin: string, domain: string = 'com', maxReviews: number = 50): Promise<ReviewData> {
  const url = `https://www.amazon.${domain}/product-reviews/${asin}`
  
  console.log(`[爬虫] 开始抓取评论: ${url}`)
  
  const browser = await getBrowser()
  const page = await browser.newPage()
  
  await page.setViewport({ width: 1920, height: 1080 })
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    // 等待评论加载
    await page.waitForSelector('.a-review', { timeout: 15000 }).catch(() => null)
    
    const reviews = await page.evaluate((limit) => {
      const reviewEls = document.querySelectorAll('.a-review')
      const result: Array<{
        rating: number
        title: string
        content: string
        date: string
        verified: boolean
      }> = []
      
      reviewEls.forEach((el) => {
        if (result.length >= limit) return
        
        const ratingText = el.querySelector('.a-icon-alt')?.textContent || '0'
        const rating = parseFloat(ratingText.split(' ')[0]) || 0
        
        const title = el.querySelector('.a-text-bold span')?.textContent?.trim() || ''
        const content = el.querySelector('.review-text-content span')?.textContent?.trim() || ''
        const date = el.querySelector('.review-date')?.textContent?.trim() || ''
        const verified = !!el.querySelector('.a-icon-verified-badge')
        
        if (content) {
          result.push({ rating, title, content, date, verified })
        }
      })
      
      return result
    }, maxReviews)
    
    // 获取总评论数
    const totalText = await page.evaluate(() => {
      return document.querySelector('[data-hook="total-review-count"]')?.textContent || '0'
    })
    
    await page.close()
    
    console.log(`[爬虫] 抓取评论成功: ${asin}, 获取 ${reviews.length} 条`)
    
    return {
      asin,
      reviews,
      totalReviews: parseInt(totalText.replace(/[^0-9]/g, '')) || reviews.length
    }
    
  } catch (error: any) {
    await page.close()
    console.error(`[爬虫] 抓取评论失败: ${asin}`, error.message)
    throw new Error(`抓取评论失败: ${error.message}`)
  }
}

// 提取关键词（简单版本）
export function extractKeywords(text: string): Array<{ word: string; count: number }> {
  // 停用词
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'this', 'that', 'these', 'those', 'it', 'its', 'and', 'but', 'or',
    'not', 'no', 'so', 'very', 'just', 'also', 'only', 'even', 'still',
    'my', 'your', 'his', 'her', 'their', 'our', 'i', 'you', 'we', 'they',
    'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'than', 'too', 'much', 'many', 'am', 'if', 'then', 'because',
    'while', 'although', 'though', 'however', 'otherwise', 'else', 'get',
    'made', 'make', 'use', 'using', 'used', 'one', 'two', 'first', 'new'
  ])
  
  // 分词
  const words = text.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
  
  // 统计词频
  const freq: Record<string, number> = {}
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1
  })
  
  // 排序返回
  return Object.entries(freq)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
}

// 情感分析（简化版）
export function analyzeSentiment(reviews: Array<{ content: string; rating: number }>) {
  const positive: string[] = []
  const negative: string[] = []
  
  const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'best', 'good', 'awesome', 'fantastic', 'wonderful']
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'worst', 'disappointed', 'broken', 'defective', 'slow']
  
  reviews.forEach(review => {
    const text = review.content.toLowerCase()
    
    if (review.rating >= 4) {
      // 提取好评中的关键词
      positiveWords.forEach(word => {
        if (text.includes(word)) {
          if (!positive.includes(word)) positive.push(word)
        }
      })
    } else if (review.rating <= 2) {
      // 提取差评中的关键词
      negativeWords.forEach(word => {
        if (text.includes(word)) {
          if (!negative.includes(word)) negative.push(word)
        }
      })
    }
  })
  
  return {
    positive: positive.slice(0, 10),
    negative: negative.slice(0, 10)
  }
}
