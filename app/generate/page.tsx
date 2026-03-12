'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check, Loader2, FileText } from 'lucide-react'

interface ListingResult {
  title: string
  bullet1: string
  bullet2: string
  bullet3: string
  bullet4: string
  bullet5: string
  description: string
}

const categoryOptions = [
  { value: 'electronics', label: '电子产品' },
  { value: 'home', label: '家居' },
  { value: 'clothing', label: '服装' },
  { value: 'beauty', label: '美妆' },
  { value: 'sports', label: '运动' },
]

const versionOptions = [
  { value: 'promotion', label: '促销型', desc: '强调优惠、性价比，适合促销秒杀' },
  { value: 'professional', label: '专业型', desc: '强调功能、专业，适合新品上架' },
  { value: 'story', label: '故事型', desc: '强调品牌、情感，适合品牌产品' },
]

const toneOptions = [
  { value: 'professional', label: '专业商务' },
  { value: 'casual', label: '轻松随意' },
  { value: 'luxury', label: '高端奢华' },
  { value: 'friendly', label: '亲切友好' },
]

export default function GeneratePage() {
  // 基本信息
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [productType, setProductType] = useState('')
  
  // 核心卖点
  const [benefit1, setBenefit1] = useState('')
  const [benefit2, setBenefit2] = useState('')
  const [benefit3, setBenefit3] = useState('')
  const [benefit4, setBenefit4] = useState('')
  const [benefit5, setBenefit5] = useState('')
  
  // 差异化
  const [differentiation, setDifferentiation] = useState('')
  const [useCase, setUseCase] = useState('')
  
  // 生成参数
  const [version, setVersion] = useState('professional')
  const [targetMarket, setTargetMarket] = useState('com')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = () => {
    setError(null)
    
    // 验证必填
    if (!productName.trim()) {
      setError('请输入产品名称')
      return
    }
    
    if (productName.length > 100) {
      setError('产品名称不能超过100字符')
      return
    }
    
    if (!benefit1.trim()) {
      setError('请至少填写1个核心卖点')
      return
    }
    
    setIsGenerating(true)
    
    const benefits = [benefit1, benefit2, benefit3, benefit4, benefit5].filter(Boolean).join('，')
    
    fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: 'test',
        productName,
        keywords: benefits,
        productFeatures: differentiation,
        tone: version,
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        setError(data.error)
      } else {
        setResult(data.result)
      }
    })
    .catch(err => setError('生成失败'))
    .finally(() => setIsGenerating(false))
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
          {/* 基本信息 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              基本信息
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  产品名称 <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="请输入产品名称，如：蓝牙耳机"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <p className="text-xs text-neutral-500 mt-1">最多100字符</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  产品类目 <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">选择亚马逊类目</option>
                  {categoryOptions.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  产品类型
                </label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="如：无线蓝牙耳机、降噪耳机"
                  maxLength={50}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* 核心卖点 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">核心卖点 <span className="text-rose-400">*</span></h3>
            <p className="text-xs text-neutral-500 mb-4">至少填写1个，建议填写3-5个</p>
            <div className="space-y-3">
              {[benefit1, benefit2, benefit3, benefit4, benefit5].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  value={i === 0 ? benefit1 : i === 1 ? benefit2 : i === 2 ? benefit3 : i === 3 ? benefit4 : benefit5}
                  onChange={(e) => {
                    if (i === 0) setBenefit1(e.target.value)
                    else if (i === 1) setBenefit2(e.target.value)
                    else if (i === 2) setBenefit3(e.target.value)
                    else if (i === 3) setBenefit4(e.target.value)
                    else setBenefit5(e.target.value)
                  }}
                  placeholder={`核心卖点${i + 1}${i === 0 ? ' *' : ''}`}
                  maxLength={50}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              ))}
            </div>
          </div>

          {/* 差异化 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">差异化优势</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  与竞品对比 <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={differentiation}
                  onChange={(e) => setDifferentiation(e.target.value)}
                  placeholder="与竞品相比，你的核心优势是什么？"
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  使用场景
                </label>
                <input
                  type="text"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="主要使用场景，如：运动、通勤"
                  maxLength={100}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {/* 生成版本 */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">生成版本</h3>
            <div className="space-y-3">
              {versionOptions.map(v => (
                <label 
                  key={v.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    version === v.value 
                      ? 'border-violet-500 bg-violet-500/10' 
                      : 'border-neutral-700 hover:border-neutral-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="version"
                    value={v.value}
                    checked={version === v.value}
                    onChange={(e) => setVersion(e.target.value)}
                    className="mt-1 accent-violet-600"
                  />
                  <div>
                    <div className="font-medium text-white">{v.label}</div>
                    <div className="text-sm text-neutral-400">{v.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? '生成中...' : '生成 Listing'}
          </button>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
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
