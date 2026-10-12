import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterial, springStep, unitSphere } from './shared.js'

const { damp } = THREE.MathUtils

const FRAME_W = 1.5
const FRAME_H = 1.8
const PHOTO = 1.3
const PHOTO_Y = 0.1
const HANG = 0.16
const SAG = 0.35

const frameGeometry = new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.025)
const photoGeometry = new THREE.PlaneGeometry(PHOTO, PHOTO)
const backGeometry = new THREE.PlaneGeometry(FRAME_W * 0.88, FRAME_H * 0.88)
const pegGeometry = new THREE.BoxGeometry(0.1, 0.32, 0.07)
// Emissive lift keeps the paper reading as white instead of grey under the soft scene lights.
const FRAME_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.7,
  emissive: '#fff4f6',
  emissiveIntensity: 0.55,
})

function fallbackTexture(label) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffd6e2'
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = '#c2185b'
  ctx.font = '600 18px Manrope, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Foto tidak ditemukan', 128, 122)
  ctx.font = '14px Manrope, sans-serif'
  ctx.fillText(label, 128, 148)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Loads without Suspense so one missing file shows a placeholder instead of breaking the page.
function usePhoto(src) {
  const [texture, setTexture] = useState(null)
  useEffect(() => {
    let alive = true
    let loaded = null
    new THREE.TextureLoader().load(
      src,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        const { width, height } = t.image
        const aspect = width / height
        if (aspect > 1) {
          t.repeat.set(1 / aspect, 1)
          t.offset.set((1 - 1 / aspect) / 2, 0)
        } else {
          t.repeat.set(1, aspect)
          t.offset.set(0, (1 - aspect) / 2)
        }
        loaded = t
        if (alive) setTexture(t)
        else t.dispose()
      },
      undefined,
      () => alive && setTexture((loaded = fallbackTexture(src))),
    )
    return () => {
      alive = false
      loaded?.dispose()
    }
  }, [src])
  return texture
}

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

function useCaption(caption, index) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 440
    canvas.height = 528
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }, [])

  useEffect(() => {
    let alive = true
    const draw = () => {
      if (!alive) return
      const canvas = texture.image
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#fffaf5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = 'rgba(232, 69, 122, 0.12)'
      ctx.lineWidth = 2
      for (let y = 150; y < 470; y += 56) {
        ctx.beginPath()
        ctx.moveTo(40, y)
        ctx.lineTo(canvas.width - 40, y)
        ctx.stroke()
      }
      ctx.fillStyle = '#e8457a'
      ctx.font = '600 22px Manrope, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`#${index + 1}`, canvas.width / 2, 70)
      ctx.fillStyle = '#c2185b'
      ctx.font = '700 46px "Dancing Script", cursive'
      const lines = wrap(ctx, caption, canvas.width - 90)
      const top = 300 - ((lines.length - 1) * 56) / 2
      lines.forEach((l, i) => ctx.fillText(l, canvas.width / 2, top + i * 56))
      ctx.fillStyle = '#ff8fab'
      ctx.font = '32px serif'
      ctx.fillText('♡', canvas.width / 2, 490)
      texture.needsUpdate = true
    }
    draw()
    document.fonts?.load('700 46px "Dancing Script"').then(draw).catch(() => {})
    return () => {
      alive = false
    }
  }, [texture, caption, index])

  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

