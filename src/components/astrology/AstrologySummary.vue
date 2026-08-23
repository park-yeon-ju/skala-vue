<script setup>
import { computed } from 'vue'
import { ELEMENT_TRAITS } from '@/constants/zodiacSigns'
import { HOUSE_MEANINGS } from '@/constants/astrologyDailyRules'

const props = defineProps({
  natal: { type: Object, required: true },
  fortune: { type: Object, default: null },
})

const detail = computed(() => props.fortune?.detail ?? null)
</script>

<template>
  <div class="astro-summary">
    <dl class="facts">
      <div>
        <dt>태양 별자리</dt>
        <dd>{{ natal.sun.sign.name }} {{ natal.sun.degree }}°</dd>
      </div>
      <div>
        <dt>달 별자리</dt>
        <dd>{{ natal.moon.sign.name }} {{ natal.moon.degree }}°</dd>
      </div>
      <div>
        <dt>상승궁</dt>
        <dd>{{ natal.hasAngles ? natal.ascendantSign.name : '정보 부족' }}</dd>
      </div>
      <div v-if="detail?.transit">
        <dt>오늘 달</dt>
        <dd>{{ detail.transit.moon.sign.name }} {{ detail.transit.moon.degree }}°</dd>
      </div>
      <div v-if="detail?.moonHouse">
        <dt>강조 하우스</dt>
        <dd>{{ detail.moonHouse }}하우스</dd>
      </div>
    </dl>

    <p class="tendency">
      태양이 {{ natal.sun.sign.name }}에 있어 {{ natal.sun.sign.traits }}
      감정의 결은 달이 든 {{ natal.moon.sign.name }}를 따라
      {{ ELEMENT_TRAITS[natal.moon.sign.element] }}으로 나타납니다.
      <template v-if="natal.hasAngles">
        상승궁은 {{ natal.ascendantSign.name }}로, 처음 반응하는 방식이 여기에서 나옵니다.
      </template>
    </p>

    <div v-if="!natal.hasAngles" class="notice lift-box">
      출생시각 또는 출생지역이 없어 상승궁과 하우스를 제외한 간이 해석을 제공합니다.
    </div>

    <div v-if="detail?.moonHouse" class="house-line lift-box">
      오늘 달이 {{ detail.moonHouse }}하우스({{ HOUSE_MEANINGS[detail.moonHouse] }})를 지나 이 영역이 두드러집니다.
    </div>

    <!-- 주요 어스펙트 -->
    <div v-if="detail?.aspects?.length" class="aspects">
      <p class="eyebrow">오늘의 주요 천체 각</p>
      <ul class="aspect-list">
        <li v-for="(a, i) in detail.aspects.slice(0, 6)" :key="i">
          <span class="a-dot" :class="a.aspect.polarity > 0 ? 'good' : 'warn'" aria-hidden="true" />
          <span class="a-body">
            <span class="a-title">
              트랜짓 {{ a.transit.name }} <span class="a-type">{{ a.aspect.name }}</span> 출생 {{ a.natal.name }}
            </span>
            <span class="a-note">{{ a.aspect.note }}</span>
          </span>
          <span class="a-orb mono">오브 {{ a.orb }}°</span>
        </li>
      </ul>
    </div>

    <!-- 행성 위치 표 -->
    <details class="planets">
      <summary>오늘 행성 위치 전체 보기</summary>
      <div class="scroll-x">
        <table>
          <thead>
            <tr><th>행성</th><th>별자리</th><th>도수</th><th>상태</th><th>담당 영역</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in (detail?.transit?.planets ?? [])" :key="p.key">
              <td>{{ p.name }}</td>
              <td>{{ p.sign.name }}</td>
              <td>{{ p.degree }}°</td>
              <td>{{ p.retrograde ? '역행' : '순행' }}</td>
              <td class="role">{{ p.role }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>

<style scoped>
.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin: 0 0 22px;
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

.tendency {
  color: var(--text-muted);
  font-size: 0.93rem;
  line-height: 1.75;
  max-width: none;
  margin: 0;
}

.notice,
.house-line {
  margin: 18px 0 0;
  padding: 11px 14px;
  border: 1px solid var(--line-faint);
  font-size: 0.93rem;
  color: var(--text-muted);
}

.notice {
  border-left: 1px solid var(--tone-caution);
}

.house-line {
  border-left: 1px solid var(--accent-soft);
}

.aspects {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid var(--line-faint);
}

.aspect-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}

.aspect-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line-faint);
}

.a-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  margin-top: 0.55em;
  flex-shrink: 0;
}

.a-dot.good {
  background: var(--accent-mint);
}

.a-dot.warn {
  background: var(--tone-caution);
}

.a-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.a-title {
  font-size: 0.93rem;
  color: var(--text-primary);
}

.a-type {
  color: var(--accent);
}

.a-note {
  font-size: 0.87rem;
  color: var(--text-dim);
}

.a-orb {
  flex-shrink: 0;
  color: var(--text-dim);
  font-size: 0.78rem;
}

.planets {
  margin-top: 22px;
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  min-width: 460px;
}

th,
td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid var(--line-faint);
  font-size: 0.93rem;
}

th {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  font-weight: 400;
}

td {
  color: var(--text-primary);
}

.role {
  color: var(--text-dim);
}
</style>
