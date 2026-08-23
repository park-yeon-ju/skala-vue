<script setup>
/**
 * 별자리 일러스트 — 짙은 밤하늘 위에 별을 밝은 원으로 찍고
 * 사이를 낮은 채도의 얇은 선으로 잇는다. 좌표는 zodiacSigns.js에서 온다.
 */
import { computed } from 'vue'

const props = defineProps({
  sign: { type: Object, required: true },
  showCaption: { type: Boolean, default: true },
  /** 가운데 정렬로 크게 띄우는 모드 */
  centered: { type: Boolean, default: false },
})

// 별마다 크기와 밝기를 조금씩 다르게 줘서 평평해 보이지 않게 한다.
const stars = computed(() =>
  props.sign.stars.map(([x, y], i) => ({
    x,
    y,
    r: 0.9 + ((i * 7) % 5) * 0.28,
    opacity: 0.68 + ((i * 3) % 4) * 0.08,
    delay: (i % 6) * 0.55,
  })),
)

const lines = computed(() =>
  props.sign.lines.map(([a, b]) => ({
    x1: props.sign.stars[a][0],
    y1: props.sign.stars[a][1],
    x2: props.sign.stars[b][0],
    y2: props.sign.stars[b][1],
  })),
)

// 배경의 흩뿌린 별 — 좌표를 고정 규칙으로 만들어 매번 같은 그림이 나오게 한다.
const dust = computed(() =>
  Array.from({ length: 54 }, (_, i) => {
    const a = (i * 137.508) % 360
    const r = 6 + ((i * 17) % 44)
    return {
      x: 50 + r * Math.cos((a * Math.PI) / 180) * 0.95,
      y: 50 + r * Math.sin((a * Math.PI) / 180) * 0.95,
      r: 0.2 + ((i * 5) % 3) * 0.13,
      o: 0.16 + ((i * 11) % 5) * 0.07,
    }
  }),
)
</script>

<template>
  <figure class="constellation" :class="{ 'is-centered': centered }">
    <div class="sky-frame">
      <svg viewBox="0 0 100 100" class="sky" role="img" :aria-label="`${sign.name} 별자리 일러스트`">
        <defs>
          <radialGradient :id="`glow-${sign.key}`" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stop-color="#2c2657" stop-opacity="0.9" />
            <stop offset="55%" stop-color="#151633" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#08080f" stop-opacity="1" />
          </radialGradient>
          <filter :id="`blur-${sign.key}`" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>

        <rect width="100" height="100" :fill="`url(#glow-${sign.key})`" />

        <circle
          v-for="(d, i) in dust"
          :key="`d-${i}`"
          :cx="d.x" :cy="d.y" :r="d.r"
          fill="#d8dcff" :opacity="d.o"
        />

        <line
          v-for="(l, i) in lines"
          :key="`l-${i}`"
          :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
          stroke="#a3aae8" stroke-width="0.38" stroke-opacity="0.5"
        />

        <g>
          <circle
            v-for="(s, i) in stars"
            :key="`g-${i}`"
            :cx="s.x" :cy="s.y" :r="s.r * 2.8"
            fill="#b6bfff" :opacity="s.opacity * 0.38"
            :filter="`url(#blur-${sign.key})`"
          />
          <circle
            v-for="(s, i) in stars"
            :key="`s-${i}`"
            :cx="s.x" :cy="s.y" :r="s.r"
            fill="#f6f7ff" :opacity="s.opacity"
            class="twinkle"
            :style="{ animationDelay: `${s.delay}s` }"
          />
        </g>
      </svg>

      <span v-if="sign.symbol" class="symbol-badge" aria-hidden="true">{{ sign.symbol }}&#xFE0E;</span>
    </div>

    <figcaption v-if="showCaption" class="caption">
      <span class="name">{{ sign.name }}</span>
      <span v-if="sign.element" class="meta">{{ sign.element }} · {{ sign.quality }} · 지배성 {{ sign.ruler }}</span>
      <span v-else-if="sign.season" class="meta">{{ sign.season }}철 별자리</span>
      <span class="traits">{{ sign.traits }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.constellation {
  margin: 0;
  max-width: 420px;
}

/* 가운데 모드에서는 그림만 크기를 제한하고, 설명은 감싸는 박스 너비를 그대로 쓴다 */
.constellation.is-centered {
  max-width: none;
  width: 100%;
  text-align: center;
}

.constellation.is-centered .sky-frame {
  max-width: 480px;
  margin: 0 auto;
}

.sky-frame {
  position: relative;
  border-radius: var(--radius-card);
  overflow: hidden;
  border: 1px solid var(--line-faint);
  box-shadow:
    0 20px 54px rgba(0, 0, 0, 0.42),
    inset 0 0 40px rgba(140, 130, 220, 0.1);
}

.sky {
  width: 100%;
  height: auto;
  display: block;
}

/* 우상단에 떠 있는 별자리 기호 */
.symbol-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid rgba(169, 155, 255, 0.4);
  background: rgba(20, 18, 40, 0.7);
  backdrop-filter: blur(8px);
  color: var(--accent-strong);
  font-size: 1.23rem;
  line-height: 1;
  font-variant-emoji: text;
  font-family: 'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols 2', var(--font-display);
}

.twinkle {
  animation: twinkle 4.5s ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .twinkle {
    animation: none;
  }
}

.caption {
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.is-centered .caption {
  align-items: center;
}

.name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-bright);
}

.meta {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  color: var(--accent);
}

.traits {
  font-size: 0.99rem;
  color: var(--text-muted);
  line-height: 1.75;
  max-width: none;
}
</style>
