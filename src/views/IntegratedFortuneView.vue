<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profileStore'
import { useIntegratedFortuneStore } from '@/stores/integratedFortuneStore'
import { todayKey, formatKoreanDate } from '@/utils/datetime'

import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import DateNavigator from '@/components/common/DateNavigator.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import FortuneHero from '@/components/fortune/FortuneHero.vue'
import EnergyCard from '@/components/fortune/EnergyCard.vue'
import CategoryScoreCard from '@/components/fortune/CategoryScoreCard.vue'
import ActionGuide from '@/components/fortune/ActionGuide.vue'
import LuckyItemCard from '@/components/fortune/LuckyItemCard.vue'
import FortuneEvidence from '@/components/fortune/FortuneEvidence.vue'

const router = useRouter()
const profile = useProfileStore()
const store = useIntegratedFortuneStore()

const selectedDate = ref(todayKey())
const fortune = computed(() => store.fortune)

function reload() {
  if (!profile.isProfileComplete) return
  store.load(selectedDate.value)
}

// 날짜가 바뀌면 해당 날짜의 운세를 다시 계산한다.
watch(selectedDate, reload)
watch(() => profile.isProfileComplete, reload)

onMounted(() => {
  if (!profile.loaded) profile.loadProfile()
  reload()
})

/** 종목 카드에서 상세 페이지로 보낸다. 사주 점수가 더 높으면 사주 쪽으로. */
function openDetail(key) {
  const cat = fortune.value?.categories.find((c) => c.key === key)
  const target = cat && cat.sajuScore >= cat.astrologyScore ? '/saju' : '/astrology'
  router.push(target)
}
</script>

<template>
  <div class="shell">
    <!-- 설정이 없으면 안내와 이동 버튼 -->
    <section v-if="!profile.isProfileComplete" class="section">
      <ErrorState
        variant="setup"
        title="먼저 기본 정보를 설정해 주세요"
        message="닉네임과 생년월일, 현재 지역을 저장하면 오늘의 통합 운세를 계산해 드립니다. 설정한 정보는 이 브라우저에만 저장됩니다."
        action-label="설정으로 이동"
        @action="router.push('/settings')"
      />
    </section>

    <template v-else>
      <!-- 사용자 인사 및 날짜 선택 -->
      <section class="section greeting">
        <div class="greet-top">
          <div>
            <p class="eyebrow">INTEGRATED FORTUNE</p>
            <h1 class="display-xl name">{{ profile.nickname }}님의 오늘</h1>
            <p class="date-line">{{ formatKoreanDate(selectedDate) }}</p>
          </div>
          <RouterLink to="/settings" class="pill pill--ghost">설정 수정</RouterLink>
        </div>
        <DateNavigator v-model="selectedDate" class="date-nav" />
      </section>

      <LoadingState v-if="store.loading && !fortune" message="사주와 별자리를 종합하는 중입니다" />

      <section v-else-if="store.error" class="section">
        <ErrorState title="운세를 계산하지 못했습니다" :message="store.error" action-label="다시 시도" @action="reload" />
      </section>

      <template v-else-if="fortune">
        <!-- 통합 점수 + 한마디 -->
        <FortuneHero :fortune="fortune" eyebrow="사주 · 별자리 종합" />

        <!-- 오늘의 통합 기운 -->
        <section class="section">
          <BaseDashboardCard title="오늘의 통합 기운" icon="✦">
            <EnergyCard :energy="fortune.energy" show-source-tags />
          </BaseDashboardCard>
        </section>

        <!-- 종목별 통합 운세 -->
        <section class="section">
          <header class="section-head">
            <div>
              <p class="eyebrow">CATEGORY SCORES</p>
              <h2 class="display-md">종목별 통합 운세</h2>
            </div>
            <p class="head-note text-dim">각 항목은 사주 점수와 별자리 점수의 평균입니다.</p>
          </header>

          <div class="grid grid-cards">
            <CategoryScoreCard
              v-for="cat in fortune.categories"
              :key="cat.key"
              :category="cat"
              show-breakdown
              detail-label="근거 페이지 보기"
              @open-detail="openDetail"
            />
          </div>

          <!-- 결과가 갈리는 항목 안내 -->
          <div v-if="store.conflicts.length" class="conflict lift-box">
            <p class="eyebrow"><span class="index">!</span><span>서로 다른 흐름</span></p>
            <ul>
              <li v-for="c in store.conflicts" :key="c.key">
                <strong>{{ c.label }}</strong> — 사주 {{ c.sajuScore }}점 / 별자리 {{ c.astrologyScore }}점
                (차이 {{ c.gap }}점). {{ c.description }}
              </li>
            </ul>
          </div>
        </section>

        <!-- 종합 소견 · 행동 가이드 -->
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

        <!-- 행운 정보 + 판단 근거 -->
        <section class="section">
          <div class="grid grid-two">
            <BaseDashboardCard title="통합 행운 정보" icon="✧">
              <LuckyItemCard :lucky="fortune.lucky" />
            </BaseDashboardCard>

            <BaseDashboardCard title="판단 근거" icon="≡">
              <FortuneEvidence
                :basis="fortune.basis"
                :categories="fortune.categories"
                note="이 결과는 검증된 학문적 예측이 아니라 규칙 기반의 간이 해석입니다. 점수는 사주 십성 가중치와 점성술 어스펙트 계산에서 나옵니다."
              />
            </BaseDashboardCard>
          </div>
        </section>

        <!-- 상세 페이지 이동 -->
        <section class="section detail-links">
          <RouterLink to="/saju" class="detail-card lift-box">
            <span class="eyebrow">사주 운세</span>
            <span class="detail-title">원국과 오늘의 일진으로 보는 상세 운세</span>
            <span class="detail-score">{{ fortune.detail.sajuTotal }}점</span>
          </RouterLink>
          <RouterLink to="/astrology" class="detail-card lift-box">
            <span class="eyebrow">별자리 운세</span>
            <span class="detail-title">출생 차트와 오늘 트랜짓으로 보는 상세 운세</span>
            <span class="detail-score">{{ fortune.detail.astrologyTotal }}점</span>
          </RouterLink>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.greeting {
  padding-top: clamp(40px, 7vw, 88px);
}

.greet-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.name {
  margin: 18px 0 10px;
}

.date-line {
  margin: 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.87rem;
  letter-spacing: 0.1em;
}

.date-nav {
  margin-top: 28px;
}

.head-note {
  font-size: 0.87rem;
  margin: 0;
}

.conflict {
  margin-top: 26px;
  padding: 20px 22px;
  border: 1px solid var(--line-faint);
  border-left: 1px solid var(--tone-caution);
  background: rgba(226, 192, 141, 0.04);
}

.conflict ul {
  margin: 14px 0 0;
  padding-left: 18px;
}

.conflict li {
  font-size: 0.93rem;
  color: var(--text-muted);
  margin-bottom: 10px;
  line-height: 1.7;
}

.conflict strong {
  color: var(--text-bright);
  font-weight: 400;
}

.detail-links {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .detail-links {
    grid-template-columns: 1fr 1fr;
  }
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  border: 1px solid var(--line-faint);
  text-decoration: none;
  background: var(--bg-card);
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.detail-card:hover {
  border-color: var(--accent-soft);
  background: var(--bg-card-hover);
}

.detail-title {
  color: var(--text-bright);
  font-size: 1.1rem;
  font-weight: 300;
}

.detail-score {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 200;
  color: var(--accent);
}

.conflict:hover li {
  color: var(--text-bright);
}

</style>
