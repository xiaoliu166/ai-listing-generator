'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'

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
}

const marketOptions = [
  { value: 'com', label: '🇺🇸 美国' },
  { value: 'co.uk', label: '🇬🇧 英国' },
  { value: 'de', label: '🇩🇪 德国' },
  { value: 'co.jp', label: '🇯🇵 日本' },
]

export default function AnalyzePage() {
  const [asinList, setAsinList] = useState('')
  const [market, setMarket] = useState('com')
  const [testMode, setTestMode] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalyzeResult[]>([])
  const [error, setError] = useState<string | null>(null)

  // 验证 ASIN 格式
  const validateASIN = (asin: string): boolean => {
    return /^[A-Z0-9]{10}$/i.test(asin.trim())
  }

  const handleAnalyze = () => {
    setError(null)
    
    // 解析 ASIN 列表
    const asins = asinList.split(/[,，\n]/).map(a => a.trim()).filter(Boolean)
    
    // 验证
    if (asins.length === 0) {
      setError('请输入ASIN')
      return
    }
    
    if (asins.length > 20) {
      setError('最多支持20个ASIN，请分批分析')
      return
    }
    
    // 检查格式
    const invalidASINs = asins.filter(a => !validateASIN(a))
    if (invalidASINs.length > 0) {
      setError(`ASIN格式不正确：${invalidASINs.join(', ')}，应为10位字母数字`)
      return
    }

    setIsAnalyzing(true)
    
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asins,
        domain: market,
        testMode,
        userId: 'web_user'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error)
      } else {
        setResults(data.data || [])
      }
    })
    .catch(err => setError('请求失败'))
    .finally(() => setIsAnalyzing(false))
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">竞品分析</h1>
        <p className="text-neutral-400">输入ASIN，一键分析竞品Listing、评论和卖点</p>
      </div>

      {/* Step 1: ASIN Input */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">ASIN输入</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              ASIN列表 <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={asinList}
              onChange={(e) => setAsinList(e.target.value)}
              placeholder="输入ASIN，多个用逗号或回车分隔，最多20个&#10;例如：B08N5WRWNW, B09V3KXJPB"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-neutral-500 mt-1">格式：10位字母数字，如B0XXXXX1</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              目标市场 <span className="text-rose-400">*</span>
            </label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {marketOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="w-4 h-4 rounded accent-violet-600"
              />
              <span className="text-sm text-neutral-400">测试模式（模拟数据）</span>
            </label>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {isAnalyzing ? '分析中...' : '开始分析'}
          </button>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">分析结果</h2>
          {results.map((result, index) => (
            <div key={index} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 bg-neutral-800/30 border-b border-neutral-800 flex items-center justify-between">
                <span className="font-mono text-violet-400">{result.asin}</span>
                {result.success ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" /> 成功
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 text-sm">
                    <AlertCircle className="w-4 h-4" /> 失败
                  </span>
                )}
              </div>
              {result.success && result.listing && (
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{result.listing.title}</h3>
                    <p className="text-emerald-400 text-lg">{result.listing.price}</p>
                    <p className="text-neutral-400">⭐ {result.listing.rating} ({result.listing.reviews})</p>
                  </div>
                  {result.keywords && result.keywords.length > 0 && (
                    <div className="bg-neutral-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3 text-violet-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">关键词</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((kw, i) => (
                          <span key={i} className="px-3 py-1 bg-violet-500/20 text-violet-300 rounded-full text-sm">
                            {kw.word} ({kw.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
