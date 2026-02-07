'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera, useFBO } from '@react-three/drei'
import {
  VideoTexture,
  Scene,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  OrthographicCamera as ThreeOrthographicCamera,
  MeshBasicMaterial,
  Vector2,
  CanvasTexture,
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

const asciiVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const asciiFragmentShader = `
  uniform sampler2D uSceneTexture;
  uniform sampler2D uCharAtlas;
  uniform vec2 uGridSize;
  uniform float uNumChars;
  varying vec2 vUv;

  void main() {
    // Determine which cell this fragment belongs to
    vec2 cell = floor(vUv * uGridSize);
    vec2 cellCenter = (cell + 0.5) / uGridSize;

    // Sample scene color at the cell center
    vec4 sceneColor = texture2D(uSceneTexture, cellCenter);

    // Calculate brightness (luminance)
    float brightness = dot(sceneColor.rgb, vec3(0.299, 0.587, 0.114));

    // Map brightness to character index (matches AsciiEffect with invert=true)
    float idx = floor((1.0 - brightness) * (uNumChars - 1.0));
    float charIndex = clamp(uNumChars - 1.0 - idx, 0.0, uNumChars - 1.0);

    // UV within the current cell [0, 1]
    vec2 cellLocalUv = fract(vUv * uGridSize);

    // Map to atlas UV
    vec2 atlasUv = vec2(
      (charIndex + cellLocalUv.x) / uNumChars,
      1.0 - cellLocalUv.y
    );

    // Sample character glyph alpha
    float charAlpha = texture2D(uCharAtlas, atlasUv).a;

    gl_FragColor = vec4(sceneColor.rgb * charAlpha, charAlpha);
  }
`

function createCharacterAtlas(characters: string): CanvasTexture {
  const cellSize = 64
  const canvas = document.createElement('canvas')
  canvas.width = cellSize * characters.length
  canvas.height = cellSize

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${cellSize * 0.8}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'white'

  for (let i = 0; i < characters.length; i++) {
    if (characters[i] !== ' ') {
      ctx.fillText(characters[i], cellSize * i + cellSize / 2, cellSize / 2)
    }
  }

  const texture = new CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

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
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[size.width, size.height]} />
      <meshBasicMaterial ref={materialRef} toneMapped={false} />
    </mesh>
  )
}

const GpuAsciiEffect = ({
  characters = '  ❍✧✳❀✿ ',
  resolution = 0.04,
  renderIndex = 1,
}: {
  characters?: string
  resolution?: number
  renderIndex?: number
}) => {
  const { gl, scene, camera, size } = useThree()

  const charAtlas = useMemo(
    () => createCharacterAtlas(characters),
    [characters]
  )

  const sceneFBO = useFBO(size.width, size.height)

  const postSceneRef = useRef(new Scene())
  const postCameraRef = useRef(new ThreeOrthographicCamera(-1, 1, 1, -1, 0, 1))

  const asciiMaterialRef = useRef(
    new ShaderMaterial({
      uniforms: {
        uSceneTexture: { value: null },
        uCharAtlas: { value: null },
        uGridSize: { value: new Vector2(1, 1) },
        uNumChars: { value: characters.length },
      },
      vertexShader: asciiVertexShader,
      fragmentShader: asciiFragmentShader,
      transparent: true,
    })
  )

  useEffect(() => {
    const postScene = postSceneRef.current
    const geo = new PlaneGeometry(2, 2)
    const mesh = new Mesh(geo, asciiMaterialRef.current)
    postScene.add(mesh)
    return () => {
      postScene.remove(mesh)
      geo.dispose()
    }
  }, [])

  useEffect(() => {
    asciiMaterialRef.current.uniforms.uCharAtlas.value = charAtlas
  }, [charAtlas])

  useEffect(() => {
    const cols = Math.floor(size.width * resolution)
    const rows = Math.floor(size.height * resolution)
    asciiMaterialRef.current.uniforms.uGridSize.value.set(cols, rows)
    asciiMaterialRef.current.uniforms.uNumChars.value = characters.length
  }, [size, resolution, characters])

  useFrame(() => {
    // Render scene to offscreen FBO
    gl.setRenderTarget(sceneFBO)
    gl.clear()
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    // Apply ASCII post-process to screen
    asciiMaterialRef.current.uniforms.uSceneTexture.value = sceneFBO.texture
    gl.clear()
    gl.render(postSceneRef.current, postCameraRef.current)
  }, renderIndex)

  return null
}

const ThreeScene = () => {
  const { size } = useThree()

  const resolution = useMemo(() => {
    return window.innerWidth < 768 ? 0.064 : 0.0375
  }, [size])

  return (
    <>
      <GpuAsciiEffect
        characters="  ❍✫✧❀✿ "
        resolution={resolution}
        renderIndex={1}
      />
      <OrthographicCamera makeDefault position={[0, 0, 10]} />
      <Video />
    </>
  )
}

const Renderer = () => {
  const [dpr, setDpr] = useState(2)
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 h-screen w-auto aspect-video">
      <Canvas dpr={dpr}>
        <ThreeScene />
      </Canvas>
    </div>
  )
}

export default Renderer
