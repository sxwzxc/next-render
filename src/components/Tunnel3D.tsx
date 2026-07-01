'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 隧道飞行：粒子沿圆环排布成隧道，相机向前推进产生穿梭感，霓虹拖尾
const Tunnel3D = () => {
  const containerRef = useThreeScene(
    ({ group, controls }) => {
      const rings = 60
      const perRing = 40
      const radius = 1.6
      const length = 40
      const count = rings * perRing
      const geo = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const c1 = new THREE.Color(0x00f5d4)
      const c2 = new THREE.Color(0xff2e9a)

      const offsets: number[] = []
      let idx = 0
      for (let r = 0; r < rings; r++) {
        for (let p = 0; p < perRing; p++) {
          const a = (p / perRing) * Math.PI * 2
          const z = (r / rings) * length
          offsets.push(a)
          positions[idx * 3] = Math.cos(a) * radius
          positions[idx * 3 + 1] = Math.sin(a) * radius
          positions[idx * 3 + 2] = -z
          const c = c1.clone().lerp(c2, r / rings)
          colors[idx * 3] = c.r
          colors[idx * 3 + 1] = c.g
          colors[idx * 3 + 2] = c.b
          idx++
        }
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const mat = new THREE.PointsMaterial({
        size: 0.08,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const pts = new THREE.Points(geo, mat)
      group.add(pts)

      // 关闭自动旋转，改为相机穿梭
      controls.autoRotate = false
      controls.target.set(0, 0, -length)

      const pos = geo.attributes.position as THREE.BufferAttribute

      return {
        animate: (t) => {
          // 粒子整体向相机推进，到末端后循环回远端
          for (let i = 0; i < count; i++) {
            const a = offsets[i]
            let z = pos.getZ(i) + 0.18
            if (z > 2) z -= length
            pos.setZ(i, z)
            // 隧道轻微呼吸扩张
            const r = radius + Math.sin(t * 1.5 + z * 0.3) * 0.06
            pos.setX(i, Math.cos(a) * r)
            pos.setY(i, Math.sin(a) * r)
          }
          pos.needsUpdate = true
        },
        dispose: () => {
          geo.dispose()
          mat.dispose()
        },
      }
    },
    {
      background: 0x02000a,
      bloomStrength: 1.4,
      bloomRadius: 0.7,
      afterimage: 0.85,
      autoRotate: false,
      cameraZ: 2,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default Tunnel3D
