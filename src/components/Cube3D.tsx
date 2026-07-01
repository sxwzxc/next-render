'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 发光立方体：半透明核心 + 发光边线 + 反向旋转内立方体 + 顶点光点
// 环境粒子由 useThreeScene 统一提供
const Cube3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const coreGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6)
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x1b9bff,
        transparent: true,
        opacity: 0.18,
      })
      const core = new THREE.Mesh(coreGeo, coreMat)
      group.add(core)

      const edgesGeo = new THREE.EdgesGeometry(coreGeo)
      const edgesMat = new THREE.LineBasicMaterial({ color: 0x4dd2ff })
      const edges = new THREE.LineSegments(edgesGeo, edgesMat)
      group.add(edges)

      const innerGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9)
      const innerEdgesGeo = new THREE.EdgesGeometry(innerGeo)
      const innerEdgesMat = new THREE.LineBasicMaterial({ color: 0xff5fa2 })
      const innerEdges = new THREE.LineSegments(innerEdgesGeo, innerEdgesMat)
      group.add(innerEdges)

      const pointsMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
      })
      const points = new THREE.Points(edgesGeo, pointsMat)
      group.add(points)

      return {
        animate: (t) => {
          group.rotation.x = t * 0.6
          group.rotation.y = t * 0.9
          innerEdges.rotation.x = -t * 1.2
          innerEdges.rotation.z = t * 0.8
        },
        dispose: () => {
          coreGeo.dispose()
          coreMat.dispose()
          edgesGeo.dispose()
          edgesMat.dispose()
          innerEdgesGeo.dispose()
          innerEdgesMat.dispose()
          pointsMat.dispose()
        },
      }
    },
    {
      background: 0x000005,
      fov: 60,
      bloomStrength: 1.3,
      bloomRadius: 0.6,
      afterimage: 0.88,
      autoRotateSpeed: 1.5,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default Cube3D
