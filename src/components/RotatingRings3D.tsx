'use client'

import * as THREE from 'three'
import { useThreeScene } from './three/useThreeScene'

// 不规则旋转的圆环：多个圆环围绕各自随机轴心异步旋转，多彩 + 呼吸透明度，
// 配合 bloom 与拖尾形成错落的光弧轨迹。
const COLORS = [0xff2d75, 0x00e5ff, 0xffd400, 0x7c4dff, 0x00ff9d, 0xff7a18]

const RotatingRings3D = () => {
  const containerRef = useThreeScene(
    ({ group }) => {
      const meshes: THREE.Mesh[] = []
      const axes: THREE.Vector3[] = []
      const speeds: number[] = []

      for (let i = 0; i < 9; i++) {
        const r = 0.7 + i * 0.18 + Math.random() * 0.2
        const tube = 0.016 + Math.random() * 0.024
        const geo = new THREE.TorusGeometry(r, tube, 16, 140)
        const mat = new THREE.MeshBasicMaterial({
          color: COLORS[i % COLORS.length],
          transparent: true,
          opacity: 0.9,
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
        group.add(mesh)
        meshes.push(mesh)
        axes.push(
          new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).normalize()
        )
        speeds.push((0.3 + Math.random() * 1.0) * (Math.random() > 0.5 ? 1 : -1))
      }

      return {
        animate: (t, dt) => {
          for (let i = 0; i < meshes.length; i++) {
            meshes[i].rotateOnAxis(axes[i], speeds[i] * dt)
            const mat = meshes[i].material as THREE.MeshBasicMaterial
            mat.opacity = 0.5 + 0.4 * Math.sin(t * 1.4 + i * 0.7)
          }
        },
        dispose: () => {
          meshes.forEach((m) => {
            m.geometry.dispose()
            ;(m.material as THREE.Material).dispose()
          })
        },
      }
    },
    {
      background: 0x05000a,
      bloomStrength: 1.4,
      bloomRadius: 0.7,
      afterimage: 0.86,
      autoRotateSpeed: 0.6,
    }
  )

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default RotatingRings3D
