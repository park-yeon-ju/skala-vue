<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProfileStore } from '@/stores/profileStore'
import { useAstrologyStore } from '@/stores/astrologyStore'
import { todayKey, formatKoreanDate } from '@/utils/datetime'
import { sunSignOf, signFromLongitude } from '@/constants/zodiacSigns'

import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import DateNavigator from '@/components/common/DateNavigator.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import ChartOrZodiacDisplay from '@/components/astrology/ChartOrZodiacDisplay.vue'
import AstrologySummary from '@/components/astrology/AstrologySummary.vue'
import FortuneHero from '@/components/fortune/FortuneHero.vue'
import EnergyCard from '@/components/fortune/EnergyCard.vue'
import CategoryScoreCard from '@/components/fortune/CategoryScoreCard.vue'
import ActionGuide from '@/components/fortune/ActionGuide.vue'
import LuckyItemCard from '@/components/fortune/LuckyItemCard.vue'
import FortuneEvidence from '@/components/fortune/FortuneEvidence.vue'

const router = useRouter()
const profile = useProfileStore()
const store = useAstrologyStore()

const selectedDate = ref(todayKey())
const fortune = computed(() => store.fortune)
const natal = computed(() => store.natal)

/** 차트 이미지가 없을 때 보여줄 태양 별자리 — 자체 계산값을 우선 쓴다. */
const displaySign = computed(() => {
  if (natal.value?.sun) return signFromLongitude(natal.value.sun.longitude)
  const parts = profile.birthParts
  return parts ? sunSignOf(parts.month, parts.day) : null
})

function reload() {
  if (!profile.isProfileComplete) return
  store.loadFortune(selectedDate.value)
}

watch(selectedDate, reload)

onMounted(() => {
  if (!profile.loaded) profile.loadProfile()
  reload()
})

async function handleDeleteImage() {
  await profile.deleteChartImage()
  ElMessage.success('차트 이미지를 삭제했습니다. 자체 계산 결과로 전환됩니다.')
}
</script>

<template>
  <div class="shell">
    <section v-if="!profile.isProfileComplete" class="section">
      <ErrorState
        variant="setup"
        title="별자리를 계산하려면 생년월일이 필요합니다"
        message="설정에서 생년월일을 저장하면 출생 차트와 오늘의 트랜짓을 계산해 드립니다. 출생시각과 출생지역까지 있으면 상승궁과 하우스도 함께 계산합니다."
        action-label="설정으로 이동"
        @action="router.push('/settings')"
      />
    </section>

    <template v-else>
      <section class="section head">
        <p class="eyebrow">ASTROLOGY · TRANSITS</p>
        <h1 class="display-lg">별자리 운세</h1>
        <p class="lede">
          출생 차트와 선택한 날짜의 트랜짓 각도만으로 계산합니다. 사주 결과는 섞지 않습니다.
        </p>
        <DateNavigator v-model="selectedDate" class="date-nav" />
        <p class="date-line mono">{{ formatKoreanDate(selectedDate) }}</p>
      </section>

      <LoadingState v-if="store.loading && !fortune" message="출생 차트와 트랜짓을 계산하는 중입니다" />

      <section v-else-if="store.error" class="section">
        <ErrorState title="별자리를 계산하지 못했습니다" :message="store.error" action-label="다시 시도" @action="reload" />
      </section>

      <template v-else-if="fortune && natal">
        <!-- 차트 이미지 또는 별자리 일러스트 (조건부 렌더링) -->
        <section class="section">
          <BaseDashboardCard
            :title="profile.hasChartImage ? '등록한 출생 차트' : '태양 별자리'"
            icon="✧"
          >
            <ChartOrZodiacDisplay
              :has-image="profile.hasChartImage"
              :image-id="profile.chartImageId"
              :sign="displaySign"
              :natal="natal"
              :transit-moon="fortune.detail?.transit?.moon"
              @change-image="router.push('/settings')"
              @delete-image="handleDeleteImage"
            />
          </BaseDashboardCard>
        </section>

        <!-- 기본 별자리 정보 -->
        <section class="section">
          <BaseDashboardCard title="기본 별자리 정보" icon="◈">
            <AstrologySummary :natal="natal" :fortune="fortune" />
          </BaseDashboardCard>
        </section>

        <FortuneHero :fortune="fortune" eyebrow="별자리 기준 종합" />

        <section class="section">
          <BaseDashboardCard title="오늘의 기운" icon="✦">
            <EnergyCard :energy="fortune.energy" />
          </BaseDashboardCard>
        </section>

        <section class="section">
          <header class="section-head">
            <div>
              <p class="eyebrow">CATEGORY SCORES</p>
              <h2 class="display-md">종목별 별자리 운세</h2>
            </div>
          </header>
          <div class="grid grid-cards">
            <CategoryScoreCard v-for="cat in fortune.categories" :key="cat.key" :category="cat" />
          </div>
        </section>

        <section class="section">
          <BaseDashboardCard title="오늘의 운세" icon="◇">
            <ActionGuide
              :recommended="fortune.recommendedActions"
              :cautions="fortune.cautionActions"
              :advice="fortune.advice"
              :outlook="fortune.outlook"
            />
          </BaseDashboardCard>
        </section>

        <section class="section">
          <div class="grid grid-two">
            <BaseDashboardCard title="행운 정보" icon="✧">
              <LuckyItemCard :lucky="fortune.lucky" />
            </BaseDashboardCard>

            <BaseDashboardCard title="주요 천체 각과 판단 근거" icon="≡">
              <FortuneEvidence
                :basis="fortune.basis"
                :categories="fortune.categories"
                note="행성 위치는 astronomy-engine으로 계산하며, 하우스는 Whole Sign 방식입니다. 등록한 Astro-Seek 이미지는 참고 자료로만 표시하고 자동 판독하지 않습니다."
              />
            </BaseDashboardCard>
          </div>
        </section>
      </template>
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

.date-nav {
  margin-top: 26px;
}

.date-line {
  margin: 12px 0 0;
  color: var(--text-dim);
}
</style>
