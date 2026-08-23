<script setup>
import { computed } from 'vue'
import PillarCell from './PillarCell.vue'

const props = defineProps({
  pillars: { type: Object, required: true }, // { year, month, day, hour }
  hasHour: { type: Boolean, default: true },
})

/** 시주 → 일주 → 월주 → 년주 순으로 배치한다. */
const columns = computed(() => [
  { key: 'hour', label: '시주', pillar: props.pillars.hour, unknown: !props.hasHour },
  { key: 'day', label: '일주', pillar: props.pillars.day, unknown: false },
  { key: 'month', label: '월주', pillar: props.pillars.month, unknown: false },
  { key: 'year', label: '년주', pillar: props.pillars.year, unknown: false },
])
</script>

<template>
  <div class="manse">
    <div class="grid" role="table" aria-label="만세력 여덟 글자">
      <!-- 기둥 이름 -->
      <div class="row row--head" role="row">
        <span class="row-key" role="rowheader"></span>
        <span v-for="col in columns" :key="`h-${col.key}`" class="col-head" role="columnheader">
          {{ col.label }}
        </span>
      </div>

      <!-- 천간 -->
      <div class="row" role="row">
        <span class="row-key" role="rowheader">천간</span>
        <PillarCell
          v-for="col in columns"
          :key="`s-${col.key}`"
          :item="col.unknown ? null : col.pillar?.stem"
          :unknown="col.unknown"
        />
      </div>

      <!-- 지지 -->
      <div class="row" role="row">
        <span class="row-key" role="rowheader">지지</span>
        <PillarCell
          v-for="col in columns"
          :key="`b-${col.key}`"
          :item="col.unknown ? null : col.pillar?.branch"
          :unknown="col.unknown"
        />
      </div>
    </div>

    <p v-if="!hasHour" class="notice">
      출생시각이 입력되지 않아 시주를 제외한 6글자를 기준으로 운세를 제공합니다.
    </p>
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: grid;
  /* 모바일에서도 4개 기둥이 유지되도록 라벨 열을 좁게 잡는다 */
  grid-template-columns: 34px repeat(4, minmax(0, 1fr));
  gap: 6px;
  align-items: stretch;
}

.row--head {
  gap: 6px;
}

.row-key {
  display: flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  writing-mode: vertical-rl;
  justify-content: center;
}

.col-head {
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  color: var(--text-dim);
  padding-bottom: 4px;
}

.notice {
  margin: 16px 0 0;
  padding: 11px 14px;
  border: 1px solid var(--line-faint);
  border-left: 1px solid var(--tone-caution);
  font-size: 0.93rem;
  color: var(--text-muted);
}

@media (min-width: 560px) {
  .row {
    grid-template-columns: 46px repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .row-key {
    writing-mode: horizontal-tb;
  }
}
</style>
