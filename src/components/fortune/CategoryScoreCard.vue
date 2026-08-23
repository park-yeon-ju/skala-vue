<script setup>
import { computed } from 'vue'
import { gradeOf } from '@/constants/scoreGrades'

/** 종목 하나를 props로 받고, 상세 이동은 emit으로 부모에 알린다. */
const props = defineProps({
  category: { type: Object, required: true },
  /** 통합 페이지에서만 사주/별자리 점수를 함께 보여준다 */
  showBreakdown: { type: Boolean, default: false },
  detailLabel: { type: String, default: '' },
})
defineEmits(['open-detail'])

const grade = computed(() => gradeOf(props.category.score))
</script>

<template>
  <article class="cat lift-box">
    <header class="cat-head">
      <h4 class="cat-name">{{ category.label }}</h4>
      <span class="cat-score" :style="{ color: grade.color }">
        {{ category.score }}<span class="cat-unit">점</span>
      </span>
    </header>

    <div class="meter" role="img" :aria-label="`${category.label} ${category.score}점, ${grade.label}`">
      <span class="meter-fill" :style="{ width: `${category.score}%`, background: grade.color }" />
    </div>

    <p class="cat-grade">
      <span class="dot" :style="{ background: grade.color }" aria-hidden="true" />
      {{ grade.label }}
      <span v-if="showBreakdown && category.diverged" class="diverge-badge">서로 다른 흐름</span>
    </p>

    <!-- 통합 페이지: 두 관점의 점수를 함께 표시 -->
    <dl v-if="showBreakdown" class="breakdown">
      <div>
        <dt>사주</dt>
        <dd>{{ category.sajuScore }}</dd>
      </div>
      <div>
        <dt>별자리</dt>
        <dd>{{ category.astrologyScore }}</dd>
      </div>
      <div v-if="category.gap !== undefined">
        <dt>차이</dt>
        <dd>{{ category.gap }}</dd>
      </div>
    </dl>

    <p class="cat-desc">{{ category.description }}</p>

    <button v-if="detailLabel" class="detail-link" type="button" @click="$emit('open-detail', category.key)">
      {{ detailLabel }} <span aria-hidden="true">→</span>
    </button>
  </article>
</template>

<style scoped>
.cat {
  border: 1px solid var(--line-faint);
  background: var(--bg-card);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.cat:hover {
  border-color: var(--line-soft);
  background: var(--bg-card-hover);
}

.cat-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.cat-name {
  font-size: 1.08rem;
  font-weight: 300;
  color: var(--text-bright);
}

.cat-score {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: 1.65rem;
  line-height: 1;
}

.cat-unit {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  margin-left: 3px;
}

.meter {
  height: 2px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.meter-fill {
  display: block;
  height: 100%;
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.cat-grade {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  flex-shrink: 0;
}

.diverge-badge {
  margin-left: auto;
  padding: 2px 8px;
  border: 1px solid var(--tone-caution);
  color: var(--tone-caution);
  border-radius: 999px;
  font-size: 0.78rem;
  letter-spacing: 0.1em;
}

.breakdown {
  display: flex;
  gap: 18px;
  margin: 2px 0 0;
  padding: 10px 0;
  border-top: 1px solid var(--line-faint);
  border-bottom: 1px solid var(--line-faint);
}

.breakdown div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.breakdown dt {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  color: var(--text-dim);
}

.breakdown dd {
  margin: 0;
  font-size: 0.99rem;
  color: var(--text-primary);
  font-weight: 300;
}

.cat-desc {
  margin: 0;
  font-size: 0.93rem;
  color: var(--text-muted);
  line-height: 1.65;
}

.detail-link {
  align-self: flex-start;
  margin-top: auto;
  padding: 6px 0 0;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.25s ease;
}

.detail-link:hover {
  color: var(--accent);
}

/* 표면이 밝아지면 본문도 함께 또렷해지게 한다 */
.cat:hover .cat-desc,
.cat:hover .cat-grade {
  color: var(--text-bright);
}

.cat:hover .detail-link {
  color: var(--accent-strong);
}

</style>
