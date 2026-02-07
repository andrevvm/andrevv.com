'use client'
import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, AsciiRenderer, useFBO } from '@react-three/drei'
import {
  VideoTexture,
  Scene,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  OrthographicCamera as ThreeOrthographicCamera,
  MeshBasicMaterial,
  Vector2,
} from 'three'
import { useProjectsStore } from '@/stores/projects'

const meltVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const decayFragmentShader = `
  uniform sampler2D uCurrentFrame;
  uniform sampler2D uPreviousFrame;
  uniform float uDecay;
  uniform float uBleed;
  uniform vec2 uVideoScale;
  varying vec2 vUv;

  void main() {
    vec2 videoUv = (vUv - 0.5) * uVideoScale + 0.5;
    vec4 current = texture2D(uCurrentFrame, videoUv);

    // Sample previous frame with a soft blur to create bleed/diffusion
    vec2 px = vec2(uBleed);
    vec4 previous = (
      texture2D(uPreviousFrame, vUv) * 4.0 +
      texture2D(uPreviousFrame, vUv + vec2( px.x, 0.0)) +
      texture2D(uPreviousFrame, vUv + vec2(-px.x, 0.0)) +
      texture2D(uPreviousFrame, vUv + vec2(0.0,  px.y)) +
      texture2D(uPreviousFrame, vUv + vec2(0.0, -px.y)) +
      texture2D(uPreviousFrame, vUv + vec2( px.x,  px.y)) +
      texture2D(uPreviousFrame, vUv + vec2(-px.x,  px.y)) +
      texture2D(uPreviousFrame, vUv + vec2( px.x, -px.y)) +
      texture2D(uPreviousFrame, vUv + vec2(-px.x, -px.y))
    ) / 12.0;

    vec4 col = mix(current, previous, uDecay);

    // Restore saturation lost from blur averaging
    float gray = dot(col.rgb, vec3(0.299, 0.587, 0.114));
    col.rgb = mix(vec3(gray), col.rgb + uDecay * 0.0025, 1.005 + uDecay*0.01);

    // Restore contrast — push away from mid-gray
    col.rgb = (col.rgb - uDecay * 0.035) * 1.017 + 0.025;

    gl_FragColor = col;
  }
`

const Video = () => {
  const video = useProjectsStore((store) => store.video)
  const { gl, size } = useThree()

  const texture = useMemo(() => {
    if (!video) return null
    return new VideoTexture(video)
  }, [video])

  // Off-screen scene and camera for the feedback pass
  const feedbackSceneRef = useRef(new Scene())
  const feedbackCameraRef = useRef(
    new ThreeOrthographicCamera(-1, 1, 1, -1, 0.1, 100)
  )

  useEffect(() => {
    const cam = feedbackCameraRef.current
    const hw = size.width / 2
    const hh = size.height / 2
    cam.left = -hw
    cam.right = hw
    cam.top = hh
    cam.bottom = -hh
    cam.position.z = 10
    cam.updateProjectionMatrix()
  }, [size.width, size.height])

  // Ping-pong render targets for feedback loop
  const targetA = useFBO(size.width, size.height)
  const targetB = useFBO(size.width, size.height)
  const frameCount = useRef(0)

  // Melt shader: blends current video frame with previous output
  const meltMaterialRef = useRef(
    new ShaderMaterial({
      uniforms: {
        uCurrentFrame: { value: null },
        uPreviousFrame: { value: null },
        uDecay: { value: 0.92 },
        uBleed: { value: 0.0001 },
        uVideoScale: { value: new Vector2(1, 1) },
      },
      vertexShader: meltVertexShader,
      fragmentShader: decayFragmentShader,
    })
  )

  // Build off-screen quad for the feedback pass
  useEffect(() => {
    const scene = feedbackSceneRef.current
    const geo = new PlaneGeometry(size.width, size.height)
    const quad = new Mesh(geo, meltMaterialRef.current)
    scene.add(quad)
    return () => {
      scene.remove(quad)
      geo.dispose()
    }
  }, [size.width, size.height])

  const materialRef = useRef<MeshBasicMaterial>(null)
  const textureRef = useRef(texture)
  useEffect(() => {
    textureRef.current = texture
  }, [texture])

  useFrame(() => {
    if (!textureRef.current) return
    textureRef.current.needsUpdate = true

    const write = frameCount.current % 2 === 0 ? targetA : targetB
    const read = frameCount.current % 2 === 0 ? targetB : targetA

    meltMaterialRef.current.uniforms.uCurrentFrame.value = textureRef.current
    meltMaterialRef.current.uniforms.uPreviousFrame.value = read.texture

    // Render melt pass into the write target
    gl.setRenderTarget(write)
    gl.render(feedbackSceneRef.current, feedbackCameraRef.current)
    gl.setRenderTarget(null)

    // Display the result on the visible mesh
    if (materialRef.current) {
      materialRef.current.map = write.texture
      materialRef.current.needsUpdate = true
    }

    frameCount.current++
  })

  if (!texture) return null

  return (
    <mesh position={[-100, 0, 0]}>
      <planeGeometry args={[size.width, size.height]} />
      <meshBasicMaterial ref={materialRef} toneMapped={false} />
    </mesh>
  )
}

const ThreeScene = () => {
  const { size } = useThree()

  const resolution = useMemo(() => {
    return size.width < 768 ? 0.08 : 0.05
  }, [size.width])

  return (
    <>
      {size.width && (
        <AsciiRenderer
          renderIndex={1}
          characters="  ❍✧✳❀✿ "
          color={true}
          bgColor="transparent"
          fgColor="red"
          resolution={resolution}
        />
      )}

      <OrthographicCamera makeDefault position={[0, 0, 10]} />
      <Video />
    </>
  )
}

const Renderer = () => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-screen w-auto aspect-video">
      <Canvas>
        <ThreeScene />
      </Canvas>
    </div>
  )
}

export default Renderer
