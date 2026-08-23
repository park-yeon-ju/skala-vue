<script setup>
import { computed } from 'vue'
import { FIVE_ELEMENTS } from '@/constants/sajuTerms'

/** 천간 또는 지지 한 글자. 오행은 색과 텍스트를 반드시 함께 표시한다. */
const props = defineProps({
  item: { type: Object, default: null }, // { han, ko, element, yin }
  unknown: { type: Boolean, default: false },
})

const element = computed(() => (props.item ? FIVE_ELEMENTS[props.item.element] : null))
</script>

<template>
  <div class="cell" :class="{ 'cell--unknown': unknown }" :style="element ? { '--el-color': element.color } : {}">
    <template v-if="unknown">
      <span class="han unknown-mark">미상</span>
    </template>
    <template v-else-if="item">
      <span class="han">{{ item.han }}</span>
      <span class="ko">{{ item.ko }}</span>
      <span class="meta">
        <span class="yinyang">{{ item.yin ? '음' : '양' }}</span>
        <span class="element">{{ element.label }}</span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.cell {
  --el-color: var(--line-soft);
  border: 1px solid var(--line-faint);
  border-top: 1px solid var(--el-color);
  padding: 12px 6px 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: var(--bg-card);
  min-width: 0;
}

.han {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 5.5vw, 2.1rem);
  font-weight: 200;
  line-height: 1.1;
  color: var(--el-color);
}

.ko {
  font-size: 0.87rem;
  color: var(--text-muted);
}

.meta {
  display: inline-flex;
  gap: 5px;
  margin-top: 3px;
}

.yinyang,
.element {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  padding: 1px 5px;
  border: 1px solid var(--line-faint);
  border-radius: 2px;
  color: var(--text-muted);
}

.element {
  border-color: var(--el-color);
  color: var(--el-color);
}

.cell--unknown {
  background: transparent;
  border-style: dashed;
}

.unknown-mark {
  font-size: 0.99rem;
  color: var(--text-dim);
  font-family: var(--font-body);
}
</style>
