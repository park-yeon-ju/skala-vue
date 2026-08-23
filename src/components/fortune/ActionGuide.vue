<script setup>
defineProps({
  recommended: { type: Array, default: () => [] },
  cautions: { type: Array, default: () => [] },
  advice: { type: String, default: '' },
  outlook: { type: String, default: '' },
})
</script>

<template>
  <div class="guide">
    <div v-if="outlook" class="outlook">
      <p class="eyebrow">오늘의 전망</p>
      <p class="outlook-text">{{ outlook }}</p>
    </div>

    <div class="columns">
      <div class="col">
        <p class="eyebrow"><span class="index">DO</span><span>하면 좋은 행동</span></p>
        <ol class="steps steps--do">
          <li v-for="(item, i) in recommended" :key="item">
            <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ item }}</span>
          </li>
        </ol>
      </div>

      <div class="col">
        <p class="eyebrow"><span class="index">AVOID</span><span>피하면 좋은 행동</span></p>
        <ol class="steps steps--avoid">
          <li v-for="(item, i) in cautions" :key="item">
            <span class="num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span>{{ item }}</span>
          </li>
        </ol>
      </div>
    </div>

    <blockquote v-if="advice" class="advice lift-box">
      <p class="eyebrow">중요한 결정에 대한 조언</p>
      <p class="advice-text">{{ advice }}</p>
    </blockquote>
  </div>
</template>

<style scoped>
.outlook {
  margin-bottom: 28px;
}

.outlook-text {
  margin: 12px 0 0;
  color: var(--text-primary);
  max-width: none;
}

.columns {
  display: grid;
  gap: 28px;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .columns {
    grid-template-columns: 1fr 1fr;
  }
}

.steps {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.steps li {
  display: flex;
  gap: 14px;
  padding: 11px 0;
  border-top: 1px solid var(--line-faint);
  font-size: 0.99rem;
  color: var(--text-primary);
}

.num {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  padding-top: 0.3em;
  flex-shrink: 0;
}

.steps--do .num {
  color: var(--accent-mint);
}

.steps--avoid .num {
  color: var(--tone-caution);
}

.advice {
  margin: 32px 0 0;
  padding: 22px 24px;
  border: 1px solid var(--line-faint);
  border-left: 1px solid var(--accent);
  background: rgba(139, 124, 246, 0.045);
}

.advice-text {
  margin: 12px 0 0;
  color: var(--text-bright);
  font-weight: 300;
  line-height: 1.8;
  max-width: none;
}
</style>
