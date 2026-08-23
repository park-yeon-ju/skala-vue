<script setup>
import { computed } from 'vue'
import { formatKoreanDate, isToday, shiftDateKey, todayKey } from '@/utils/datetime'

/** 선택 날짜를 props로 받고 변경은 emit으로만 알린다. */
const props = defineProps({
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const label = computed(() => formatKoreanDate(props.modelValue))
const today = computed(() => isToday(props.modelValue))

function move(days) {
  emit('update:modelValue', shiftDateKey(props.modelValue, days))
}
function goToday() {
  emit('update:modelValue', todayKey())
}
</script>

<template>
  <div class="date-nav" role="group" aria-label="날짜 선택">
    <button class="arrow" type="button" @click="move(-1)" aria-label="이전 날짜">←</button>

    <div class="current">
      <span class="date-label">{{ label }}</span>
      <span v-if="today" class="badge-today">오늘</span>
    </div>

    <button class="arrow" type="button" @click="move(1)" aria-label="다음 날짜">→</button>

    <button v-if="!today" class="today-btn" type="button" @click="goToday">오늘로</button>
  </div>
</template>

<style scoped>
.date-nav {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.arrow {
  width: 32px;
  height: 32px;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.93rem;
  transition: border-color 0.25s ease, color 0.25s ease;
}

.arrow:hover {
  border-color: var(--accent-soft);
  color: var(--text-bright);
}

.current {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 190px;
  justify-content: center;
}

.date-label {
  font-family: var(--font-mono);
  font-size: 0.87rem;
  letter-spacing: 0.08em;
  color: var(--text-bright);
}

.badge-today {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  padding: 2px 7px;
  border: 1px solid var(--accent-soft);
  border-radius: 999px;
  color: var(--accent);
}

.today-btn {
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.today-btn:hover {
  color: var(--text-primary);
}
</style>
