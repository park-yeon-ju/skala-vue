<script setup>
defineProps({
  energy: { type: Object, required: true },
  /** 통합 페이지에서는 사주/별자리 근거 태그를 나눠 보여준다 */
  showSourceTags: { type: Boolean, default: false },
})
</script>

<template>
  <div class="energy">
    <h3 class="display-md">{{ energy.title }}</h3>
    <p class="desc">{{ energy.description }}</p>

    <div class="lists">
      <div>
        <p class="eyebrow"><span class="index">+</span><span>도움이 되는 기운</span></p>
        <ul class="list list--good">
          <li v-for="item in energy.helpful" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div>
        <p class="eyebrow"><span class="index">!</span><span>주의해야 할 기운</span></p>
        <ul class="list list--warn">
          <li v-for="item in energy.cautions" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>

    <div v-if="showSourceTags" class="tags">
      <div class="tag-row">
        <span class="tag-key">사주 근거</span>
        <span v-for="tag in energy.sajuTags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="tag-row">
        <span class="tag-key">별자리 근거</span>
        <span v-for="tag in energy.astrologyTags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.desc {
  color: var(--text-muted);
  margin: 12px 0 22px;
  max-width: none;
}

.lists {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .lists {
    grid-template-columns: 1fr 1fr;
  }
}

.list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list li {
  position: relative;
  padding-left: 16px;
  font-size: 0.99rem;
  color: var(--text-primary);
}

.list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.72em;
  width: 6px;
  height: 1px;
}

.list--good li::before {
  background: var(--accent-mint);
}

.list--warn li::before {
  background: var(--tone-caution);
}

.tags {
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--line-faint);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tag-key {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-dim);
  min-width: 74px;
}

.tag {
  padding: 3px 10px;
  border: 1px solid var(--line-faint);
  border-radius: 999px;
  font-size: 0.87rem;
  color: var(--text-muted);
}
</style>
