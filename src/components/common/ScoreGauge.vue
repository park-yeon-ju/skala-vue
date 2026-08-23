<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { gradeOf } from '@/constants/scoreGrades'

const props = defineProps({
  score: { type: Number, required: true },
  size: { type: Number, default: 168 },
  label: { type: String, default: '종합 운세 점수' },
})

const grade = computed(() => gradeOf(props.score))

/** 흰 원판 위에서 읽히도록, 원 안 글자에 쓸 진한 색 */
const INK = {
  excellent: '#0f6b53',
  good: '#3541a8',
  normal: '#42465c',
  caution: '#8d5a0d',
  danger: '#a82c2c',
}

/**
 * 링은 흰 원판 바깥의 어두운 배경 위에 그린다.
 * 그래서 글자와 반대로 밝은 색을 쓰고, 밝기 차로 눈에 먼저 들어오게 한다.
 */
const RING = {
  excellent: { from: '#9ff5da', to: '#5ad9b5' },
  good: { from: '#d3c9ff', to: '#9b86ff' },
  normal: { from: '#cfc4ff', to: '#a08fff' },
  caution: { from: '#ffdca6', to: '#f0b055' },
  danger: { from: '#ffb9b9', to: '#f27f7f' },
}

const inkColor = computed(() => INK[grade.value.tone] ?? INK.normal)
const ring = computed(() => RING[grade.value.tone] ?? RING.normal)
const uid = computed(() => `gauge-${grade.value.tone}-${props.size}`)

/**
 * 링 바깥으로 번짐이 퍼질 자리를 남겨 둬야 한다.
 * SVG 뷰포트에 딱 붙여 그리면 번짐이 잘려 네모난 자국이 생긴다.
 */
const ringWidth = 9
const bleed = 14
const ringRadius = computed(() => props.size / 2 - bleed)
const discRadius = computed(() => ringRadius.value - ringWidth / 2 - 3)
const circumference = computed(() => 2 * Math.PI * ringRadius.value)

// 링은 0에서 시작해 실제 점수까지 차오른다.
const shown = ref(0)
const offset = computed(() => circumference.value * (1 - Math.min(100, Math.max(0, shown.value)) / 100))

const rootRef = ref(null)
const started = ref(false)
let observer = null

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function start() {
  if (started.value) return
  started.value = true
  // 첫 프레임은 0으로 그린 뒤 다음 프레임에 목표값을 넣어야 전환이 걸린다.
  requestAnimationFrame(() => requestAnimationFrame(() => (shown.value = props.score)))
}

onMounted(() => {
  if (reduceMotion) {
    shown.value = props.score
    return
  }
  // 사주·별자리 페이지에서는 점수 원이 화면 아래쪽에 있어, 스크롤로 보일 때 애니메이션을 시작한다.
  if (typeof IntersectionObserver === 'undefined') {
    start()
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        start()
        observer?.disconnect()
        observer = null
      }
    },
    { threshold: 0.45 },
  )
  if (rootRef.value) observer.observe(rootRef.value)
})

onUnmounted(() => observer?.disconnect())

// 날짜를 바꿔 점수가 갱신되면, 이미 보고 있는 경우에만 바로 반영한다.
watch(
  () => props.score,
  (v) => {
    if (started.value || reduceMotion) shown.value = v
  },
)
</script>

<template>
  <figure ref="rootRef" class="gauge" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg
      :width="size"
      :height="size"
      :viewBox="`0 0 ${size} ${size}`"
      role="img"
      :aria-label="`${label} ${score}점, 등급 ${grade.label}`"
    >
      <defs>
        <linearGradient :id="`${uid}-grad`" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="ring.from" />
          <stop offset="100%" :stop-color="ring.to" />
        </linearGradient>

        <!-- 번짐은 CSS filter 대신 SVG 필터로. 영역을 넉넉히 잡아 잘리지 않게 한다. -->
        <filter :id="`${uid}-glow`" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <!-- 링이 지나갈 자리 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="ringRadius"
        fill="none"
        stroke="rgba(255, 255, 255, 0.16)"
        :stroke-width="ringWidth"
      />

      <!-- 뒤에 깔리는 빛 번짐 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="ringRadius"
        fill="none"
        :stroke="ring.from"
        :stroke-width="ringWidth + 2"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        :filter="`url(#${uid}-glow)`"
        class="progress glow"
      />

      <!-- 실제 진행 링 -->
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="ringRadius"
        fill="none"
        :stroke="`url(#${uid}-grad)`"
        :stroke-width="ringWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
        class="progress"
      />

      <!-- 흰 원판 -->
      <circle :cx="size / 2" :cy="size / 2" :r="discRadius" fill="#ffffff" />
    </svg>

    <figcaption class="center">
      <span class="score" :style="{ color: inkColor }">
        {{ score }}<span class="unit">점</span>
      </span>
      <!-- 색상만으로 구분되지 않도록 등급 텍스트를 항상 함께 표시한다 -->
      <span class="grade" :style="{ color: inkColor }">{{ grade.label }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.gauge {
  position: relative;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress {
  transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.glow {
  opacity: 0.75;
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.score {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 2.8rem;
  line-height: 1;
  letter-spacing: -0.03em;
  display: inline-flex;
  align-items: baseline;
}

.unit {
  font-size: 0.92rem;
  font-weight: 700;
  margin-left: 3px;
  letter-spacing: 0;
}

.grade {
  margin-top: 6px;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

@media (prefers-reduced-motion: reduce) {
  .progress {
    transition: none;
  }
}
</style>
