<script setup>
/**
 * 은하수 배경.
 *  - 성운(옅은 띠와 번짐)은 CSS 그라디언트로 깔아 GPU에 맡기고
 *  - 별은 캔버스에 그려 반짝임과 아주 느린 흐름을 준다.
 * 별 좌표는 고정 규칙으로 만들어 새로고침해도 같은 하늘이 나온다.
 */
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let stars = []
let meteors = []
let nextMeteorAt = 0
let meteorSeed = 1
let width = 0
let height = 0
let dpr = 1
let reduceMotion = false

/** 은색 ~ 연보라 사이의 별빛 색 */
const STAR_COLORS = [
  { r: 236, g: 240, b: 255 }, // 은백
  { r: 214, g: 222, b: 255 }, // 옅은 은청
  { r: 201, g: 186, b: 255 }, // 연보라
  { r: 226, g: 209, b: 255 }, // 라일락
  { r: 255, g: 249, b: 236 }, // 따뜻한 흰빛
]

/** 결정적 난수 — 같은 인덱스면 항상 같은 값 */
function rand(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/**
 * 은하수 띠는 좌하단에서 우상단으로 가로지른다.
 * 띠에 가까울수록 별이 촘촘하고 밝게 깔린다.
 */
function bandDistance(nx, ny) {
  // 대각선 y = -0.75x + 1.05 로부터의 거리
  return Math.abs(0.75 * nx + ny - 1.05) / Math.sqrt(0.75 * 0.75 + 1)
}

function buildStars() {
  const area = width * height
  const dustCount = Math.min(1100, Math.round(area / 2600)) // 은하수 잔별
  const brightCount = Math.min(110, Math.round(area / 26000)) // 눈에 띄는 별
  stars = []

  // 은하수 띠를 따라 촘촘하게 뿌리는 잔별
  for (let i = 0; i < dustCount; i += 1) {
    let nx = rand(i * 3.1)
    let ny = rand(i * 7.7 + 1)
    // 띠 쪽으로 끌어당겨 밀도를 만든다
    const pull = rand(i * 5.3 + 2)
    if (pull > 0.35) {
      const target = 1.05 - 0.75 * nx
      ny = ny * 0.32 + target * 0.68 + (rand(i * 9.1) - 0.5) * 0.26
    }
    if (ny < -0.05 || ny > 1.05) continue

    const d = bandDistance(nx, ny)
    const nearBand = Math.max(0, 1 - d / 0.34)
    const color = STAR_COLORS[Math.floor(rand(i * 2.7 + 5) * STAR_COLORS.length)]

    stars.push({
      x: nx,
      y: ny,
      r: 0.35 + rand(i * 4.9) * 0.6,
      base: 0.1 + nearBand * 0.42 + rand(i * 6.1) * 0.16,
      color,
      speed: 0.25 + rand(i * 8.3) * 0.5,
      phase: rand(i * 11.7) * Math.PI * 2,
      halo: false,
    })
  }

  // 크고 밝은 별 — 번짐(halo)을 함께 그린다
  for (let i = 0; i < brightCount; i += 1) {
    const s = i + 5000
    const color = STAR_COLORS[Math.floor(rand(s * 2.3) * STAR_COLORS.length)]
    stars.push({
      x: rand(s * 3.7),
      y: rand(s * 5.1),
      r: 0.9 + rand(s * 7.3) * 1.15,
      base: 0.5 + rand(s * 4.1) * 0.4,
      color,
      speed: 0.35 + rand(s * 6.7) * 0.55,
      phase: rand(s * 9.3) * Math.PI * 2,
      halo: true,
    })
  }
}

/**
 * 별똥별 — 한 번에 한두 개만, 몇 초 간격을 두고 흘린다.
 * 은하수 띠와 비슷한 방향(우상단 → 좌하단)으로 떨어뜨려 배경과 어울리게 한다.
 */
function spawnMeteor() {
  meteorSeed += 1
  const s = meteorSeed
  const fromTop = rand(s * 1.7) > 0.35

  // 화면 위쪽 또는 오른쪽 가장자리에서 출발
  const startX = fromTop ? 0.25 + rand(s * 2.3) * 0.85 : 1.05
  const startY = fromTop ? -0.05 : rand(s * 3.1) * 0.5

  const angle = (208 + rand(s * 4.7) * 24) * (Math.PI / 180) // 좌하단 방향
  const speed = 0.5 + rand(s * 5.9) * 0.42 // 화면 대비 초당 이동 비율

  meteors.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    life: 0,
    ttl: 1.1 + rand(s * 6.3) * 0.5,
    len: 0.1 + rand(s * 7.1) * 0.1,
    thickness: 1.1 + rand(s * 8.9) * 0.9,
    tint: rand(s * 9.7) > 0.55 ? [206, 192, 255] : [232, 238, 255],
  })
}

