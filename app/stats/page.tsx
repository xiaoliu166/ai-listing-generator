'use client'

import { BarChart3, TrendingUp, FileText, Search } from 'lucide-react'

const stats = [
  { label: '本月使用次数', value: '28', change: '+12%', icon: TrendingUp },
  { label: 'Listing生成', value: '15', change: '+5%', icon: FileText },
  { label: '竞品分析', value: '13', change: '+20%', icon: Search },
  { label: '节省时间', value: '5h', change: '', icon: BarChart3 },
]

const weeklyData = [
  { day: '周一', value: 5 },
  { day: '周二', value: 8 },
  { day: '周三', value: 3 },
  { day: '周四', value: 6 },
  { day: '周五', value: 4 },
  { day: '周六', value: 2 },
  { day: '周日', value: 0 },
]

export default function StatsPage() {
  const maxValue = Math.max(...weeklyData.map(d => d.value))
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">使用统计</h1>
        <p className="text-neutral-400">查看你的使用情况和趋势</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-violet-400" />
              {stat.change && (
                <span className="text-emerald-400 text-sm">{stat.change}</span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-neutral-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">本周使用趋势</h3>
        <div className="flex items-end gap-2 h-48">
          {weeklyData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-violet-600 to-indigo-600 rounded-t transition-all"
                style={{ height: `${(d.value / maxValue) * 100}%`, minHeight: d.value > 0 ? '8px' : '0' }}
              />
              <span className="text-xs text-neutral-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
