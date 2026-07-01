'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 球体扫描：发光线框球体 + 上下扫描环 + 呼吸辉光 + 拖尾
// 环境粒子由 useThreeScene 统一提供
const SphereScan3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const sphereGeo = new THREE.SphereGeometry(1.6, 28, 18)
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x2bb8ff,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      group.add(sphere)

      const coreGeo = new THREE.IcosahedronGeometry(0.5, 1)
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x9fe8ff,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      })
      const core = new THREE.Mesh(coreGeo, coreMat)
      group.add(core)

      const ringGeo = new THREE.TorusGeometry(1.78, 0.028, 12, 96)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xbff6ff,
        transparent: true,
        opacity: 0.95,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      group.add(ring)

      return {
        animate: (t) => {
          sphere.rotation.y = t * 0.3
          sphere.rotation.x = Math.sin(t * 0.4) * 0.2
          core.rotation.x = -t * 1.0
          core.rotation.y = t * 1.3
          ring.position.y = Math.sin(t * 1.6) * 1.7
          const pulse = 0.5 + 0.5 * Math.sin(t * 1.6)
          sphereMat.opacity = 0.35 + 0.4 * pulse
          ringMat.opacity = 0.55 + 0.45 * pulse
        },
        dispose: () => {
          sphereGeo.dispose()
          sphereMat.dispose()
          coreGeo.dispose()
          coreMat.dispose()
          ringGeo.dispose()
          ringMat.dispose()
        },
      }
    },
    {
      background: 0x000208,
      bloomStrength: 1.2,
      bloomRadius: 0.7,
      afterimage: 0.78,
      autoRotateSpeed: 0.8,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default SphereScan3D
