<script setup>
import { computed } from 'vue'
import { formatKstDateTime } from '@/utils/datetime'

const props = defineProps({
  air: { type: Object, default: null },
})

const LEVEL_COLORS = {
  0: 'var(--text-dim)',
  1: 'var(--tone-excellent)',
  2: 'var(--tone-good)',
  3: 'var(--tone-caution)',
  4: 'var(--tone-danger)',
}

const overallColor = computed(() => LEVEL_COLORS[props.air?.overall?.level ?? 0])
</script>

<template>
  <div v-if="air" class="air">
    <div class="overall">
      <span class="dot" :style="{ background: overallColor }" aria-hidden="true" />
      <span class="overall-label" :style="{ color: overallColor }">{{ air.overall.label }}</span>
      <span class="source mono">{{ air.overall.source }}</span>
    </div>

    <dl class="values">
      <div>
        <dt>PM10 (미세먼지)</dt>
        <dd>
          {{ air.pm10 === null ? '데이터 없음' : `${air.pm10.toFixed(1)}㎍/㎥` }}
          <span class="grade" :style="{ color: LEVEL_COLORS[air.pm10Grade.level] }">{{ air.pm10Grade.label }}</span>
        </dd>
      </div>
      <div>
        <dt>PM2.5 (초미세먼지)</dt>
        <dd>
          {{ air.pm25 === null ? '데이터 없음' : `${air.pm25.toFixed(1)}㎍/㎥` }}
          <span class="grade" :style="{ color: LEVEL_COLORS[air.pm25Grade.level] }">{{ air.pm25Grade.label }}</span>
        </dd>
      </div>
    </dl>

    <p class="advice">{{ air.advice }}</p>

    <!-- 두 기준을 섞지 않도록 출처를 명시한다 -->
    <div class="provider lift-box">
      <span class="provider-key mono">참고 · {{ air.providerAqi.source }}</span>
      <span class="provider-val">
        {{ air.providerAqi.value === null ? '데이터 없음' : `${air.providerAqi.value}등급 (${air.providerAqi.label})` }}
      </span>
      <p class="provider-note">
        위의 종합 등급은 국내 환경부 PM 농도 기준으로 계산했고, 이 값은 OpenWeather가 자체 산정한 AQI입니다.
        두 기준의 등급 이름이 같아도 계산 방식이 달라 값이 어긋날 수 있습니다.
      </p>
    </div>

    <p v-if="air.measuredAt" class="observed mono">측정 시각 {{ formatKstDateTime(air.measuredAt) }}</p>
  </div>

  <p v-else class="empty">미세먼지 데이터를 불러오지 못했습니다.</p>
</template>

<style scoped>
.overall {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.overall-label {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 200;
}

.source {
  color: var(--text-dim);
  font-size: 0.78rem;
}

.values {
  display: grid;
  gap: 14px;
  margin: 0 0 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line-faint);
}

.values div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

dt {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-dim);
}

dd {
  margin: 0;
  color: var(--text-bright);
  font-weight: 300;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.grade {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.1em;
}

.advice {
  margin: 0 0 18px;
  font-size: 0.93rem;
  color: var(--text-primary);
}

.provider {
  padding: 13px 15px;
  border: 1px solid var(--line-faint);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.provider-key {
  color: var(--text-dim);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
}

.provider-val {
  color: var(--text-muted);
  font-size: 0.93rem;
}

.provider-note {
  margin: 4px 0 0;
  font-size: 0.87rem;
  color: var(--text-dim);
  line-height: 1.65;
}

.observed {
  margin: 14px 0 0;
  color: var(--text-dim);
  font-size: 0.78rem;
}

.empty {
  color: var(--text-dim);
  font-size: 0.93rem;
}

.provider:hover .provider-note,
.provider:hover .provider-val {
  color: var(--text-primary);
}

</style>
