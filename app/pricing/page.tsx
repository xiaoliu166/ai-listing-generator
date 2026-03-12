'use client'

import { Check } from 'lucide-react'

const plans = [
  {
    name: '免费版',
    price: '¥0',
    period: '永久',
    description: '适合体验和轻度使用',
    features: [
      '每天1次竞品分析',
      '每天3次Listing生成',
      '英语支持',
      '基础历史记录',
    ],
    notFeatures: [
      '多语言支持',
      '数据导出',
      '客服支持',
    ],
    cta: '当前套餐',
    popular: false,
  },
  {
    name: '个人版',
    price: '¥49',
    period: '/月',
    description: '适合个人卖家',
    features: [
      '无限次竞品分析',
      '无限次Listing生成',
      '多语言支持',
      '完整历史记录',
      '数据导出',
      '优先客服',
    ],
    notFeatures: [],
    cta: '立即订阅',
    popular: true,
  },
  {
    name: '团队版',
    price: '¥149',
    period: '/月',
    description: '适合团队协作',
    features: [
      '5人协作',
      '无限次使用',
      '多语言支持',
      '团队管理后台',
      'API接入',
      '专属客服',
    ],
    notFeatures: [],
    cta: '立即订阅',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="p-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">套餐定价</h1>
        <p className="text-neutral-400">选择适合你的套餐</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <div 
            key={i}
            className={`relative p-6 rounded-2xl border ${
              plan.popular 
                ? 'bg-gradient-to-b from-violet-600/20 to-indigo-600/20 border-violet-500/50' 
                : 'bg-neutral-900 border-neutral-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
                最受欢迎
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-neutral-400">{plan.period}</span>
            </div>
            <p className="text-neutral-400 text-sm mb-6">{plan.description}</p>
            
            <ul className="space-y-3 mb-8">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-neutral-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {f}
                </li>
              ))}
              {plan.notFeatures.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-neutral-600">
                  <Check className="w-4 h-4" />
                  {f}
                </li>
              ))}
            </ul>
            
            <button className={`w-full py-3 rounded-xl font-medium transition-colors ${
              plan.popular
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
