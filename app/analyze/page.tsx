'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle, BarChart3, MessageCircle, TrendingUp } from 'lucide-react'

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
}

export default function AnalyzePage() {
  const [asins, setAsins] = useState('')
  const [domain, setDomain] = useState('com')
  const [includeReviews, setIncludeReviews] = useState(false)
  const [testMode, setTestMode] = useState(true)  // 默认测试模式
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔍 竞品分析工具
          </h1>
          <p className="text-purple-200">
            输入 ASIN，分析竞品 Listing、关键词和用户评价
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-8 border border-slate-700">
          <div className="grid gap-6">
            {/* ASIN Input */}
            <div>
              <label className="block text-slate-300 mb-2 font-medium">
                ASIN（最多5个，用逗号分隔）
              </label>
              <textarea
                value={asins}
                onChange={(e) => setAsins(e.target.value)}
                placeholder="B08N5WRWNW, B09V3KXJPB"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
              />
            </div>

            {/* Domain & Options */}
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">站点</label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {domains.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 flex items-end gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-700/30 px-4 py-3 rounded-xl border border-slate-600 hover:border-purple-500 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeReviews}
                    onChange={(e) => setIncludeReviews(e.target.checked)}
                    className="w-5 h-5 rounded text-purple-500"
                  />
                  <span className="text-slate-300">包含评论分析</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer bg-purple-700/30 px-4 py-3 rounded-xl border border-purple-500 hover:border-purple-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => setTestMode(e.target.checked)}
                    className="w-5 h-5 rounded text-purple-500"
                  />
                  <span className="text-purple-300">测试模式（模拟数据）</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <pre className="whitespace-pre-wrap text-sm">{error}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Summary */}
            {summary && (
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-white">{summary.total}</div>
                  <div className="text-slate-400">总 ASIN</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-green-400">{summary.success}</div>
                  <div className="text-slate-400">成功</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-red-400">{summary.failed}</div>
                  <div className="text-slate-400">失败</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700 text-center">
                  <div className="text-3xl font-bold text-purple-400">{summary.remainingFreeUses}</div>
                  <div className="text-slate-400">剩余次数</div>
                </div>
              </div>
            )}

            {/* Result Cards */}
            {results.map((result, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 bg-slate-700/30 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono text-purple-400">{result.asin}</span>
                    {result.success ? (
                      <span className="flex items-center gap-1 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" /> 分析成功
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" /> {result.error || '失败'}
                      </span>
                    )}
                  </div>
                  {result.listing?.rating && (
                    <div className="text-yellow-400">
                      ⭐ {result.listing.rating} ({result.listing.reviews})
                    </div>
                  )}
                </div>

                {/* Content */}
                {result.success && result.listing && (
                  <div className="p-6 space-y-6">
                    {/* Title & Price */}
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{result.listing.title}</h3>
                      {result.listing.price && (
                        <p className="text-2xl font-bold text-green-400">{result.listing.price}</p>
                      )}
                    </div>

                    {/* Bullet Points */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {[result.listing.bullet1, result.listing.bullet2, result.listing.bullet3, result.listing.bullet4, result.listing.bullet5]
                        .filter(Boolean)
                        .map((bullet, i) => (
                          <div key={i} className="flex gap-2 text-slate-300">
                            <span className="text-purple-400">•</span>
                            <span>{bullet}</span>
                          </div>
                        ))}
                    </div>

                    {/* Keywords */}
                    {result.keywords && result.keywords.length > 0 && (
                      <div className="bg-slate-700/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-purple-400">
                          <TrendingUp className="w-5 h-5" />
                          <span className="font-bold">关键词</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                              {kw.word} ({kw.count})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sentiment */}
                    {result.sentiment && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {result.sentiment.positive.length > 0 && (
                          <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                            <div className="flex items-center gap-2 mb-3 text-green-400">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-bold">好评卖点</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.sentiment.positive.map((word, i) => (
                                <span key={i} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                                  {word}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.sentiment.negative.length > 0 && (
                          <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                            <div className="flex items-center gap-2 mb-3 text-red-400">
                              <AlertCircle className="w-5 h-5" />
                              <span className="font-bold">差评痛点</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {result.sentiment.negative.map((word, i) => (
                                <span key={i} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
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
        )}
      </div>
    </div>
  )
}
