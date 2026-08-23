<script setup>
import { computed, ref } from 'vue'
import ConstellationGalleryDialog from './ConstellationGalleryDialog.vue'

const props = defineProps({
  sky: { type: Object, default: null },
})

const VISIBILITY_COLOR = {
  good: 'var(--tone-excellent)',
  fair: 'var(--tone-caution)',
  low: 'var(--tone-danger)',
}

const color = computed(() => VISIBILITY_COLOR[props.sky?.visibility] ?? 'var(--text-dim)')

// 별자리를 누르면 NASA 공개 이미지를 모아 보여준다.
const galleryOpen = ref(false)
const galleryTarget = ref(null)

function openGallery(item) {
  galleryTarget.value = item
  galleryOpen.value = true
}
</script>

<template>
  <div v-if="sky" class="sky-card">
    <!-- 아직 밝으면 관측이 어렵다는 안내를 먼저 띄운다 -->
    <p v-if="sky.daylightNote" class="daylight">
      {{ sky.daylightNote }}
      <span class="mono">(태양 고도 {{ sky.solarAltitude }}°)</span>
    </p>

    <dl class="facts">
      <div>
        <dt>가장 보기 좋은 시간대</dt>
        <dd>{{ sky.bestTime }}</dd>
      </div>
      <div>
        <dt>관측 가능성</dt>
        <dd>
          <span class="dot" :style="{ background: color }" aria-hidden="true" />
          <span :style="{ color }">{{ sky.visibilityLabel }}</span>
        </dd>
      </div>
      <div>
        <dt>구름량</dt>
        <dd>{{ sky.clouds === null ? '데이터 없음' : `${sky.clouds}%` }}</dd>
      </div>
    </dl>

    <div v-if="sky.items.length" class="list-wrap">
      <p class="eyebrow">지금 관측 가능한 주요 별자리</p>
      <p class="hint">별자리를 누르면 NASA가 공개한 실제 관측 사진을 볼 수 있습니다.</p>
      <ul class="const-list">
        <li v-for="item in sky.items" :key="item.constellation">
          <button type="button" class="const-btn lift-box" @click="openGallery(item)">
            <span class="c-name">
              {{ item.constellation }}
              <span v-if="item.isZodiac" class="zodiac-tag">황도 12궁</span>
            </span>
            <span class="c-meta mono">{{ item.direction }} · 고도 {{ item.altitude }}°</span>
            <span class="c-star">
              대표 별 {{ item.star }}
              <span class="c-cta">사진 보기 →</span>
            </span>
          </button>
        </li>
      </ul>
    </div>
    <p v-else class="empty">지금 지평선 위로 충분히 올라온 주요 별자리가 없습니다.</p>

    <p class="disclaimer">{{ sky.disclaimer }}</p>

    <ConstellationGalleryDialog v-model="galleryOpen" :target="galleryTarget" />
  </div>

  <p v-else class="empty">관측 정보를 계산하지 못했습니다.</p>
</template>

<style scoped>
.daylight {
  margin: 0 0 20px;
  padding: 12px 14px;
  border: 1px solid var(--line-faint);
  border-left: 1px solid var(--tone-caution);
  font-size: 0.93rem;
  color: var(--text-primary);
}

.daylight .mono {
  color: var(--text-dim);
  margin-left: 6px;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin: 0 0 22px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line-faint);
}

.facts div {
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
  align-items: center;
  gap: 7px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.const-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}

.const-list li {
  border-bottom: 1px solid var(--line-faint);
}

.const-list li:last-child {
  border-bottom: none;
}

.const-btn {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  width: 100%;
  padding: 14px 12px;
  margin: 0 -12px;
  width: calc(100% + 24px);
  border: none;
  border-radius: var(--radius-inner);
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.25s ease;
}

.const-btn:hover {
  background: rgba(169, 155, 255, 0.09);
}

.const-btn:hover .c-cta {
  opacity: 1;
}

.c-cta {
  margin-left: 8px;
  color: var(--accent);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.hint {
  margin: 6px 0 0;
  font-size: 0.87rem;
  color: var(--text-dim);
}

.c-name {
  color: var(--text-bright);
  font-size: 0.99rem;
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 8px;
}

.zodiac-tag {
  padding: 2px 7px;
  border: 1px solid var(--accent-soft);
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.c-meta {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.c-star {
  font-size: 0.87rem;
  color: var(--text-dim);
}

.disclaimer {
  margin: 18px 0 0;
  font-size: 0.87rem;
  color: var(--text-dim);
  line-height: 1.7;
}

.empty {
  color: var(--text-dim);
  font-size: 0.93rem;
  margin: 0;
}

@media (min-width: 560px) {
  .const-btn {
    grid-template-columns: 1fr auto;
    align-items: baseline;
    column-gap: 16px;
  }

  .c-star {
    grid-column: 1 / -1;
  }
}

.const-btn:hover .c-star,
.const-btn:hover .c-meta {
  color: var(--text-primary);
}

</style>
