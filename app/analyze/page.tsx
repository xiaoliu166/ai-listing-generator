'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle, TrendingUp, MessageCircle, Sparkles, Zap, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyzeResult {
  asin: string
  success: boolean
  listing?: {
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
  }
  keywords?: Array<{ word: string; count: number }>
  sentiment?: {
    positive: string[]
    negative: string[]
  }
  reviewCount?: number
  error?: string
  isDemo?: boolean
}

export default function AnalyzePage() {
  const [asins, setAsins] = useState('')
  const [domain, setDomain] = useState('com')
  const [includeReviews, setIncludeReviews] = useState(false)
  const [testMode, setTestMode] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalyzeResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!asins.trim()) {
      setError('请输入 ASIN')
      return
    }

    const asinList = asins.split(',').map(a => a.trim()).filter(Boolean)
    if (asinList.length === 0) {
      setError('请输入有效的 ASIN')
      return
    }
    if (asinList.length > 5) {
      setError('最多支持 5 个 ASIN')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResults([])
    setSummary(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asins: asinList,
          domain,
          includeReviews,
          testMode,
          userId: 'web_user'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403 && data.upgrade) {
          setError(`免费版每天只能分析1次！\n月付¥${data.price.monthly} / 年付¥${data.price.yearly}`)
        } else {
          setError(data.error || '分析失败')
        }
        return
      }

      setResults(data.data || [])
      setSummary(data.summary)

    } catch (err: any) {
      setError(err.message || '请求失败')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const domains = [
    { value: 'com', label: '🇺🇸 美国' },
    { value: 'co.uk', label: '🇬🇧 英国' },
    { value: 'de', label: '🇩🇪 德国' },
    { value: 'co.jp', label: '🇯🇵 日本' },
    { value: 'es', label: '🇪🇸 西班牙' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950 to-neutral-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container mx-auto px-4 py-16 max-w-5xl relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              竞品分析
            </h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto">
              输入 ASIN，一键获取竞品 Listing、关键词和用户评价分析
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  ASIN（最多5个，用逗号分隔）
                </label>
                <textarea
                  value={asins}
                  onChange={(e) => setAsins(e.target.value)}
                  placeholder="B08N5WRWNW, B09V3KXJPB"
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  rows={2}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">站点</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {domains.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={includeReviews}
                        onChange={(e) => setIncludeReviews(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-neutral-700 rounded-full peer-checked:bg-indigo-600 transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">包含评论分析</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={testMode}
                        onChange={(e) => setTestMode(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-neutral-700 rounded-full peer-checked:bg-emerald-600 transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">测试模式</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    开始分析
                  </>
                )}
              </button>

              {error && (
                <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap text-sm">{error}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white">{summary.total}</div>
                <div className="text-sm text-neutral-500">总 ASIN</div>
              </div>
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">{summary.success}</div>
                <div className="text-sm text-neutral-500">成功</div>
              </div>
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-rose-400">{summary.failed}</div>
                <div className="text-sm text-neutral-500">失败</div>
              </div>
              <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-indigo-400">{summary.remainingFreeUses}</div>
                <div className="text-sm text-neutral-500">剩余次数</div>
              </div>
            </div>
          )}

          {/* Result Cards */}
          <div className="space-y-6">
            {results.map((result, index) => (
              <div key={index} className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl overflow-hidden">
                {/* Card Header */}
                <div className="px-6 py-4 bg-neutral-800/30 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-mono text-indigo-400 font-semibold">{result.asin}</span>
                    {result.success ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4" /> 
                        {result.isDemo ? '演示数据' : '分析成功'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-400 text-sm bg-rose-500/10 px-3 py-1 rounded-full">
                        <AlertCircle className="w-4 h-4" /> {result.error || '失败'}
                      </span>
                    )}
                  </div>
                  {result.listing?.rating && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <span>⭐</span>
                      <span className="text-sm font-medium">{result.listing.rating}</span>
                      <span className="text-neutral-500 text-sm">({result.listing.reviews})</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                {result.success && result.listing && (
                  <div className="p-6 space-y-6">
                    {/* Title & Price */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{result.listing.title}</h3>
                      {result.listing.price && (
                        <p className="text-3xl font-bold text-emerald-400">{result.listing.price}</p>
                      )}
                    </div>

                    {/* Bullet Points */}
                    <div className="grid md:grid-cols-2 gap-3">
                      {[result.listing.bullet1, result.listing.bullet2, result.listing.bullet3, result.listing.bullet4, result.listing.bullet5]
                        .filter(Boolean)
                        .map((bullet, i) => (
                          <div key={i} className="flex gap-3 text-neutral-300 bg-neutral-800/30 p-3 rounded-lg">
                            <span className="text-indigo-400 font-semibold">{i + 1}.</span>
                            <span>{bullet}</span>
                          </div>
                        ))}
                    </div>

                    {/* Keywords */}
                    {result.keywords && result.keywords.length > 0 && (
                      <div className="bg-neutral-800/30 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4 text-indigo-400">
                          <TrendingUp className="w-5 h-5" />
                          <span className="font-semibold">关键词</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1.5 bg-indigo-500/15 text-indigo-300 rounded-full text-sm font-medium border border-indigo-500/20">
                              {kw.word}
                              <span className="ml-1.5 text-indigo-500 text-xs">{kw.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sentiment */}
                    {result.sentiment && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {result.sentiment.positive.length > 0 && (
                          <div className="bg-emerald-500/5 rounded-xl p-5 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-4 text-emerald-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-semibold">好评卖点</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.sentiment.positive.map((word, i) => (
                                <span key={i} className="px-3 py-1.5 bg-emerald-500/15 text-emerald-300 rounded-full text-sm">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.sentiment.negative.length > 0 && (
                          <div className="bg-rose-500/5 rounded-xl p-5 border border-rose-500/20">
                            <div className="flex items-center gap-2 mb-4 text-rose-400">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-semibold">差评痛点</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.sentiment.negative.map((word, i) => (
                                <span key={i} className="px-3 py-1.5 bg-rose-500/15 text-rose-300 rounded-full text-sm">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
