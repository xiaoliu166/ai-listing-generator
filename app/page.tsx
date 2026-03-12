'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2, Search, Zap, FileText } from 'lucide-react'
import Link from 'next/link'

interface ListingResult {
  title: string
  bullet1: string
  bullet2: string
  bullet3: string
  bullet4: string
  bullet5: string
  description: string
}

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [groupId, setGroupId] = useState('')
  const [productName, setProductName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [productFeatures, setProductFeatures] = useState('')
  const [tone, setTone] = useState('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [testMode, setTestMode] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!testMode && !apiKey) {
      alert('请输入 API Key 或开启测试模式')
      return
    }
    if (!productName || !keywords) {
      alert('请输入产品名称和关键词')
      return
    }

    setIsGenerating(true)
    setResult(null)
    setWarning(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: testMode ? 'test' : apiKey,
          groupId: testMode ? '' : groupId,
          productName,
          keywords,
          productFeatures,
          tone,
        }),
      })

      const data = await response.json()
      if (data.error) {
        alert(data.error)
        return
      }
      if (data.warning) {
        setWarning(data.warning)
      }
      if (data.isTestMode) {
        setWarning('测试模式：已使用模拟数据')
      }
      setResult(data.result)
    } catch (error) {
      console.error('Error generating listing:', error)
      alert('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const tones = [
    { value: 'professional', label: '专业商务' },
    { value: 'casual', label: '轻松随意' },
    { value: 'luxury', label: '高端奢华' },
    { value: 'friendly', label: '亲切友好' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-neutral-950 to-neutral-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container mx-auto px-4 py-16 max-w-6xl relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AI Listing</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/analyze" className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
                竞品分析
              </Link>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              <span>AI-Powered</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-violet-200 to-indigo-400 bg-clip-text text-transparent">
              Listing 生成
            </h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto">
              输入产品信息，AI 自动生成优化的 Amazon Listing 文案
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                产品信息
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    产品名称 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="例如: Wireless Bluetooth Earbuds"
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    核心关键词 <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="例如: wireless earbuds, bluetooth 5.0"
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    产品特点
                  </label>
                  <textarea
                    value={productFeatures}
                    onChange={(e) => setProductFeatures(e.target.value)}
                    placeholder="例如: 30小时续航，IPX5防水"
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    文案风格
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all appearance-none cursor-pointer"
                  >
                    {tones.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={testMode}
                        onChange={(e) => {
                          setTestMode(e.target.checked)
                          if (e.target.checked) setApiKey('test')
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-neutral-700 rounded-full peer-checked:bg-emerald-600 transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">测试模式</span>
                  </label>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      生成 Listing
                    </>
                  )}
                </button>

                {warning && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-sm">
                    {warning}
                  </div>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              {!result ? (
                <div className="bg-neutral-900/30 border border-neutral-800 border-dashed rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-neutral-600" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-400 mb-2">
                    填写左侧信息开始生成
                  </h3>
                  <p className="text-sm text-neutral-500">
                    AI 将自动生成优化的 Amazon Listing
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Title */}
                  <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-500 uppercase">Title</span>
                      <button
                        onClick={() => copyToClipboard(result.title, 'title')}
                        className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        {copied === 'title' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-white leading-relaxed">{result.title}</p>
                  </div>

                  {/* Bullet Points */}
                  <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-neutral-500 uppercase">Bullet Points</span>
                    </div>
                    <ul className="space-y-2">
                      {[
                        result.bullet1,
                        result.bullet2,
                        result.bullet3,
                        result.bullet4,
                        result.bullet5,
                      ].map((bullet, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span className="text-violet-400 font-bold mt-0.5">{i + 1}.</span>
                          <span className="text-neutral-300 flex-1">{bullet}</span>
                          <button
                            onClick={() => copyToClipboard(bullet, `bullet${i}`)}
                            className="p-1 hover:bg-neutral-800 rounded transition-colors"
                          >
                            {copied === `bullet${i}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-600" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description */}
                  <div className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-500 uppercase">Description</span>
                      <button
                        onClick={() => copyToClipboard(result.description, 'description')}
                        className="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors"
                      >
                        {copied === 'description' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">{result.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
