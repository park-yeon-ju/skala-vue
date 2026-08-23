<script setup>
/**
 * 접속 시 한 번 보여주는 시작 화면.
 * 은하수가 번지며 별이 모였다가 브랜드가 떠오르고 사라진다.
 * 세션당 한 번만 뜨게 해서 화면을 옮길 때마다 반복되지 않도록 한다.
 */
import { ref, onMounted, onUnmounted } from 'vue'

const SESSION_KEY = 'the-aura:intro-shown'

const visible = ref(false)
const leaving = ref(false)
let timers = []

/** 궤도를 그리며 모여드는 별 — 좌표는 고정 규칙으로 만든다 */
const orbitStars = Array.from({ length: 26 }, (_, i) => {
  const angle = (i * 137.508) % 360
  const radius = 24 + ((i * 13) % 30)
  return {
    x: 50 + radius * Math.cos((angle * Math.PI) / 180),
    y: 50 + radius * Math.sin((angle * Math.PI) / 180) * 0.62,
    size: 1 + ((i * 7) % 4) * 0.7,
    delay: (i % 13) * 0.055,
  }
})

function finish() {
  leaving.value = true
  timers.push(setTimeout(() => (visible.value = false), 900))
}

onMounted(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const alreadyShown = sessionStorage.getItem(SESSION_KEY)

  if (alreadyShown || reduceMotion) {
    sessionStorage.setItem(SESSION_KEY, '1')
    return
  }

  visible.value = true
  sessionStorage.setItem(SESSION_KEY, '1')
  // 스크롤을 잠가 뒤 화면이 움직이지 않게 한다
  document.body.style.overflow = 'hidden'

  timers.push(setTimeout(finish, 2600))
  timers.push(setTimeout(() => (document.body.style.overflow = ''), 3400))
})

onUnmounted(() => {
  timers.forEach(clearTimeout)
  timers = []
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="intro" :class="{ 'is-leaving': leaving }" role="presentation">
      <!-- 번져 오르는 은하수 -->
      <div class="haze haze--core" />
      <div class="haze haze--band" />

      <!-- 모여드는 별 -->
      <div class="orbit">
        <span
          v-for="(s, i) in orbitStars"
          :key="i"
          class="orbit-star"
          :style="{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }"
        />
      </div>

      <div class="mark">
        <span class="sparkle" aria-hidden="true">✦</span>
        <h1 class="brand">THE AURA</h1>
        <p class="tagline">오늘의 하늘이 당신에게 건네는 이야기</p>
      </div>

      <button class="skip" type="button" @click="finish">건너뛰기</button>
    </div>
  </Teleport>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(120% 100% at 50% 45%, #10101f 0%, #07070e 55%, #040408 100%);
  transition:
    opacity 0.9s ease,
    transform 0.9s ease;
}

.intro.is-leaving {
  opacity: 0;
  transform: scale(1.06);
  pointer-events: none;
}

/* --- 은하수 번짐 --- */
.haze {
  position: absolute;
  filter: blur(60px);
  opacity: 0;
}

.haze--core {
  width: 70vmin;
  height: 70vmin;
  background: radial-gradient(circle, rgba(150, 128, 255, 0.42), transparent 64%);
  animation: bloom 2.6s ease-out forwards;
}

.haze--band {
  inset: -20%;
  background: linear-gradient(
    38deg,
    transparent 34%,
    rgba(150, 140, 230, 0.24) 48%,
    rgba(120, 150, 220, 0.18) 56%,
    transparent 68%
  );
  animation: sweep 2.6s ease-out forwards;
}

@keyframes bloom {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  45% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0.75;
    transform: scale(1.12);
  }
}

@keyframes sweep {
  0% {
    opacity: 0;
    transform: translateX(-14%);
  }
  55% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 0.7;
    transform: translateX(4%);
  }
}

/* --- 모여드는 별 --- */
.orbit {
  position: absolute;
  inset: 0;
}

.orbit-star {
  position: absolute;
  border-radius: 999px;
  background: #eef0ff;
  box-shadow: 0 0 8px rgba(200, 190, 255, 0.85);
  opacity: 0;
  animation: gather 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes gather {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.2) translateZ(0);
  }
  40% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.25);
  }
  100% {
    opacity: 0.55;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* --- 브랜드 --- */
.mark {
  position: relative;
  text-align: center;
  padding: 0 24px;
}

.sparkle {
  display: block;
  font-size: 1.6rem;
  color: var(--accent-strong);
  opacity: 0;
  animation: rise 1s ease-out 0.5s forwards;
}

.brand {
  margin: 14px 0 0;
  font-size: clamp(2.2rem, 8vw, 4.4rem);
  font-weight: 200;
  letter-spacing: 0.32em;
  text-indent: 0.32em;
  color: #f6f6fc;
  opacity: 0;
  animation: rise 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.75s forwards;
}

.tagline {
  margin: 16px 0 0;
  font-size: clamp(0.82rem, 2.2vw, 0.98rem);
  color: #b8bad0;
  letter-spacing: 0.04em;
  opacity: 0;
  animation: rise 1.2s ease-out 1.25s forwards;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.skip {
  position: absolute;
  right: clamp(18px, 4vw, 40px);
  bottom: clamp(18px, 4vw, 40px);
  padding: 8px 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  background: transparent;
  color: #a9abc2;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.16em;
  cursor: pointer;
  opacity: 0;
  animation: rise 0.8s ease-out 1.6s forwards;
}

.skip:hover {
  border-color: var(--accent-soft);
  color: #fff;
}
</style>
