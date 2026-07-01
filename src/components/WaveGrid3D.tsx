'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 波浪网格地形：平面网格按多频正弦波动起伏，线框 + 渐变色，模拟数字海面
const WaveGrid3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const size = 8
      const seg = 48
      const geo = new THREE.PlaneGeometry(size, size, seg, seg)
      geo.rotateX(-Math.PI / 2.2)

      // 顶点色渐变（按高度着色）
      const colors = new Float32Array(geo.attributes.position.count * 3)
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const low = new THREE.Color(0x1b6bff)
      const high = new THREE.Color(0x00f0ff)

      const mat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
      })
      const mesh = new THREE.Mesh(geo, mat)
      group.add(mesh)

      const pos = geo.attributes.position

      return {
        animate: (t) => {
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i)
            const z = pos.getZ(i)
            const y =
              Math.sin(x * 0.8 + t) * 0.4 +
              Math.cos(z * 0.9 + t * 1.2) * 0.4 +
              Math.sin((x + z) * 0.5 + t * 0.7) * 0.25
            pos.setY(i, y)
            const k = THREE.MathUtils.clamp((y + 1) / 2, 0, 1)
            const c = low.clone().lerp(high, k)
            colors[i * 3] = c.r
            colors[i * 3 + 1] = c.g
            colors[i * 3 + 2] = c.b
          }
          pos.needsUpdate = true
          ;(geo.attributes.color as THREE.BufferAttribute).needsUpdate = true
        },
        dispose: () => {
          geo.dispose()
          mat.dispose()
        },
      }
    },
    {
      background: 0x01030a,
      bloomStrength: 1.2,
      bloomRadius: 0.6,
      afterimage: 0.7,
      autoRotateSpeed: 0.4,
      cameraZ: 7,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default WaveGrid3D
