<script setup>
import { computed } from 'vue'
import { useTemperature } from '@/composables/useTemperature'
import { formatKstHour, formatKstDateTime } from '@/utils/datetime'

const props = defineProps({
  weather: { type: Object, required: true },
  forecast: { type: Array, default: () => [] },
})

const { format } = useTemperature()

/** 강수량은 "데이터 없음"과 "실제 0"을 구분해 표시한다. */
const precipitationText = computed(() => {
  const p = props.weather.precipitation
  if (!p?.measured) return '데이터 없음'
  if (p.amount === 0) return '0mm (관측됨)'
  return `${p.amount.toFixed(1)}mm${p.type ? ` (${p.type})` : ''}`
})

const maxPop = computed(() =>
  props.forecast.length ? Math.max(...props.forecast.map((s) => s.pop)) : null,
)
</script>

<template>
  <div class="weather">
    <div class="headline">
      <span class="temp">{{ format(weather.temp, 1) }}</span>
      <div class="headline-meta">
        <span class="condition">{{ weather.condition }}</span>
        <span class="feels mono">체감 {{ format(weather.feelsLike, 1) }}</span>
      </div>
    </div>

    <dl class="facts">
      <div>
        <dt>최고 / 최저</dt>
        <dd>{{ format(weather.tempMax, 0) }} / {{ format(weather.tempMin, 0) }}</dd>
      </div>
      <div>
        <dt>습도</dt>
        <dd>{{ weather.humidity }}%</dd>
      </div>
      <div>
        <dt>구름량</dt>
        <dd>{{ weather.clouds === null ? '데이터 없음' : `${weather.clouds}%` }}</dd>
      </div>
      <div>
        <dt>현재 강수량</dt>
        <dd>{{ precipitationText }}</dd>
      </div>
      <div>
        <dt>바람</dt>
        <dd>{{ weather.windSpeed === null ? '데이터 없음' : `${weather.windSpeed}m/s` }}</dd>
      </div>
      <div v-if="maxPop !== null">
        <dt>오늘 최고 강수확률</dt>
        <dd>{{ maxPop }}%</dd>
      </div>
    </dl>

    <!-- 시간대별 강수 정보 -->
    <div v-if="forecast.length" class="hourly">
      <p class="eyebrow">오늘의 시간대별 강수</p>
      <div class="scroll-x">
        <ul class="slots">
          <li v-for="slot in forecast" :key="slot.at.getTime()" class="slot">
            <span class="slot-time mono">{{ formatKstHour(slot.at) }}</span>
            <span class="slot-bar" :style="{ '--pop': `${slot.pop}%` }" :aria-hidden="true">
              <span class="slot-fill" />
            </span>
            <span class="slot-pop">{{ slot.pop }}%</span>
            <span class="slot-temp mono">{{ format(slot.temp, 0) }}</span>
            <span class="slot-amount mono">
              {{ slot.precipitation.measured ? `${slot.precipitation.amount.toFixed(1)}mm` : '–' }}
            </span>
          </li>
        </ul>
      </div>
      <p class="legend mono">강수량 열의 – 는 예보에 강수 항목이 없다는 뜻입니다 (실제 0mm와 구분).</p>
    </div>

    <p class="observed mono">관측 시각 {{ formatKstDateTime(weather.observedAt) }} · OpenWeather 제공</p>
  </div>
</template>

<style scoped>
.headline {
  display: flex;
  align-items: baseline;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 26px;
}

.temp {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 8vw, 4.4rem);
  font-weight: 100;
  line-height: 1;
  color: var(--text-bright);
}

.headline-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.condition {
  font-size: 1.08rem;
  color: var(--text-primary);
}

.feels {
  color: var(--text-dim);
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin: 0;
  padding-top: 20px;
  border-top: 1px solid var(--line-faint);
}

.facts div {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  font-size: 0.99rem;
}

.hourly {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--line-faint);
}

.slots {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  min-width: 420px;
}

.slot {
  display: grid;
  grid-template-columns: 44px 1fr 44px 52px 56px;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line-faint);
}

.slot-time {
  color: var(--text-muted);
}

.slot-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.slot-fill {
  display: block;
  height: 100%;
  width: var(--pop);
  background: var(--accent-soft);
}

.slot-pop {
  font-size: 0.87rem;
  color: var(--text-primary);
  text-align: right;
}

.slot-temp,
.slot-amount {
  text-align: right;
  color: var(--text-muted);
}

.legend,
.observed {
  margin: 12px 0 0;
  color: var(--text-dim);
  font-size: 0.78rem;
}

.observed {
  margin-top: 22px;
}
</style>
