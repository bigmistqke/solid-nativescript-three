import { Canvas } from '@nativescript/canvas'
import '@nativescript/canvas-three'
//@ts-ignore
import { registerElement } from 'dominative'
import * as THREE from 'three'

registerElement('canvas', Canvas)

const App = () => {
  let canvas: HTMLCanvasElement

  const init = () => {
    let camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.Renderer
    let geometry: THREE.BufferGeometry,
      material: THREE.Material,
      mesh: THREE.Mesh

    init()
    animate()

    function init() {
      const context = canvas.getContext('webgl')!

      const { drawingBufferWidth: width, drawingBufferHeight: height } = context
      camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
      camera.position.z = 1

      scene = new THREE.Scene()

      geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      material = new THREE.MeshNormalMaterial()

      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      renderer = new THREE.WebGLRenderer({ context })
      renderer.setSize(width, height)

      console.log('renderer is ', renderer)
    }

    function animate() {
      mesh.rotation.x += 0.01
      mesh.rotation.y += 0.02

      console.log('renderer.render', renderer.render)

      //renderer.render(scene, camera)
    }
  }

  return <canvas ref={canvas!} style={{ background: 'grey' }} on:ready={init} />
}

export { App }
