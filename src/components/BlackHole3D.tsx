'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 黑洞：吸积盘粒子环绕中心旋转坠落，外圈快内圈渐隐，中心强辉光
const BlackHole3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const count = 5000
      const innerR = 0.8
      const outerR = 3.6
      const geo = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const angles: number[] = []
      const radii: number[] = []
      const speeds: number[] = []
      const yOff: number[] = []

      const hot = new THREE.Color(0xffd27a)
      const cool = new THREE.Color(0x6a3cff)

      for (let i = 0; i < count; i++) {
        const r = innerR + Math.pow(Math.random(), 1.5) * (outerR - innerR)
        const a = Math.random() * Math.PI * 2
        radii.push(r)
        angles.push(a)
        // 内圈快、外圈慢
        speeds.push((1.6 - r * 0.3) * (1 + Math.random() * 0.3))
        const y = (Math.random() - 0.5) * 0.12 * (r / outerR)
        yOff.push(y)
        positions[i * 3] = Math.cos(a) * r
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = Math.sin(a) * r
        const c = cool.clone().lerp(hot, 1 - (r - innerR) / (outerR - innerR))
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
      }
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const mat = new THREE.PointsMaterial({
        size: 0.045,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const pts = new THREE.Points(geo, mat)
      group.add(pts)

      // 中心事件视界（黑球 + 强辉光外晕）
      const coreGeo = new THREE.SphereGeometry(innerR * 0.9, 32, 24)
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const core = new THREE.Mesh(coreGeo, coreMat)
      group.add(core)

      const haloGeo = new THREE.SphereGeometry(innerR * 0.95, 32, 24)
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffb347,
        transparent: true,
        opacity: 0.5,
      })
      const halo = new THREE.Mesh(haloGeo, haloMat)
      group.add(halo)

      return {
        animate: (t, dt) => {
          const p = geo.attributes.position as THREE.BufferAttribute
          for (let i = 0; i < count; i++) {
            angles[i] += speeds[i] * dt
            const r = radii[i]
            p.setX(i, Math.cos(angles[i]) * r)
            p.setZ(i, Math.sin(angles[i]) * r)
            p.setY(i, yOff[i] + Math.sin(t * 2 + i) * 0.01)
          }
          p.needsUpdate = true
          halo.scale.setScalar(1 + Math.sin(t * 1.5) * 0.06)
          haloMat.opacity = 0.4 + 0.2 * Math.sin(t * 1.5)
        },
        dispose: () => {
          geo.dispose()
          mat.dispose()
          coreGeo.dispose()
          coreMat.dispose()
          haloGeo.dispose()
          haloMat.dispose()
        },
      }
    },
    {
      background: 0x020006,
      bloomStrength: 1.5,
      bloomRadius: 0.7,
      afterimage: 0.78,
      autoRotateSpeed: 0.5,
      cameraZ: 6,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default BlackHole3D
