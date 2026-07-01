'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

// 通用 Three.js 场景上下文：scene/camera/renderer/composer/group/controls/postprocessing
export type ThreeSceneCtx = {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  composer: EffectComposer
  group: THREE.Group
  controls: OrbitControls
  bloomPass: UnrealBloomPass
  afterimagePass: AfterimagePass
  width: number
  height: number
}

export type ThreeSceneSetup = (ctx: ThreeSceneCtx) => {
  // 每帧调用，传入累计时间 t（秒）与帧间隔 dt（秒）
  animate?: (t: number, dt: number) => void
  // 卸载时调用，用于释放自建 geometry/material
  dispose?: () => void
}

export type ThreeSceneOptions = {
  background?: number
  cameraZ?: number
  fov?: number
  autoRotate?: boolean
  autoRotateSpeed?: number
  bloomStrength?: number
  bloomRadius?: number
  afterimage?: number
  // 是否添加零散环境粒子（默认 true），所有场景共享同一套科技感粒子背景
  ambientParticles?: boolean
  particleColor?: number
  particleCount?: number
}

// 创建一个自管理的 Three.js 画布，返回挂载到组件的 container ref。
// 调用方只需关注自建场景内容与逐帧动画，通用资源（scene/camera/renderer/
// composer/bloom/afterimage/controls/resize/cleanup）由本 hook 负责。
export function useThreeScene(setup: ThreeSceneSetup, options: ThreeSceneOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setupRef = useRef(setup)
  setupRef.current = setup
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const opt = optionsRef.current

    const width = container.clientWidth
    const height = Math.max(container.clientHeight, 1)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(opt.background ?? 0x000005)

    const camera = new THREE.PerspectiveCamera(opt.fov ?? 55, width / height, 0.1, 1000)
    camera.position.set(0, 0, opt.cameraZ ?? 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 14
    controls.autoRotate = opt.autoRotate ?? true
    controls.autoRotateSpeed = opt.autoRotateSpeed ?? 0.8

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const afterimagePass = new AfterimagePass(opt.afterimage ?? 0.8)
    composer.addPass(afterimagePass)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      opt.bloomStrength ?? 1.2,
      opt.bloomRadius ?? 0.6,
      0.0
    )
    composer.addPass(bloomPass)

    // 环境零散粒子：球形壳分布 + 加色叠加 + 缓慢自转，所有场景共享科技感背景
    let particles: THREE.Points | null = null
    let pGeo: THREE.BufferGeometry | null = null
    let pMat: THREE.PointsMaterial | null = null
    if (opt.ambientParticles !== false) {
      const pCount = opt.particleCount ?? 450
      pGeo = new THREE.BufferGeometry()
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
      pMat = new THREE.PointsMaterial({
        color: opt.particleColor ?? 0x66ddff,
        size: 0.04,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      particles = new THREE.Points(pGeo, pMat)
      scene.add(particles)
    }

    const clock = new THREE.Clock()
    const result = setupRef.current({
      scene,
      camera,
      renderer,
      composer,
      group,
      controls,
      bloomPass,
      afterimagePass,
      width,
      height,
    })

    let elapsed = 0
    let frameId = 0
    const loop = () => {
      frameId = requestAnimationFrame(loop)
      const dt = clock.getDelta()
      elapsed += dt
      if (particles) particles.rotation.y = elapsed * 0.04
      result.animate?.(elapsed, dt)
      controls.update()
      composer.render()
    }
    loop()

    const handleResize = () => {
      const w = container.clientWidth
      const h = Math.max(container.clientHeight, 1)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
      bloomPass.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)
    // 监听容器自身尺寸变化（如侧边栏收起），保证画布跟随
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      resizeObserver.disconnect()
      result.dispose?.()
      pGeo?.dispose()
      pMat?.dispose()
      controls.dispose()
      bloomPass.dispose()
      afterimagePass.dispose()
      composer.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return containerRef
}
