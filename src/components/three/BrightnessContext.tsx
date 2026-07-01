'use client'

import { createContext, useContext, useState, useMemo } from 'react'

// 全局亮度上下文：滑块调节倍率（0~2），Three.js 场景读取后乘以自身 bloom 基础强度。
// 纯 CSS 场景也可读取该值映射到 filter brightness。
type BrightnessCtx = {
  multiplier: number
  setMultiplier: (v: number) => void
}

const Ctx = createContext<BrightnessCtx>({
  multiplier: 1,
  setMultiplier: () => {},
})

export function useBrightness() {
  return useContext(Ctx)
}

export function BrightnessProvider({ children }: { children: React.ReactNode }) {
  const [multiplier, setMultiplier] = useState(1)
  const value = useMemo(() => ({ multiplier, setMultiplier }), [multiplier])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
