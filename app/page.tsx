'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2, Upload, Key, Search } from 'lucide-react'
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
  const [testMode, setTestMode] = useState(false)
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">AI Listing</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/analyze" className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <Search className="w-4 h-4" />
              竞品分析
            </Link>
            <span className="text-sm text-gray-500">已接入 MiniMax API</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 输入区 */}
          <div className="space-y-6">
            {/* API Key 输入 */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Key className="w-5 h-5" />
                API 设置
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MiniMax API Key {!testMode && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={testMode ? "测试模式无需填写" : "在 platform.minimax.cn 获取 API Key"}
                    className="input-field pr-10"
                    disabled={testMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  你的 API Key 仅保存在浏览器本地，不会发送到服务器
                </p>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testMode}
                    onChange={(e) => {
                      setTestMode(e.target.checked)
                      if (e.target.checked) setApiKey('test')
                    }}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-gray-600">测试模式（无需 API Key）</span>
                </label>
              </div>

              {/* Group ID - 仅在非测试模式显示 */}
              {!testMode && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group ID（可选）
                  </label>
                  <input
                    type="text"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    placeholder="如果 API 调用失败请填写 Group ID"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    在 MiniMax 控制台 → 我的应用 获取
                  </p>
                </div>
              )}
            </div>

            {/* 产品信息 */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">产品信息</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品名称 *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="例如: Wireless Bluetooth Earbuds"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    核心关键词 *
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="例如: wireless earbuds, bluetooth 5.0"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品特点
                  </label>
                  <textarea
                    value={productFeatures}
                    onChange={(e) => setProductFeatures(e.target.value)}
                    placeholder="例如: 30小时续航，IPX5防水"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文案风格
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="input-field"
                  >
                    <option value="professional">专业商务</option>
                    <option value="casual">轻松随意</option>
                    <option value="luxury">高端奢华</option>
                    <option value="friendly">亲切友好</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="btn-primary w-full flex items-center justify-center gap-2"
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
          </div>

          {/* 输出区 */}
          <div className="space-y-6">
            {warning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                ⚠️ {warning}
              </div>
            )}
            {!result ? (
              <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  填写左侧信息开始生成
                </h3>
                <p className="text-sm text-gray-400">
                  AI 将自动生成优化的 Amazon Listing
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Title */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Title</span>
                    <button
                      onClick={() => copyToClipboard(result.title, 'title')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copied === 'title' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-800">{result.title}</p>
                </div>

                {/* Bullet Points */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Bullet Points</span>
                  </div>
                  <ul className="space-y-2">
                    {[
                      result.bullet1,
                      result.bullet2,
                      result.bullet3,
                      result.bullet4,
                      result.bullet5,
                    ].map((bullet, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <span className="text-gray-700 flex-1">{bullet}</span>
                        <button
                          onClick={() => copyToClipboard(bullet, `bullet${i}`)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copied === `bullet${i}` ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Description */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Description</span>
                    <button
                      onClick={() => copyToClipboard(result.description, 'description')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {copied === 'description' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{result.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
