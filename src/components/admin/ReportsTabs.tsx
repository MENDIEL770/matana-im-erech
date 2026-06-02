'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface ReportsTabsProps {
  tabs: Tab[]
}

export default function ReportsTabs({ tabs }: ReportsTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id)

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#0F2747] text-[#0F2747]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabs.map((tab) => (
        <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
          {tab.content}
        </div>
      ))}
    </div>
  )
}
