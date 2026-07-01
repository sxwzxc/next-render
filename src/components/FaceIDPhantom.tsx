'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 仿苹果 Face ID 解锁动画（AE 全状态幻影循环动效）
// 参考：https://xuexi.shipin520.com/article/60.html
// 超椭圆(squircle)轮廓 + 3D 翻转旋转 + 多层时间偏移幻影残影 + 辉光
// 用多层时间偏移拷贝复刻 AE 的 index 残影，配合 afterimage/bloom。
function roundedRectShape(w: number, h: number, r: number) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + h - r)
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  shape.lineTo(x + r, y + h)
  shape.quadraticCurveTo(x, y + h, x, y + h - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  return shape
}

const FaceIDPhantom = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      // 超椭圆轮廓 → 管道
      const shape = roundedRectShape(2, 2, 0.6)
      const pts2D = shape.getSpacedPoints(220)
      const curve = new THREE.CatmullRomCurve3(
        pts2D.map((p) => new THREE.Vector3(p.x, p.y, 0)),
        true
      )
      const tubeGeo = new THREE.TubeGeometry(curve, 220, 0.03, 8, true)

      // 多层时间偏移幻影拷贝（实现 AE index 式残影拖尾）
      const ghostCount = 7
      const meshes: THREE.Mesh[] = []
      const mats: THREE.MeshBasicMaterial[] = []
      for (let i = 0; i < ghostCount; i++) {
        const mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.52 - i * 0.012, 0.9, 0.6),
          transparent: true,
          opacity: 1 - i / ghostCount,
        })
        const mesh = new THREE.Mesh(tubeGeo, mat)
        group.add(mesh)
        meshes.push(mesh)
        mats.push(mat)
      }

      return {
        animate: (t) => {
          const speed = 1.1
          const delay = 0.12
          for (let i = 0; i < ghostCount; i++) {
            const phase = (t - i * delay) * speed
            // 3D 翻转旋转
            meshes[i].rotation.y = phase
            meshes[i].rotation.x = Math.sin(phase * 0.8) * 0.18
            // 侧脸时渐隐 + 呼吸
            const base = 1 - i / ghostCount
            mats[i].opacity = base * (0.6 + 0.4 * Math.abs(Math.cos(phase)))
          }
        },
        dispose: () => {
          tubeGeo.dispose()
          mats.forEach((m) => m.dispose())
        },
      }
    },
    {
      background: 0x000408,
      bloomStrength: 1.35,
      bloomRadius: 0.7,
      afterimage: 0.8,
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

export default FaceIDPhantom
