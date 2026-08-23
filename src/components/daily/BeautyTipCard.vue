<script setup>
import { computed } from 'vue'
import { TIP_GROUPS, MAX_TIPS_PER_GROUP } from '@/constants/beautyRules'

const props = defineProps({
  /** { beauty: [], outfit: [], totalMatched: number } */
  tips: { type: Object, default: () => ({ beauty: [], outfit: [], totalMatched: 0 }) },
  /** 판단에 쓰인 값 — 근거로 함께 보여준다 */
  context: { type: Object, default: null },
})

const groups = computed(() =>
  TIP_GROUPS.map((g) => ({ ...g, items: props.tips[g.key] ?? [] })).filter((g) => g.items.length),
)

const hasAny = computed(() => groups.value.length > 0)

/** 팁을 고른 근거 — 실제로 쓰인 값만 문장으로 만든다 */
const basis = computed(() => {
  const c = props.context
  if (!c) return []
  const lines = []
  if (typeof c.temp === 'number') lines.push(`기온 ${c.temp.toFixed(1)}℃`)
  if (typeof c.humidity === 'number') lines.push(`습도 ${c.humidity}%`)
  if (typeof c.rainAmount === 'number') lines.push(`시간당 강수량 ${c.rainAmount.toFixed(1)}mm`)
  else lines.push('시간당 강수량 데이터 없음')
  if (typeof c.maxPop === 'number') lines.push(`오늘 최고 강수확률 ${c.maxPop}%`)
  if (typeof c.uvIndex === 'number') lines.push(`자외선 지수 ${c.uvIndex} (태양 고도 ${c.solarAltitude}° 추정)`)
  if (typeof c.windSpeed === 'number') lines.push(`풍속 ${c.windSpeed}m/s`)
  if (typeof c.dustLevel === 'number') lines.push(`미세먼지 등급 ${c.dustLevel}단계`)
  return lines
})
</script>

<template>
  <div class="tips">
    <div v-if="hasAny" class="groups">
      <section v-for="group in groups" :key="group.key" class="group">
        <p class="eyebrow">
          <span class="index" aria-hidden="true">{{ group.icon }}</span>
          {{ group.label }}
        </p>

        <ul class="tip-list">
          <li v-for="tip in group.items" :key="tip.key" class="tip lift-box">
            <span class="tag">{{ tip.label }}</span>
            <span class="body">
              <span class="headline">{{ tip.tip }}</span>
              <span class="detail">{{ tip.detail }}</span>
            </span>
          </li>
        </ul>

        <p v-if="group.items.length >= MAX_TIPS_PER_GROUP" class="cap">
          조건에 맞는 항목이 많아 우선순위가 높은 {{ MAX_TIPS_PER_GROUP }}개만 표시합니다.
        </p>
      </section>
    </div>

    <p v-else class="empty">오늘 날씨는 특별히 조정할 조건이 없습니다. 평소 루틴을 유지하세요.</p>

    <details v-if="basis.length" class="basis">
      <summary>이 팁을 고른 기준 보기</summary>
      <ul>
        <li v-for="line in basis" :key="line">{{ line }}</li>
      </ul>
      <p class="basis-note">
        자외선 지수는 무료 API로 제공되지 않아 태양 고도와 구름량으로 추정한 값입니다.
      </p>
    </details>
  </div>
</template>

<style scoped>
.groups {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.group .eyebrow {
  margin-bottom: 12px;
}

.tip-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip {
  display: flex;
  gap: 13px;
  padding: 13px 15px;
  border-radius: var(--radius-inner);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line-faint);
}

.tag {
  flex-shrink: 0;
  align-self: flex-start;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(169, 155, 255, 0.16);
  color: var(--accent-strong);
  font-size: 0.87rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.headline {
  font-size: 0.99rem;
  color: var(--text-bright);
  font-weight: 500;
}

.detail {
  font-size: 0.93rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.cap,
.empty {
  margin: 10px 0 0;
  color: var(--text-dim);
  font-size: 0.87rem;
}

.empty {
  margin: 0;
  font-size: 0.99rem;
}

.basis {
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--line-faint);
}

summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
}

summary:hover {
  color: var(--accent);
}

.basis ul {
  margin: 12px 0 0;
  padding-left: 18px;
}

.basis li {
  font-size: 0.93rem;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.basis-note {
  margin: 10px 0 0;
  font-size: 0.87rem;
  color: var(--text-dim);
}

.tip:hover .detail {
  color: var(--text-bright);
}

</style>
