<script setup>
defineProps({
  message: { type: String, default: '불러오는 중입니다' },
  rows: { type: Number, default: 4 },
})
</script>

<template>
  <div class="loading" role="status" aria-live="polite">
    <p class="eyebrow">{{ message }}</p>
    <div class="bars">
      <span v-for="n in rows" :key="n" class="bar" :style="{ animationDelay: `${n * 0.12}s` }" />
    </div>
  </div>
</template>

<style scoped>
.loading {
  padding: 28px 0;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 18px;
}

.bar {
  height: 1px;
  background: linear-gradient(90deg, var(--line-soft), transparent);
  animation: sweep 1.6s ease-in-out infinite;
  transform-origin: left;
}

.bar:nth-child(even) {
  width: 72%;
}

@keyframes sweep {
  0%,
  100% {
    opacity: 0.25;
    transform: scaleX(0.6);
  }
  50% {
    opacity: 0.8;
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bar {
    animation: none;
    opacity: 0.5;
  }
}
</style>