function Polaroid({ photo, index, position, tilt }) {
  const group = useRef()
  const flip = useRef({ v: 0 })
  const swing = useRef({ v: 0 })
  const [flipped, setFlipped] = useState(false)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const texture = usePhoto(photo.src)
  const caption = useCaption(photo.caption, index)
  const photoMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), [])
  const backMaterial = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  useEffect(() => {
    photoMaterial.map = texture
    photoMaterial.color.set(texture ? '#ffffff' : '#ffe3ea')
    photoMaterial.needsUpdate = true
  }, [texture, photoMaterial])
  useEffect(() => {
    backMaterial.map = caption
    backMaterial.needsUpdate = true
  }, [caption, backMaterial])
  useEffect(
    () => () => {
      photoMaterial.dispose()
      backMaterial.dispose()
    },
    [photoMaterial, backMaterial],
  )

  const seed = useMemo(() => Math.random() * 10, [])
  const kick = useRef(0)

  useFrame((state, delta) => {
    const g = group.current
    const t = state.clock.elapsedTime
    const flipTarget = flipped ? Math.PI : 0
    g.rotation.y = springStep(g.rotation.y, flipTarget, flip.current, delta, 70, 9)
    kick.current = damp(kick.current, 0, 1.2, delta)
    const sway = Math.sin(t * 0.9 + seed) * 0.04 + Math.sin(t * 2.6 + seed) * kick.current * 0.25
    g.rotation.z = springStep(g.rotation.z, tilt + sway, swing.current, delta, 40, 5)
    const s = damp(g.scale.x, hovered ? 1.06 : 1, 8, delta)
    g.scale.setScalar(s)
    g.position.z = damp(g.position.z, flipped ? 0.6 : hovered ? 0.25 : 0, 5, delta)
  })

  return (
    <group position={position}>
      <mesh geometry={pegGeometry} material={getMaterial('#ff8fab', { roughness: 0.5, clearcoat: 0.4 })} position={[0, -0.05, 0.04]} />
      <group ref={group}>
        <group
          position={[0, -HANG - FRAME_H / 2, 0]}
          onClick={(e) => {
            e.stopPropagation()
            kick.current = 1
            setFlipped((f) => !f)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
          }}
          onPointerOut={() => setHovered(false)}
        >
          <mesh geometry={frameGeometry} material={FRAME_MATERIAL} />
          <mesh geometry={photoGeometry} material={photoMaterial} position={[0, PHOTO_Y + (FRAME_H - PHOTO) / 2 - 0.18, 0.014]} />
          <mesh geometry={backGeometry} material={backMaterial} position={[0, 0, -0.014]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>
    </group>
  )
}

function Bulbs({ curve, count, seed }) {
  const refs = useRef([])
  const materials = useMemo(
    () =>
      Array.from({ length: count }, (_, i) =>
        new THREE.MeshStandardMaterial({
          color: i % 2 ? '#ffe9b0' : '#ffc2d1',
          emissive: i % 2 ? '#ffcf70' : '#ff7fa2',
          emissiveIntensity: 2,
          toneMapped: false,
        }),
      ),
    [count],
  )
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    materials.forEach((m, i) => {
      m.emissiveIntensity = 1.6 + Math.sin(t * 2.2 + i * 1.7 + seed) * 0.9
    })
  })
  return Array.from({ length: count }, (_, i) => {
    const p = curve.getPoint((i + 0.5) / count)
    return <mesh key={i} geometry={unitSphere} material={materials[i]} position={[p.x, p.y - 0.06, p.z + 0.02]} scale={0.055} />
  })
}

function Row({ photos, startIndex, y, width }) {
  const curve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-width / 2, 0, 0),
        new THREE.Vector3(0, -SAG * 2, 0),
        new THREE.Vector3(width / 2, 0, 0),
      ),
    [width],
  )
  const string = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.012, 6, false), [curve])
  useEffect(() => () => string.dispose(), [string])

  return (
    <group position={[0, y, 0]}>
      <mesh geometry={string} material={getMaterial('#ffffff', { roughness: 0.7 })} />
      <Bulbs curve={curve} count={Math.round(width * 1.6)} seed={y} />
      {photos.map((photo, i) => {
        const t = (i + 0.5) / photos.length
        const p = curve.getPoint(t)
        const tangent = curve.getTangent(t)
        const tilt = Math.atan2(tangent.y, tangent.x) * 0.6
        return <Polaroid key={startIndex + i} photo={photo} index={startIndex + i} position={[p.x, p.y, 0]} tilt={tilt} />
      })}
    </group>
  )
}

export default function Polaroids({ photos }) {
  const { width: vw, height: vh, aspect } = useThree((s) => s.viewport)
  const perRow = aspect < 0.9 ? 2 : photos.length <= 4 ? photos.length : Math.ceil(photos.length / 2)
  const rows = Math.ceil(photos.length / perRow)
  const rowWidth = perRow * 1.95 + 0.8
  const rowHeight = FRAME_H + HANG + SAG + 0.45
  const totalHeight = rows * rowHeight
  const scale = Math.min(1, (vw * 0.94) / rowWidth, (vh * 0.62) / totalHeight)

  return (
    <group scale={scale} position={[0, (totalHeight / 2 - 0.2) * scale, 0]}>
      {Array.from({ length: rows }, (_, r) => {
        const slice = photos.slice(r * perRow, (r + 1) * perRow)
        if (!slice.length) return null
        return <Row key={r} photos={slice} startIndex={r * perRow} y={-r * rowHeight} width={rowWidth} />
      })}
    </group>
  )
}
