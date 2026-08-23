<script setup>
/** 판단 근거 — 기본은 접어두고 사용자가 펼쳐볼 수 있게 한다. */
defineProps({
  basis: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  note: { type: String, default: '' },
})
</script>

<template>
  <div class="evidence">
    <ul class="basis">
      <li v-for="line in basis" :key="line">{{ line }}</li>
    </ul>

    <details v-if="categories.length" class="per-category">
      <summary>종목별 판단 근거 펼쳐보기</summary>
      <div class="cat-list">
        <div v-for="cat in categories" :key="cat.key" class="cat-block">
          <p class="cat-title">{{ cat.label }} · {{ cat.score }}점</p>
          <ul>
            <li v-for="(line, i) in cat.evidence" :key="`${cat.key}-${i}`">{{ line }}</li>
          </ul>
        </div>
      </div>
    </details>

    <p v-if="note" class="note">{{ note }}</p>
  </div>
</template>

<style scoped>
.basis {
  list-style: none;
  margin: 0;
  padding: 0;
}

.basis li {
  padding: 10px 0;
  border-bottom: 1px solid var(--line-faint);
  font-size: 0.93rem;
  color: var(--text-muted);
}

.per-category {
  margin-top: 18px;
}

summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 6px 0;
}

summary:hover {
  color: var(--accent);
}

.cat-list {
  display: grid;
  gap: 20px;
  margin-top: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .cat-list {
    grid-template-columns: 1fr 1fr;
  }
}

.cat-block ul {
  margin: 8px 0 0;
  padding-left: 16px;
}

.cat-block li {
  font-size: 0.93rem;
  color: var(--text-muted);
  margin-bottom: 5px;
}

.cat-title {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  color: var(--text-primary);
}

.note {
  margin: 20px 0 0;
  padding: 12px 14px;
  border: 1px solid var(--line-faint);
  font-size: 0.87rem;
  color: var(--text-dim);
  line-height: 1.7;
}
</style>
