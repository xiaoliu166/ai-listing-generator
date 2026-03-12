'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react'

interface ListingResult {
  title: string
  bullet1: string
  bullet2: string
  bullet3: string
  bullet4: string
  bullet5: string
  description: string
}

export default function GeneratePage() {
  const [productName, setProductName] = useState('')
  const [keywords, setKeywords] = useState('')
  const [productFeatures, setProductFeatures] = useState('')
  const [tone, setTone] = useState('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!productName || !keywords) {
      alert('请填写产品名称和关键词')
      return
    }
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: 'test',
          productName,
          keywords,
          productFeatures,
          tone,
        }),
      })
      const data = await response.json()
      setResult(data.result)
    } catch (error) {
      console.error(error)
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Listing 生成</h1>
        <p className="text-neutral-400">输入产品信息，AI自动生成优化的Amazon Listing</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">产品名称 *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="例如: Wireless Bluetooth Earbuds"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">核心关键词 *</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="例如: wireless earbuds, bluetooth 5.0"
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">产品特点</label>
            <textarea
              value={productFeatures}
              onChange={(e) => setProductFeatures(e.target.value)}
              placeholder="例如: 30小时续航，IPX5防水"
              rows={3}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">文案风格</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="professional">专业商务</option>
              <option value="casual">轻松随意</option>
              <option value="luxury">高端奢华</option>
              <option value="friendly">亲切友好</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? '生成中...' : '生成 Listing'}
          </button>
        </div>

        {/* Output */}
        <div>
          {!result ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-neutral-800 rounded-2xl">
              <p className="text-neutral-500">填写左侧信息开始生成</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-neutral-500 uppercase">Title</span>
                  <button onClick={() => copyToClipboard(result.title, 'title')} className="p-1 hover:bg-neutral-800 rounded">
                    {copied === 'title' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-500" />}
                  </button>
                </div>
                <p className="text-white">{result.title}</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-neutral-500 uppercase">Bullet Points</span>
                </div>
                <ul className="space-y-2">
                  {[result.bullet1, result.bullet2, result.bullet3, result.bullet4, result.bullet5].map((bullet, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-violet-400 font-bold">{i+1}.</span>
                      <span className="text-neutral-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-neutral-500 uppercase">Description</span>
                  <button onClick={() => copyToClipboard(result.description, 'desc')} className="p-1 hover:bg-neutral-800 rounded">
                    {copied === 'desc' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-neutral-500" />}
                  </button>
                </div>
                <p className="text-neutral-300 whitespace-pre-wrap">{result.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
