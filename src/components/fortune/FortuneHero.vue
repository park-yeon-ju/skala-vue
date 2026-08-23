<script setup>
import ScoreGauge from '@/components/common/ScoreGauge.vue'

/** 점수·등급·한마디를 가장 먼저 인지하도록 배치하는 최상단 영역 */
defineProps({
  fortune: { type: Object, required: true },
  eyebrow: { type: String, default: '' },
  index: { type: String, default: '00' },
})
</script>

<template>
  <section class="hero">
    <div class="hero-text">
      <p class="eyebrow">{{ eyebrow }}</p>

      <h2 class="display-lg headline">{{ fortune.headline }}</h2>
      <p class="summary">{{ fortune.summary }}</p>

      <dl class="quick">
        <div>
          <dt>등급</dt>
          <dd>{{ fortune.grade }}</dd>
        </div>
        <div v-if="fortune.detail?.sajuTotal !== undefined">
          <dt>사주</dt>
          <dd>{{ fortune.detail.sajuTotal }}점</dd>
        </div>
        <div v-if="fortune.detail?.astrologyTotal !== undefined">
          <dt>별자리</dt>
          <dd>{{ fortune.detail.astrologyTotal }}점</dd>
        </div>
      </dl>
    </div>

    <div class="hero-gauge">
      <ScoreGauge :score="fortune.totalScore" :size="196" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 32px;
  align-items: center;
  grid-template-columns: 1fr;
  padding: clamp(28px, 5vw, 56px) 0;
}

.headline {
  margin: 18px 0 14px;
  max-width: none;
}

.summary {
  color: var(--text-muted);
  max-width: none;
  margin: 0;
}

.quick {
  display: flex;
  gap: 28px;
  margin: 26px 0 0;
  flex-wrap: wrap;
}

.quick div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick dt {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.quick dd {
  margin: 0;
  font-size: 1.13rem;
  color: var(--text-bright);
  font-weight: 300;
}

.hero-gauge {
  display: flex;
  justify-content: flex-start;
}

@media (min-width: 860px) {
  .hero {
    grid-template-columns: 1fr auto;
    gap: 56px;
  }

  .hero-gauge {
    justify-content: flex-end;
  }
}
</style>
