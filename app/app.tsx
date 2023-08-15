import { Canvas } from '@nativescript/canvas'
import '@nativescript/canvas-three'
//@ts-ignore
import { registerElement } from 'dominative'
import { createEffect, createSignal } from 'solid-js'
import * as THREE from 'three'
registerElement('canvas', Canvas)

const App = () => {
  let canvas: HTMLCanvasElement
  const canvas2 = document.createElement('canvas')

  const [canvasReady, setCanvasReady] = createSignal(false)

  // from https://github.com/NativeScript/canvas/tree/master/packages/canvas-three
  const initializeThree = () => {
    let camera: THREE.Camera, scene: THREE.Scene, renderer: THREE.Renderer
    let geometry: THREE.BufferGeometry,
      material: THREE.Material,
      mesh: THREE.Mesh

    function initializeScene() {
      const context = canvas2.getContext('webgl')!

      const { drawingBufferWidth: width, drawingBufferHeight: height } = context
      camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
      camera.position.z = 1

      scene = new THREE.Scene()

      geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      material = new THREE.MeshNormalMaterial()

      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      renderer = new THREE.WebGL1Renderer({ context })
      renderer.setSize(width, height)

      console.log('renderer is ', renderer)
    }

    function animate() {
      mesh.rotation.x += 0.01
      mesh.rotation.y += 0.02

      renderer.render(scene, camera) // will crash applicaiton
    }

    initializeScene()
    animate()
  }

  // from https://codepen.io/alaingalvan/pen/OMEqKa
  const initializeWebgl = () => {
    canvas.width = canvas.height = 640

    const gl: WebGLRenderingContext = canvas.getContext('webgl')!

    if (!gl) {
      throw new Error('WebGL failed to initialize.')
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.colorMask(true, true, true, true)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.cullFace(gl.BACK)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const positions = new Float32Array([
      1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0,
    ])

    const colors = new Float32Array([1.0, 0.0, 0, 0.0, 1.0, 0, 0.0, 0.0, 1])

    let positionBuffer: WebGLBuffer = null!
    let colorBuffer: WebGLBuffer = null!

    let createBuffer = (
      arr: number | Float32Array | Uint16Array | Uint32Array
    ) => {
      let buf = gl.createBuffer()
      let bufType =
        arr instanceof Uint16Array || arr instanceof Uint32Array
          ? gl.ELEMENT_ARRAY_BUFFER
          : gl.ARRAY_BUFFER

      gl.bindBuffer(bufType, buf)

      gl.bufferData(bufType, arr, gl.STATIC_DRAW)
      return buf
    }

    positionBuffer = createBuffer(positions)!
    colorBuffer = createBuffer(colors)!

    const indices = new Uint16Array([0, 1, 2])

    let indexBuffer: WebGLBuffer = null!

    indexBuffer = createBuffer(indices)!

    let vertModule: WebGLShader = null!

    const vertShaderCode = `
attribute vec3 inPosition;
attribute vec3 inColor;

varying vec3 vColor;

void main()
{
    vColor = inColor;
    gl_Position = vec4(inPosition, 1.0);
}
`

    let createShader = (source: string, stage: number) => {
      let s = gl.createShader(stage)!

      gl.shaderSource(s, source)

      gl.compileShader(s)

      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(
          'An error occurred compiling the shader: ' + gl.getShaderInfoLog(s)
        )
      }
      return s
    }

    vertModule = createShader(vertShaderCode, gl.VERTEX_SHADER)!

    let fragModule: WebGLShader = null!

    const fragShaderCode = `
precision mediump float;

varying highp vec3 vColor;

void main()
{
    gl_FragColor = vec4(vColor, 1.0);
}
`

    fragModule = createShader(fragShaderCode, gl.FRAGMENT_SHADER)!

    let program: WebGLProgram = null!

    let createProgram = (stages: WebGLShader[]) => {
      let p = gl.createProgram()
      for (let stage of stages) {
        gl.attachShader(p, stage)
      }
      gl.linkProgram(p)
      return p
    }

    program = createProgram([vertModule, fragModule])!

    let animationHandler: number = 0

    let render = () => {
      // 🖌️ Encode drawing commands
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.useProgram(program)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.scissor(0, 0, canvas.width, canvas.height)

      // Bind Vertex Layout
      let setVertexBuffer = (buf: WebGLBuffer, name: string) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        let loc = gl.getAttribLocation(program, name)
        gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 4 * 3, 0)
        gl.enableVertexAttribArray(loc)
      }

      setVertexBuffer(positionBuffer, 'inPosition')
      setVertexBuffer(colorBuffer, 'inColor')

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0)

      // ➿ Refresh canvas
      // animationHandler = requestAnimationFrame(render) // will crash the application
      animationHandler = setTimeout(render, 0) as unknown as number
    }

    render()
  }

  createEffect(() => canvasReady() && initializeWebgl())

  return (
    <>
      <canvas
        ref={canvas!}
        style={{ background: 'grey' }}
        //@ts-expect-error
        on:ready={() => setCanvasReady(true)}
      />
    </>
  )
}

export { App }
