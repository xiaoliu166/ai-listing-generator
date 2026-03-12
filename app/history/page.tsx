'use client'

import { History, FileText, Search, Trash2 } from 'lucide-react'

const historyData = [
  { id: 1, type: 'listing', name: 'Wireless Earbuds', date: '2026-03-12 15:30', status: '已完成' },
  { id: 2, type: 'analyze', name: 'B08N5WRWNW', date: '2026-03-12 14:20', status: '已完成' },
  { id: 3, type: 'listing', name: 'Phone Case', date: '2026-03-11 10:15', status: '已完成' },
  { id: 4, type: 'analyze', name: 'B09V3KXJPB', date: '2026-03-11 09:00', status: '已完成' },
]

export default function HistoryPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">历史记录</h1>
        <p className="text-neutral-400">查看和管理你的历史生成记录</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase">类型</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase">名称</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase">时间</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase">状态</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-neutral-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {historyData.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-800/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {item.type === 'listing' ? (
                      <FileText className="w-4 h-4 text-violet-400" />
                    ) : (
                      <Search className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-neutral-300">{item.type === 'listing' ? 'Listing生成' : '竞品分析'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">{item.name}</td>
                <td className="px-6 py-4 text-neutral-400">{item.date}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs">{item.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
