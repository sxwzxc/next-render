'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 绕圈旋转的粒子：多条倾角各异的轨道，粒子沿轨道旋转，内圈快、外圈慢，
// 加色叠加 + 拖尾形成流光环带。
const OrbitParticles3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const orbits: THREE.Group[] = []
      const speeds: number[] = []
      const geos: THREE.BufferGeometry[] = []
      const mats: THREE.PointsMaterial[] = []

      const orbitCount = 8
      for (let o = 0; o < orbitCount; o++) {
        const r = 1.0 + o * 0.26
        const count = 70 + o * 8
        const geo = new THREE.BufferGeometry()
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + Math.random() * 0.12
          positions[i * 3] = Math.cos(a) * r
          positions[i * 3 + 1] = Math.sin(a) * r
          positions[i * 3 + 2] = 0
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const color = new THREE.Color().setHSL(0.52 + o * 0.045, 0.95, 0.6)
        const mat = new THREE.PointsMaterial({
          color,
          size: 0.06,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const pts = new THREE.Points(geo, mat)

        const orbit = new THREE.Group()
        orbit.add(pts)
        orbit.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        group.add(orbit)

        orbits.push(orbit)
        speeds.push((0.9 - o * 0.08) * (Math.random() > 0.5 ? 1 : -1))
        geos.push(geo)
        mats.push(mat)
      }

      return {
        animate: (_t, dt) => {
          for (let i = 0; i < orbits.length; i++) {
            orbits[i].rotation.z += speeds[i] * dt
          }
        },
        dispose: () => {
          geos.forEach((g) => g.dispose())
          mats.forEach((m) => m.dispose())
        },
      }
    },
    {
      background: 0x000510,
      bloomStrength: 1.3,
      bloomRadius: 0.7,
      afterimage: 0.82,
      autoRotateSpeed: 0.5,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default OrbitParticles3D
