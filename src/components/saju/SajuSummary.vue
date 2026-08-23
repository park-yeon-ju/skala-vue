<script setup>
import { computed } from 'vue'
import { FIVE_ELEMENTS, ELEMENT_ORDER } from '@/constants/sajuTerms'

const props = defineProps({
  manse: { type: Object, required: true },
  currentDaeun: { type: Object, default: null },
  daily: { type: Object, default: null },
})

const total = computed(() =>
  Object.values(props.manse.elementCount).reduce((a, b) => a + b, 0) || 1,
)

const elements = computed(() =>
  ELEMENT_ORDER.map((key) => ({
    key,
    ...FIVE_ELEMENTS[key],
    count: props.manse.elementCount[key],
    ratio: Math.round((props.manse.elementCount[key] / total.value) * 100),
  })),
)
</script>

<template>
  <div class="summary">
    <dl class="facts">
      <div>
        <dt>일간</dt>
        <dd>
          {{ manse.dayStem.han }} ({{ manse.dayStem.ko }}) ·
          {{ manse.dayStem.element }} · {{ manse.dayStem.yin ? '음' : '양' }}
        </dd>
      </div>
      <div>
        <dt>강한 오행</dt>
        <dd>{{ manse.strongestElement }} ({{ manse.elementCount[manse.strongestElement] }}개)</dd>
      </div>
      <div>
        <dt>부족한 오행</dt>
        <dd>{{ manse.weakestElement }} ({{ manse.elementCount[manse.weakestElement] }}개)</dd>
      </div>
      <div v-if="currentDaeun">
        <dt>현재 대운</dt>
        <dd>{{ currentDaeun.pillar.han }} ({{ currentDaeun.age }}세)</dd>
      </div>
    </dl>

    <div class="elements">
      <p class="eyebrow">오행 분포</p>
      <ul class="el-list">
        <li v-for="el in elements" :key="el.key">
          <span class="el-name" :style="{ color: el.color }">{{ el.label }} {{ el.hanja }}</span>
          <span class="el-bar">
            <span class="el-fill" :style="{ width: `${el.ratio}%`, background: el.color }" />
          </span>
          <span class="el-count">{{ el.count }}</span>
        </li>
      </ul>
    </div>

    <p class="tendency">
      일간이 {{ manse.dayStem.element }}({{ FIVE_ELEMENTS[manse.dayStem.element].keyword }})이고
      원국에는 {{ manse.strongestElement }} 기운이 가장 두텁습니다.
      {{ manse.weakestElement }} 기운이 상대적으로 얇아,
      {{ FIVE_ELEMENTS[manse.weakestElement].keyword }} 쪽을 의식적으로 채워 줄 때 균형이 잡힙니다.
    </p>

    <dl v-if="daily" class="today">
      <div><dt>오늘 세운</dt><dd>{{ daily.seun.han }}</dd></div>
      <div><dt>오늘 월운</dt><dd>{{ daily.wolun.han }}</dd></div>
      <div><dt>오늘 일진</dt><dd>{{ daily.iljin.han }}</dd></div>
      <div><dt>절기 구간</dt><dd>{{ daily.term.name }}</dd></div>
    </dl>
  </div>
</template>

<style scoped>
.facts,
.today {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 0 0 26px;
}

.today {
  margin: 26px 0 0;
  padding-top: 20px;
  border-top: 1px solid var(--line-faint);
}

.facts div,
.today div {
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
  font-size: 0.99rem;
}

.el-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.el-list li {
  display: grid;
  grid-template-columns: 58px 1fr 24px;
  align-items: center;
  gap: 12px;
}

.el-name {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.el-bar {
  height: 2px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.el-fill {
  display: block;
  height: 100%;
  transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.el-count {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: right;
}

.tendency {
  margin: 24px 0 0;
  color: var(--text-muted);
  font-size: 0.93rem;
  line-height: 1.75;
  max-width: none;
}
</style>
