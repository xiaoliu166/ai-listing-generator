'use client'

import { User, Bell, Shield, Key } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">个人设置</h1>
        <p className="text-neutral-400">管理你的账户设置</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">基本信息</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">用户名</label>
              <input 
                type="text" 
                defaultValue="用户"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">邮箱</label>
              <input 
                type="email" 
                placeholder="未设置"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">手机号</label>
              <input 
                type="tel" 
                placeholder="未设置"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">通知设置</h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-neutral-300">接收邮件通知</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-violet-600" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-neutral-300">接收短信通知</span>
              <input type="checkbox" className="w-5 h-5 rounded accent-violet-600" />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">安全设置</h3>
          </div>
          <div className="space-y-4">
            <button className="flex items-center gap-3 text-neutral-300 hover:text-white">
              <Key className="w-4 h-4" />
              修改密码
            </button>
            <button className="flex items-center gap-3 text-neutral-300 hover:text-white">
              <Shield className="w-4 h-4" />
              双重认证
            </button>
          </div>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl">
          保存设置
        </button>
      </div>
    </div>
  )
}
