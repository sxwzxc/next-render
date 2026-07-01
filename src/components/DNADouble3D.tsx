'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 双螺旋 DNA：两条螺旋粒子链 + 横档连接，整体旋转，青/品红双色
const DNADouble3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const points = 140
      const radius = 1.1
      const height = 7
      const turns = 4

      const posA = new Float32Array(points * 3)
      const posB = new Float32Array(points * 3)
      const colA = new Float32Array(points * 3)
      const colB = new Float32Array(points * 3)
      const cyan = new THREE.Color(0x00e5ff)
      const magenta = new THREE.Color(0xff3df0)

      // 横档连接线
      const rungPositions: number[] = []
      const rungColors: number[] = []
      const rungGeo = new THREE.BufferGeometry()
      const rungMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
      })

      for (let i = 0; i < points; i++) {
        const t = i / (points - 1)
        const angle = t * turns * Math.PI * 2
        const y = (t - 0.5) * height
        posA[i * 3] = Math.cos(angle) * radius
        posA[i * 3 + 1] = y
        posA[i * 3 + 2] = Math.sin(angle) * radius
        posB[i * 3] = Math.cos(angle + Math.PI) * radius
        posB[i * 3 + 1] = y
        posB[i * 3 + 2] = Math.sin(angle + Math.PI) * radius
        colA[i * 3] = cyan.r
        colA[i * 3 + 1] = cyan.g
        colA[i * 3 + 2] = cyan.b
        colB[i * 3] = magenta.r
        colB[i * 3 + 1] = magenta.g
        colB[i * 3 + 2] = magenta.b

        // 每隔几个点加一根横档
        if (i % 5 === 0) {
          rungPositions.push(posA[i * 3], y, posA[i * 3 + 2], posB[i * 3], y, posB[i * 3 + 2])
          rungColors.push(cyan.r, cyan.g, cyan.b, magenta.r, magenta.g, magenta.b)
        }
      }

      const geoA = new THREE.BufferGeometry()
      geoA.setAttribute('position', new THREE.BufferAttribute(posA, 3))
      geoA.setAttribute('color', new THREE.BufferAttribute(colA, 3))
      const matA = new THREE.PointsMaterial({
        size: 0.13,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const strandA = new THREE.Points(geoA, matA)
      group.add(strandA)

      const geoB = new THREE.BufferGeometry()
      geoB.setAttribute('position', new THREE.BufferAttribute(posB, 3))
      geoB.setAttribute('color', new THREE.BufferAttribute(colB, 3))
      const matB = new THREE.PointsMaterial({
        size: 0.13,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const strandB = new THREE.Points(geoB, matB)
      group.add(strandB)

      rungGeo.setAttribute('position', new THREE.Float32BufferAttribute(rungPositions, 3))
      rungGeo.setAttribute('color', new THREE.Float32BufferAttribute(rungColors, 3))
      const rungs = new THREE.LineSegments(rungGeo, rungMat)
      group.add(rungs)

      return {
        animate: (t) => {
          group.rotation.y = t * 0.4
        },
        dispose: () => {
          geoA.dispose()
          matA.dispose()
          geoB.dispose()
          matB.dispose()
          rungGeo.dispose()
          rungMat.dispose()
        },
      }
    },
    {
      background: 0x03000a,
      bloomStrength: 1.3,
      bloomRadius: 0.6,
      afterimage: 0.78,
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

export default DNADouble3D
