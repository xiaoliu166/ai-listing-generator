'use client'

import { useState } from 'react'
import { 
  Sparkles, 
  Search, 
  FileText, 
  Languages, 
  TrendingUp,
  ArrowRight,
  Zap,
  Shield,
  Users,
  CheckCircle2,
  Star
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Search,
    title: '竞品分析',
    description: '输入ASIN一键分析竞品Listing、评论和卖点',
    href: '/analyze',
    color: 'from-violet-600 to-purple-600'
  },
  {
    icon: FileText,
    title: 'Listing生成',
    description: 'AI智能生成标题、五点、描述和搜索词',
    href: '/generate',
    color: 'from-blue-600 to-cyan-600'
  },
  {
    icon: Languages,
    title: '多语言支持',
    description: '支持英语、日语、德语、西班牙语',
    href: '/translate',
    color: 'from-emerald-600 to-teal-600'
  },
  {
    icon: TrendingUp,
    title: '数据沉淀',
    description: '历史记录和数据分析，帮你持续优化',
    href: '/history',
    color: 'from-orange-600 to-amber-600'
  }
]

const stats = [
  { value: '50+', label: '亚马逊卖家' },
  { value: '1000+', label: '生成次数' },
  { value: '98%', label: '满意度' },
  { value: '¥49', label: '起/月' }
]

const testimonials = [
  {
    name: '张老板',
    role: '亚马逊卖家',
    content: '用了AI Listing，效率提升太多了！以前要写一下午，现在10分钟搞定。',
    rating: 5
  },
  {
    name: '李运营',
    role: '精品运营',
    content: '竞品分析功能太香了，直接看到对手的卖点分析，省了很多调研时间。',
    rating: 5
  },
  {
    name: '王总',
    role: '跨境电商老板',
    content: '价格便宜效果好，比那些 ¥99/月的工具值多了！',
    rating: 5
  }
]

export default function Home() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-neutral-950 to-neutral-950" />
        
        <div className="container mx-auto px-8 py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-8">
              <Zap className="w-4 h-4" />
              <span>亚马逊卖家的Listing神器</span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-violet-200 to-indigo-300 bg-clip-text text-transparent">
              智能生成高质量Listing
            </h1>
            
            <p className="text-xl text-neutral-400 mb-10 leading-relaxed">
              基于AI和Mango方法论，帮助亚马逊中小卖家快速生成优化的商品页面
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link 
                href="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-violet-600/25"
              >
                免费试用
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors border border-neutral-700"
              >
                查看定价
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-neutral-800 bg-neutral-900/30">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">核心功能</h2>
            <p className="text-neutral-400">一站式解决Listing创作所有需求</p>
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <Link
                key={i}
                href={feature.href}
                className="group p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-neutral-900/30">
        <div className="container mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">用户评价</h2>
            <p className="text-neutral-400">来自真实用户的使用反馈</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-300 mb-4">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.name}</p>
                    <p className="text-neutral-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 p-12 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">开始免费试用</h2>
              <p className="text-violet-100 mb-8 max-w-xl mx-auto">
                每天免费生成1次，验证效果后再决定是否付费
              </p>
              <Link 
                href="/generate"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-semibold rounded-xl hover:bg-violet-50 transition-colors"
              >
                立即开始
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')]" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-neutral-800">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-neutral-400">© 2026 AI Listing</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <a href="#" className="hover:text-white transition-colors">隐私政策</a>
              <a href="#" className="hover:text-white transition-colors">服务条款</a>
              <a href="#" className="hover:text-white transition-colors">联系我们</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
