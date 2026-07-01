'use client'

import { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen, Sun } from 'lucide-react'
import Cube3D from '@/components/Cube3D'
import SphereScan3D from '@/components/SphereScan3D'
import FaceID from '@/components/FaceID'
import FaceIDPhantom from '@/components/FaceIDPhantom'
import RotatingRings3D from '@/components/RotatingRings3D'
import OrbitParticles3D from '@/components/OrbitParticles3D'
import Galaxy3D from '@/components/Galaxy3D'
import WaveGrid3D from '@/components/WaveGrid3D'
import BlackHole3D from '@/components/BlackHole3D'
import DNADouble3D from '@/components/DNADouble3D'
import Tunnel3D from '@/components/Tunnel3D'
import { BrightnessProvider, useBrightness } from '@/components/three/BrightnessContext'
import { cn } from '@/lib/utils'

const animations = [
  { id: 'cube', label: '发光立方体', desc: '旋转的发光立方体 + 拖尾', Component: Cube3D },
  { id: 'sphere-scan', label: '球体扫描', desc: '线框球体 + 上下扫描环', Component: SphereScan3D },
  { id: 'faceid', label: 'Face ID 扫描', desc: '纯 CSS 仿苹果 FaceID', Component: FaceID },
  { id: 'faceid-phantom', label: 'Face ID 幻影', desc: 'AE 风格 squircle 翻转 + 残影', Component: FaceIDPhantom },
  { id: 'rings', label: '不规则旋转圆环', desc: '多圆环绕随机轴异步旋转', Component: RotatingRings3D },
  { id: 'orbit-particles', label: '绕圈旋转粒子', desc: '多条倾角轨道粒子流光环', Component: OrbitParticles3D },
  { id: 'galaxy', label: '螺旋星系', desc: '多旋臂粒子星系 + 核心辉光', Component: Galaxy3D },
  { id: 'wave-grid', label: '波浪网格', desc: '多频正弦起伏数字海面', Component: WaveGrid3D },
  { id: 'blackhole', label: '黑洞', desc: '吸积盘粒子环绕坠落', Component: BlackHole3D },
  { id: 'dna', label: '双螺旋 DNA', desc: '双链粒子 + 横档连接', Component: DNADouble3D },
  { id: 'tunnel', label: '隧道穿梭', desc: '霓虹粒子隧道飞行穿梭', Component: Tunnel3D },
]

function BrightnessSlider() {
  const { multiplier, setMultiplier } = useBrightness()
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 backdrop-blur-sm">
      <Sun className="w-4 h-4 text-amber-300 shrink-0" />
      <input
        type="range"
        min={0}
        max={2}
        step={0.05}
        value={multiplier}
        onChange={(e) => setMultiplier(parseFloat(e.target.value))}
        className="brightness-slider w-28"
        aria-label="亮度"
      />
      <span className="text-xs text-gray-300 tabular-nums w-8 text-right">
        {Math.round(multiplier * 100)}%
      </span>
    </div>
  )
}

function HomeContent() {
  const [activeId, setActiveId] = useState(animations[0].id)
  const [collapsed, setCollapsed] = useState(false)
  const active = animations.find((a) => a.id === activeId)!
  const ActiveComponent = active.Component

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <aside
        className={cn(
          'custom-scroll shrink-0 border-r border-gray-800 bg-gray-900/40 overflow-y-auto transition-all duration-300',
          collapsed ? 'w-0 p-0 border-r-0' : 'w-60 p-4'
        )}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4 whitespace-nowrap">
          3D 动画
        </h2>
        <ul className="space-y-2">
          {animations.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => setActiveId(a.id)}
                className={cn(
                  'w-full text-left px-3 py-3 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                  a.id === activeId
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                <div className="text-sm font-medium">{a.label}</div>
                <div
                  className={cn(
                    'text-xs mt-1 whitespace-normal',
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
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="p-2 rounded-lg bg-gray-900/60 border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
            aria-label={collapsed ? '展开列表' : '收起列表'}
            title={collapsed ? '展开列表' : '收起列表'}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
          <BrightnessSlider />
        </div>
        <ActiveComponent key={active.id} />
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <BrightnessProvider>
      <HomeContent />
    </BrightnessProvider>
  )
}
