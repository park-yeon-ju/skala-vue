<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useProfileStore } from '@/stores/profileStore'
import { useWeatherStore } from '@/stores/weatherStore'

import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import RegionSelector from '@/components/daily/RegionSelector.vue'
import WeatherSummary from '@/components/daily/WeatherSummary.vue'
import AirQualityCard from '@/components/daily/AirQualityCard.vue'
import BeautyTipCard from '@/components/daily/BeautyTipCard.vue'
import ConstellationVisibilityCard from '@/components/daily/ConstellationVisibilityCard.vue'

const profile = useProfileStore()
const store = useWeatherStore()

const regionCode = computed({
  get: () => store.activeRegionCode,
  set: (code) => store.setRegion(code),
})

// 하늘 관측 정보는 시간이 지나면 달라지므로 5분마다 갱신한다.
let refreshTimer = null

onMounted(() => {
  if (!profile.loaded) profile.loadProfile()
  store.load()
  refreshTimer = setInterval(() => store.load(true), 5 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})

// 설정에서 기본 지역이 바뀌면(임시 선택이 없을 때만) 따라간다.
watch(
  () => profile.currentRegion,
  () => {
    if (!store.overrideRegionCode) store.load(true)
  },
)
</script>

<template>
  <div class="shell">
    <section class="section head">
      <p class="eyebrow">DAILY LIFE</p>
      <h1 class="display-lg">오늘 하루</h1>
      <p class="lede">
        설정에 저장된 현재 지역을 기본으로 오늘의 날씨, 미세먼지, 뷰티 팁, 관측 가능한 별자리를 보여 드립니다.
      </p>

      <div class="region-row">
        <RegionSelector
          v-model="regionCode"
          :default-region="profile.currentRegion"
          @reset="store.useDefaultRegion()"
        />
      </div>
    </section>

    <LoadingState v-if="store.loading && !store.hasData" message="오늘의 생활 정보를 불러오는 중입니다" :rows="5" />

    <section v-else-if="store.error" class="section">
      <ErrorState title="날씨 정보를 불러오지 못했습니다" :message="store.error" action-label="다시 시도" @action="store.load(true)" />
    </section>

    <section v-else-if="store.isEmpty" class="section">
      <ErrorState variant="empty" title="표시할 데이터가 없습니다" message="선택한 지역의 관측 데이터가 비어 있습니다. 다른 지역을 선택해 보세요." />
    </section>

    <template v-else-if="store.hasData">
      <!-- 날씨 -->
      <section class="section">
        <BaseDashboardCard :title="`${store.activeRegion.label} 오늘의 날씨`" icon="☁">
          <template #action>
            <button class="pill pill--ghost refresh" type="button" :disabled="store.loading" @click="store.load(true)">
              {{ store.loading ? '갱신 중' : '새로고침' }}
            </button>
          </template>
          <WeatherSummary :weather="store.weather" :forecast="store.forecast" />
        </BaseDashboardCard>
      </section>

      <!-- 미세먼지 + 뷰티 팁 -->
      <section class="section">
        <div class="grid grid-two">
          <BaseDashboardCard title="미세먼지" icon="◉">
            <AirQualityCard :air="store.airQuality" />
          </BaseDashboardCard>

          <BaseDashboardCard title="날씨 기반 뷰티 팁 · 외출 준비" icon="✦">
            <BeautyTipCard :tips="store.beautyTips" :context="store.tipContext" />
          </BaseDashboardCard>
        </div>
      </section>

      <!-- 관측 가능 별자리 -->
      <section class="section">
        <BaseDashboardCard title="지금 관측 가능한 주요 별자리" icon="✧">
          <ConstellationVisibilityCard :sky="store.sky" />
        </BaseDashboardCard>
      </section>
    </template>
  </div>
</template>

<style scoped>
.head {
  padding-top: clamp(36px, 6vw, 72px);
}

.lede {
  margin: 16px 0 0;
  color: var(--text-muted);
  max-width: none;
}

.region-row {
  margin-top: 30px;
  padding-top: 24px;
  border-top: 1px solid var(--line-faint);
}

.refresh {
  padding: 6px 14px;
  font-size: 0.78rem;
}
</style>