function drawMeteors(ctx, dt, t) {
  // 다음 별똥별 예약 — 4~11초 간격
  if (t > nextMeteorAt) {
    spawnMeteor()
    // 가끔 두 개가 잇달아 떨어진다
    if (rand(meteorSeed * 13.3) > 0.78) spawnMeteor()
    nextMeteorAt = t + 4 + rand(meteorSeed * 15.1) * 7
  }

  for (const m of meteors) {
    m.life += dt
    m.x += m.vx * dt
    m.y += m.vy * dt

    const progress = m.life / m.ttl
    // 나타났다 사라지는 밝기 곡선
    const fade = Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI)
    if (fade <= 0) continue

    const px = m.x * width
    const py = m.y * height
    const tailX = px - m.vx * m.len * width
    const tailY = py - m.vy * m.len * height
    const [r, g, b] = m.tint

    const grad = ctx.createLinearGradient(px, py, tailX, tailY)
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.9 * fade})`)
    grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${0.28 * fade})`)
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

    ctx.strokeStyle = grad
    ctx.lineWidth = m.thickness
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(px, py)
    ctx.lineTo(tailX, tailY)
    ctx.stroke()

    // 머리쪽 작은 번짐
    const head = ctx.createRadialGradient(px, py, 0, px, py, m.thickness * 5)
    head.addColorStop(0, `rgba(255, 255, 255, ${0.7 * fade})`)
    head.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
    ctx.fillStyle = head
    ctx.beginPath()
    ctx.arc(px, py, m.thickness * 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // 수명이 다했거나 화면을 벗어난 것은 버린다
  meteors = meteors.filter((m) => m.life < m.ttl && m.x > -0.3 && m.y < 1.3)
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  buildStars()
  if (reduceMotion) draw(0)
}

let lastTime = 0

function draw(time) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const t = time / 1000
  // 탭을 오래 비웠다가 돌아왔을 때 한 번에 튀지 않도록 상한을 둔다
  const dt = Math.min(0.05, lastTime ? t - lastTime : 0.016)
  lastTime = t

  for (const star of stars) {
    // 아주 느린 수평 흐름 — 화면을 한 바퀴 도는 데 수 분이 걸린다
    const drift = reduceMotion ? 0 : (t * star.speed * 0.0016) % 1.2
    const x = (((star.x - drift) % 1.2) + 1.2) % 1.2
    if (x > 1.02) continue

    const px = x * width
    const py = star.y * height

    const twinkle = reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(t * 1.1 * star.speed + star.phase)
    const alpha = Math.min(1, star.base * twinkle)
    const { r, g, b } = star.color

    if (star.halo) {
      const halo = ctx.createRadialGradient(px, py, 0, px, py, star.r * 7)
      halo.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`)
      halo.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(px, py, star.r * 7, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.beginPath()
    ctx.arc(px, py, star.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 별똥별은 움직임 자체가 핵심이라 reduce-motion 에서는 아예 띄우지 않는다
  if (!reduceMotion) drawMeteors(ctx, dt, t)

  if (!reduceMotion) animationId = requestAnimationFrame(draw)
}

onMounted(() => {
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  window.addEventListener('resize', resize)
  if (!reduceMotion) animationId = requestAnimationFrame(draw)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="starfield" aria-hidden="true">
    <!-- 성운: 은하수 띠와 주변의 번짐 -->
    <div class="nebula nebula--band" />
    <div class="nebula nebula--violet" />
    <div class="nebula nebula--teal" />
    <canvas ref="canvasRef" class="stars" />
    <div class="vignette" />
  </div>
</template>

<style scoped>
.starfield {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background: radial-gradient(140% 110% at 50% 0%, #0d0d1c 0%, #08080f 48%, #05050a 100%);
}

.nebula {
  position: absolute;
  filter: blur(64px);
}

/* 좌하단 → 우상단을 가로지르는 은하수 띠 */
.nebula--band {
  inset: -30% -20%;
  background: linear-gradient(
    37deg,
    transparent 30%,
    rgba(126, 118, 200, 0.16) 44%,
    rgba(176, 166, 235, 0.2) 50%,
    rgba(112, 128, 200, 0.14) 56%,
    transparent 70%
  );
  filter: blur(46px);
}

.nebula--violet {
  width: 62vw;
  height: 62vw;
  right: -12vw;
  top: -18vw;
  background: radial-gradient(circle, rgba(140, 110, 235, 0.2), transparent 62%);
}

.nebula--teal {
  width: 48vw;
  height: 48vw;
  left: -14vw;
  bottom: -16vw;
  background: radial-gradient(circle, rgba(74, 132, 190, 0.14), transparent 66%);
}

.stars {
  position: absolute;
  inset: 0;
  display: block;
}

/* 가장자리를 살짝 어둡게 눌러 글자가 뜨게 한다 */
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 42%, transparent 40%, rgba(4, 4, 9, 0.62) 100%);
}
</style>
