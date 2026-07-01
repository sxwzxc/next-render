'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 螺旋星系：多旋臂粒子分布，内核暖白、外缘蓝紫，整体缓慢自转，核心呼吸辉光。
const Galaxy3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const count = 6000
      const arms = 4
      const spin = 0.9
      const radius = 3.2

      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const inner = new THREE.Color(0xffd9a0)
      const outer = new THREE.Color(0x6a5cff)

      for (let i = 0; i < count; i++) {
        const r = Math.pow(Math.random(), 0.6) * radius
        const arm = i % arms
        const angle = r * spin + (arm / arms) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
        const spread = (1 - r / radius) * 0.35 + 0.05
        positions[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * spread
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6
        positions[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * spread

        const c = inner.clone().lerp(outer, r / radius)
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const mat = new THREE.PointsMaterial({
        size: 0.04,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const pts = new THREE.Points(geo, mat)
      group.add(pts)

      const coreGeo = new THREE.SphereGeometry(0.25, 24, 16)
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffe8b0,
        transparent: true,
        opacity: 0.9,
      })
      const core = new THREE.Mesh(coreGeo, coreMat)
      group.add(core)

      return {
        animate: (t) => {
          group.rotation.y = t * 0.12
          core.scale.setScalar(1 + Math.sin(t * 1.2) * 0.08)
        },
        dispose: () => {
          geo.dispose()
          mat.dispose()
          coreGeo.dispose()
          coreMat.dispose()
        },
      }
    },
    {
      background: 0x02000a,
      bloomStrength: 1.3,
      bloomRadius: 0.7,
      afterimage: 0.75,
      autoRotate: false,
      cameraZ: 5,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default Galaxy3D
