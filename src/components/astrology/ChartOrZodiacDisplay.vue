<script setup>
import NatalChartImage from './NatalChartImage.vue'
import ZodiacConstellation from './ZodiacConstellation.vue'

/**
 * 별자리 일러스트는 차트 이미지 등록 여부와 무관하게 항상 맨 위 가운데에 둔다.
 * 그 아래에서 조건부로 나뉜다.
 *  - 이미지 있음 → 등록한 차트 + 자체 계산 핵심값
 *  - 이미지 없음 → 등록 안내
 */
defineProps({
  hasImage: { type: Boolean, default: false },
  imageId: { type: String, default: null },
  sign: { type: Object, default: null },
  natal: { type: Object, default: null },
  transitMoon: { type: Object, default: null },
})
defineEmits(['change-image', 'delete-image'])
</script>

<template>
  <div class="display">
    <!-- 항상 보이는 태양 별자리 -->
    <div v-if="sign" class="hero-sign">
      <ZodiacConstellation :sign="sign" centered />
    </div>

    <hr v-if="sign" class="rule" />

    <!-- 이미지가 있을 때: 등록한 차트 + 자체 계산값 -->
    <div v-if="hasImage" class="split">
      <NatalChartImage
        :image-id="imageId"
        @change="$emit('change-image')"
        @delete="$emit('delete-image')"
      />

      <div v-if="natal" class="side">
        <p class="eyebrow">자체 계산 핵심값</p>
        <dl class="key-values">
          <div>
            <dt>태양</dt>
            <dd>{{ natal.sun.sign.name }} {{ natal.sun.degree }}°</dd>
          </div>
          <div>
            <dt>달</dt>
            <dd>{{ natal.moon.sign.name }} {{ natal.moon.degree }}°</dd>
          </div>
          <div>
            <dt>상승궁</dt>
            <dd>{{ natal.hasAngles ? natal.ascendantSign.name : '계산 불가' }}</dd>
          </div>
          <div>
            <dt>MC</dt>
            <dd>{{ natal.hasAngles ? natal.midheavenSign.name : '계산 불가' }}</dd>
          </div>
          <div v-if="transitMoon">
            <dt>오늘 트랜짓 달</dt>
            <dd>{{ transitMoon.sign.name }} {{ transitMoon.degree }}°</dd>
          </div>
        </dl>

        <p class="note note--info lift-box">
          Astro-Seek는 Placidus 하우스를 쓸 수 있고 이 화면의 자체 계산은 Whole Sign 방식입니다.
          행성이 든 별자리는 거의 같아도 하우스 번호 표기는 달라질 수 있습니다.
        </p>
      </div>
    </div>

    <!-- 이미지가 없을 때: 등록 안내 -->
    <div v-else-if="sign" class="invite">
      <p class="note lift-box">
        더 정확한 별자리 운세를 원하면 Astro-Seek에서 Birth chart 이미지를 내려받아 등록해 주세요.
        지금은 생년월일시와 출생지역으로 계산한 결과를 기준으로 보여 드립니다.
      </p>
      <RouterLink to="/settings" class="pill pill--solid">설정에서 차트 등록</RouterLink>
    </div>

    <p v-if="!sign" class="note">별자리를 계산하려면 생년월일을 먼저 설정해 주세요.</p>
  </div>
</template>

<style scoped>
.display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hero-sign {
  display: flex;
  justify-content: center;
  padding: 4px 0 8px;
}

.split {
  display: grid;
  gap: 26px;
  grid-template-columns: 1fr;
  align-items: start;
}

@media (min-width: 880px) {
  .split {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

.key-values {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 14px;
  margin: 14px 0 0;
}

.key-values div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

dt {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
}

dd {
  margin: 0;
  color: var(--text-bright);
  font-weight: 500;
  font-size: 0.99rem;
}

.note {
  margin: 16px 0;
  padding: 13px 16px;
  border-radius: var(--radius-inner);
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--line-faint);
  font-size: 0.93rem;
  color: var(--text-muted);
  line-height: 1.75;
}

.note--info {
  border-color: rgba(169, 155, 255, 0.28);
  background: rgba(169, 155, 255, 0.06);
}

.invite {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.invite .note {
  max-width: none;
}
</style>
