'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

// Simulates an iPhone Face ID scanning / unlock animation:
// a glowing wireframe "face" mesh + a sweeping scan ring + pulse glow.
const FaceID3D = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000208)

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)

    // Wireframe "face" scan mesh (the iconic Face ID globe)
    const sphereGeo = new THREE.SphereGeometry(1.6, 28, 18)
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x2bb8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    group.add(sphere)

    // Inner counter-rotating wireframe core
    const coreGeo = new THREE.IcosahedronGeometry(0.5, 1)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x9fe8ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    group.add(core)

    // Sweeping scan ring (the unlock scan line)
    const ringGeo = new THREE.TorusGeometry(1.78, 0.028, 12, 96)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xbff6ff,
      transparent: true,
      opacity: 0.95,
    })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    group.add(ring)

    // Ambient particles
    const pCount = 450
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
      color: 0x66ddff,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // Controls (drag to rotate)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 12
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.8

    // Post-processing: glow + trail
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const afterimagePass = new AfterimagePass(0.78)
    composer.addPass(afterimagePass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.2, // strength
      0.7, // radius
      0.0 // threshold
    )
    composer.addPass(bloomPass)

    // Animation loop
    const clock = new THREE.Clock()
    let frameId = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Slow face-mesh rotation
      sphere.rotation.y = t * 0.3
      sphere.rotation.x = Math.sin(t * 0.4) * 0.2
      core.rotation.x = -t * 1.0
      core.rotation.y = t * 1.3

      // Scan ring sweeps vertically
      ring.position.y = Math.sin(t * 1.6) * 1.7

      // Pulse intensity = the "scan complete" breathing glow
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.6)
      sphereMat.opacity = 0.35 + 0.4 * pulse
      ringMat.opacity = 0.55 + 0.45 * pulse

      particles.rotation.y = t * 0.05

      controls.update()
      composer.render()
    }
    animate()

    // Resize handling
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

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      sphereGeo.dispose()
      sphereMat.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
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
