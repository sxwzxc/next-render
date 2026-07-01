'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

const Cube3D = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // ----- Scene / Camera / Renderer -----
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000005)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    // ----- The glowing cube -----
    const cubeGroup = new THREE.Group()
    scene.add(cubeGroup)

    // Solid translucent core
    const coreGeo = new THREE.BoxGeometry(1.6, 1.6, 1.6)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x1b9bff,
      transparent: true,
      opacity: 0.18,
    })
    const core = new THREE.Mesh(coreGeo, coreMat)
    cubeGroup.add(core)

    // Glowing edges
    const edgesGeo = new THREE.EdgesGeometry(coreGeo)
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x4dd2ff })
    const edges = new THREE.LineSegments(edgesGeo, edgesMat)
    cubeGroup.add(edges)

    // Inner wireframe cube (counter-rotating for a richer trail)
    const innerGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9)
    const innerEdgesGeo = new THREE.EdgesGeometry(innerGeo)
    const innerEdgesMat = new THREE.LineBasicMaterial({ color: 0xff5fa2 })
    const innerEdges = new THREE.LineSegments(innerEdgesGeo, innerEdgesMat)
    cubeGroup.add(innerEdges)

    // Vertex glow points
    const pointsMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
    })
    const points = new THREE.Points(edgesGeo, pointsMat)
    cubeGroup.add(points)

    // ----- Controls (drag to rotate) -----
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 12
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.5

    // ----- Post-processing: bloom (glow) + afterimage (trail) -----
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))

    const afterimagePass = new AfterimagePass(0.88)
    composer.addPass(afterimagePass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.3, // strength
      0.6, // radius
      0.0 // threshold
    )
    composer.addPass(bloomPass)

    // ----- Animation loop -----
    const clock = new THREE.Clock()
    let frameId = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Self-rotation of the cube (in addition to camera autoRotate)
      cubeGroup.rotation.x = t * 0.6
      cubeGroup.rotation.y = t * 0.9

      // Counter-rotating inner cube for a layered trail
      innerEdges.rotation.x = -t * 1.2
      innerEdges.rotation.z = t * 0.8

      controls.update()
      composer.render()
    }
    animate()

    // ----- Resize handling -----
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

    // ----- Cleanup -----
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      controls.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      edgesGeo.dispose()
      edgesMat.dispose()
      innerEdgesGeo.dispose()
      innerEdgesMat.dispose()
      pointsMat.dispose()
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

export default Cube3D
