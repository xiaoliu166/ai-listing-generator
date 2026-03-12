'use client'

import { Search } from 'lucide-react'

export default function TranslatePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">多语言支持</h1>
        <p className="text-neutral-400">将Listing翻译成多语言版本</p>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">源语言</label>
            <select className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white">
              <option>中文</option>
              <option>英文</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">目标语言</label>
            <select className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white">
              <option>英文</option>
              <option>日语</option>
              <option>德语</option>
              <option>西班牙语</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">原文内容</label>
            <textarea 
              rows={8}
              placeholder="粘贴需要翻译的Listing内容..."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 resize-none"
            />
          </div>
          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl">
            翻译
          </button>
        </div>
        
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="text-center text-neutral-500 py-20">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>翻译结果将显示在这里</p>
          </div>
        </div>
      </div>
    </div>
  )
}
