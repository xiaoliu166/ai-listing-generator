'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Sparkles, 
  Search, 
  FileText, 
  Languages, 
  History, 
  User,
  Settings,
  ChevronDown,
  LogOut,
  CreditCard,
  BarChart3,
  LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    title: '工作台',
    items: [
      { name: '首页', href: '/', icon: LayoutDashboard },
      { name: '竞品分析', href: '/analyze', icon: Search },
      { name: 'Listing生成', href: '/generate', icon: FileText },
      { name: '多语言', href: '/translate', icon: Languages },
    ]
  },
  {
    title: '数据',
    items: [
      { name: '历史记录', href: '/history', icon: History },
      { name: '使用统计', href: '/stats', icon: BarChart3 },
    ]
  },
  {
    title: '账户',
    items: [
      { name: '我的套餐', href: '/pricing', icon: CreditCard },
      { name: '个人设置', href: '/settings', icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen w-64 bg-neutral-900 border-r border-neutral-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-800">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-600/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">AI Listing</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navigation.map((group, groupIndex) => (
          <div key={group.title} className={cn(groupIndex > 0 && "mt-6")}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive 
                          ? "bg-violet-600/15 text-violet-400" 
                          : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "text-violet-400")} />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">用户</p>
            <p className="text-xs text-neutral-500">免费版</p>
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        </div>
      </div>
    </div>
  )
}
