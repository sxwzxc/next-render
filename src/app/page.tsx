'use client'

import { useState } from 'react'
import { PageLayout } from '@/components/layout'
import Cube3D from '@/components/Cube3D'
import SphereScan3D from '@/components/SphereScan3D'
import FaceID from '@/components/FaceID'
import RotatingRings3D from '@/components/RotatingRings3D'
import OrbitParticles3D from '@/components/OrbitParticles3D'
import Galaxy3D from '@/components/Galaxy3D'
import { cn } from '@/lib/utils'

const animations = [
  {
    id: 'cube',
    label: '发光立方体',
    desc: '旋转的发光立方体 + 拖尾',
    Component: Cube3D,
  },
  {
    id: 'sphere-scan',
    label: '球体扫描',
    desc: '线框球体 + 上下扫描环',
    Component: SphereScan3D,
  },
  {
    id: 'faceid',
    label: 'Face ID 扫描',
    desc: '纯 CSS 仿苹果 FaceID 加载动画',
    Component: FaceID,
  },
  {
    id: 'rings',
    label: '不规则旋转圆环',
    desc: '多圆环绕随机轴异步旋转 + 光弧拖尾',
    Component: RotatingRings3D,
  },
  {
    id: 'orbit-particles',
    label: '绕圈旋转粒子',
    desc: '多条倾角轨道粒子流光环',
    Component: OrbitParticles3D,
  },
  {
    id: 'galaxy',
    label: '螺旋星系',
    desc: '多旋臂粒子星系 + 核心辉光',
    Component: Galaxy3D,
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
