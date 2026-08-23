<script setup>
defineProps({
  lucky: { type: Object, required: true },
})
</script>

<template>
  <div class="lucky">
    <ul class="items">
      <li class="item">
        <span class="key">행운 컬러</span>
        <span class="value color-value">
          <!-- 색상 원과 함께 이름을 항상 표기한다 -->
          <span class="swatch" :style="{ background: lucky.color.hex }" aria-hidden="true" />
          {{ lucky.color.name }}
          <span class="hex">{{ lucky.color.hex }}</span>
        </span>
      </li>
      <li class="item">
        <span class="key">행운의 숫자</span>
        <span class="value number">{{ lucky.number }}</span>
      </li>
      <li class="item">
        <span class="key">행운의 방향</span>
        <span class="value">{{ lucky.direction }}</span>
      </li>
      <li class="item">
        <span class="key">행운의 시간대</span>
        <span class="value">{{ lucky.time }}</span>
      </li>
    </ul>

    <p class="evidence">
      <span class="eyebrow">선정 근거</span>
      {{ lucky.evidence }}
    </p>

    <!-- 통합 페이지에서 두 관점이 갈릴 때 보조 정보 -->
    <details v-if="lucky.alternates" class="alternates">
      <summary>사주·별자리 각각의 행운 정보 보기</summary>
      <div class="alt-grid">
        <div>
          <span class="alt-key">사주</span>
          <span class="alt-val">
            <span class="swatch sm" :style="{ background: lucky.alternates.saju.color.hex }" aria-hidden="true" />
            {{ lucky.alternates.saju.color.name }} · {{ lucky.alternates.saju.number }} ·
            {{ lucky.alternates.saju.direction }}
          </span>
        </div>
        <div>
          <span class="alt-key">별자리</span>
          <span class="alt-val">
            <span class="swatch sm" :style="{ background: lucky.alternates.astrology.color.hex }" aria-hidden="true" />
            {{ lucky.alternates.astrology.color.name }} · {{ lucky.alternates.astrology.number }} ·
            {{ lucky.alternates.astrology.direction }}
          </span>
        </div>
      </div>
    </details>
  </div>
</template>

<style scoped>
.items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid var(--line-faint);
}

.key {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.value {
  color: var(--text-bright);
  font-weight: 300;
  text-align: right;
}

.color-value {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.swatch {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  flex-shrink: 0;
}

.swatch.sm {
  width: 10px;
  height: 10px;
}

.hex {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-dim);
}

.number {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 200;
}

.evidence {
  margin: 18px 0 0;
  font-size: 0.93rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.evidence .eyebrow {
  display: flex;
  margin-bottom: 6px;
}

.alternates {
  margin-top: 16px;
  border-top: 1px solid var(--line-faint);
  padding-top: 14px;
}

summary {
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  color: var(--text-dim);
}

summary:hover {
  color: var(--text-primary);
}

.alt-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.alt-key {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  color: var(--text-dim);
  margin-right: 10px;
}

.alt-val {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.93rem;
  color: var(--text-muted);
}
</style>
