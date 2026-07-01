'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

// 仿 iPhone 灵动岛 Face ID 人脸扫描动画：
// 展开的灵动岛药丸框 + 线框人脸 + 上下扫过的扫描光带 + 扫描完成时的填充辉光
const FaceID3D = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    // --- 灵动岛药丸框（展开态）---
    const islandGeo = new RoundedBoxGeometry(4.6, 2.3, 0.3, 8, 1.15)
    const islandMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.9,
    })
    const island = new THREE.Mesh(islandGeo, islandMat)
    island.position.z = -1.2
    group.add(island)

    // 药丸框边缘微光
    const islandEdgesGeo = new THREE.EdgesGeometry(islandGeo, 30)
    const islandEdgesMat = new THREE.LineBasicMaterial({
      color: 0x1a2a38,
      transparent: true,
      opacity: 0.8,
    })
    const islandEdges = new THREE.LineSegments(islandEdgesGeo, islandEdgesMat)
    islandEdges.position.z = -1.2
    group.add(islandEdges)

    // --- 人脸线框 ---
    const faceGeo = new THREE.SphereGeometry(1, 40, 28)
    const faceWireMat = new THREE.MeshBasicMaterial({
      color: 0xdffbff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    })
    const faceWire = new THREE.Mesh(faceGeo, faceWireMat)
    faceWire.scale.set(0.82, 1.18, 0.72)
    group.add(faceWire)

    // 人脸填充层（扫描完成时亮起）
    const faceFillMat = new THREE.MeshBasicMaterial({
      color: 0x9fe8ff,
      transparent: true,
      opacity: 0,
    })
    const faceFill = new THREE.Mesh(faceGeo, faceFillMat)
    faceFill.scale.copy(faceWire.scale)
    group.add(faceFill)

    // --- 扫描光带（水平横条，纵向扫过人脸）---
    const barGeo = new THREE.BoxGeometry(2.2, 0.035, 0.08)
    const barMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    })
    const bar = new THREE.Mesh(barGeo, barMat)
    group.add(bar)

    // 光带辉晕
    const haloGeo = new THREE.BoxGeometry(2.3, 0.16, 0.08)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x6fe0ff,
      transparent: true,
      opacity: 0.35,
    })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    group.add(halo)

    // --- 环境粒子 ---
    const pCount = 260
    const pGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const r = 3 + Math.random() * 4
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat = new THREE.PointsMaterial({
      color: 0x4cc8ff,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // 拖拽旋转
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 12
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6

    // 后处理：辉光 + 拖尾
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const afterimagePass = new AfterimagePass(0.7)
    composer.addPass(afterimagePass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.1, // strength
      0.7, // radius
      0.0 // threshold
    )
    composer.addPass(bloomPass)

    // 动画循环
    const clock = new THREE.Clock()
    let frameId = 0
    const TOP = 1.35
    const BOTTOM = -1.35

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // 扫描周期：70% 时间向下扫描并填充，30% 时间回到顶部并淡出
      const period = 2.6
      const phase = (t % period) / period
      let scanY: number
      let fill: number
      if (phase < 0.7) {
        const p = phase / 0.7 // 0..1 向下
        scanY = TOP - p * (TOP - BOTTOM)
        fill = p
      } else {
        const p = (phase - 0.7) / 0.3 // 0..1 回顶
        scanY = BOTTOM + p * (TOP - BOTTOM)
        fill = 1 - p
      }

      bar.position.y = scanY
      halo.position.y = scanY

      // 人脸填充随扫描进度亮起
      faceFillMat.opacity = fill * 0.28
      // 线框在扫描完成时更亮
      faceWireMat.opacity = 0.35 + fill * 0.35
      // 扫描带在人脸范围内更亮
      const inFace = scanY < TOP && scanY > BOTTOM ? 1 : 0.3
      barMat.opacity = 0.5 + inFace * 0.5
      haloMat.opacity = 0.2 + inFace * 0.3

      // 灵动岛随扫描轻微展开/收起
      const expand = 1 + fill * 0.06
      island.scale.x = expand
      islandEdges.scale.x = expand

      // 人脸缓慢自转
      faceWire.rotation.y = t * 0.25
      faceFill.rotation.y = t * 0.25

      particles.rotation.y = t * 0.04

      controls.update()
      composer.render()
    }
    animate()

    const handleResize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
      bloomPass.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      islandGeo.dispose()
      islandMat.dispose()
      islandEdgesGeo.dispose()
      islandEdgesMat.dispose()
      faceGeo.dispose()
      faceWireMat.dispose()
      faceFillMat.dispose()
      barGeo.dispose()
      barMat.dispose()
      haloGeo.dispose()
      haloMat.dispose()
      pGeo.dispose()
      pMat.dispose()
      bloomPass.dispose()
      afterimagePass.dispose()
      composer.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[520px] cursor-grab active:cursor-grabbing"
    />
  )
}

export default FaceID3D
