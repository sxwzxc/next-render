'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/layout'
import Cube3D from '@/components/Cube3D'
import FaceID3D from '@/components/FaceID3D'
import { cn } from '@/lib/utils'

const animations = [
  {
    id: 'cube',
    label: '发光立方体',
    desc: '旋转的发光立方体 + 拖尾',
    Component: Cube3D,
  },
  {
    id: 'faceid',
    label: 'Face ID 解锁',
    desc: '模拟 iPhone 人脸解锁扫描',
    Component: FaceID3D,
  },
]

export default function Home() {
  const [activeId, setActiveId] = useState(animations[0].id)
  const active = animations.find((a) => a.id === activeId)!
  const ActiveComponent = active.Component

  return (
    <PageLayout>
      <div className="flex h-[calc(100vh-4.5rem)]">
        <aside className="w-60 shrink-0 border-r border-gray-800 bg-gray-900/40 p-4 overflow-y-auto">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">
            3D 动画
          </h2>
          <ul className="space-y-2">
            {animations.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => setActiveId(a.id)}
                  className={cn(
                    'w-full text-left px-3 py-3 rounded-lg transition-colors cursor-pointer',
                    a.id === activeId
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  )}
                >
                  <div className="text-sm font-medium">{a.label}</div>
                  <div
                    className={cn(
                      'text-xs mt-1',
                      a.id === activeId ? 'text-blue-100' : 'text-gray-500'
                    )}
                  >
                    {a.desc}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 relative min-w-0">
          <ActiveComponent key={active.id} />
        </main>
      </div>
    </PageLayout>
  )
}
