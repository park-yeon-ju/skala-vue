<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profileStore'
import { useSajuStore } from '@/stores/sajuStore'
import { todayKey, formatKoreanDate } from '@/utils/datetime'

import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import DateNavigator from '@/components/common/DateNavigator.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import ErrorState from '@/components/common/ErrorState.vue'
import FourPillarsTable from '@/components/saju/FourPillarsTable.vue'
import SajuSummary from '@/components/saju/SajuSummary.vue'
import FortuneHero from '@/components/fortune/FortuneHero.vue'
import EnergyCard from '@/components/fortune/EnergyCard.vue'
import CategoryScoreCard from '@/components/fortune/CategoryScoreCard.vue'
import ActionGuide from '@/components/fortune/ActionGuide.vue'
import LuckyItemCard from '@/components/fortune/LuckyItemCard.vue'
import FortuneEvidence from '@/components/fortune/FortuneEvidence.vue'

const router = useRouter()
const profile = useProfileStore()
const store = useSajuStore()

const selectedDate = ref(todayKey())
const fortune = computed(() => store.fortune)
const manse = computed(() => store.manse)
const detail = computed(() => fortune.value?.detail ?? null)

function reload() {
  if (!profile.isProfileComplete) return
  store.loadFortune(selectedDate.value)
}

watch(selectedDate, reload)

onMounted(() => {
  if (!profile.loaded) profile.loadProfile()
  reload()
})
</script>

<template>
  <div class="shell">
    <section v-if="!profile.isProfileComplete" class="section">
      <ErrorState
        variant="setup"
        title="사주를 계산하려면 생년월일이 필요합니다"
        message="설정에서 생년월일과 성별을 저장하면 만세력 여덟 글자와 오늘의 사주 운세를 계산해 드립니다."
        action-label="설정으로 이동"
        @action="router.push('/settings')"
      />
    </section>

    <template v-else>
      <section class="section head">
        <p class="eyebrow">SAJU · FOUR PILLARS</p>
        <h1 class="display-lg">사주 운세</h1>
        <p class="lede">
          원국과 선택한 날짜의 대운·세운·월운·일진 관계만으로 계산합니다. 별자리 결과는 섞지 않습니다.
        </p>
        <DateNavigator v-model="selectedDate" class="date-nav" />
        <p class="date-line mono">{{ formatKoreanDate(selectedDate) }}</p>
      </section>

      <LoadingState v-if="store.loading && !fortune" message="만세력을 계산하는 중입니다" />

      <section v-else-if="store.error" class="section">
        <ErrorState title="사주를 계산하지 못했습니다" :message="store.error" action-label="다시 시도" @action="reload" />
      </section>

      <template v-else-if="fortune && manse">
        <!-- 만세력 8글자 — 페이지 최상단 핵심 영역 -->
        <section class="section">
          <BaseDashboardCard title="만세력 여덟 글자" icon="卦">
            <template #action>
              <span class="mono solar-date">
                양력 {{ manse.solarDate.year }}-{{ String(manse.solarDate.month).padStart(2, '0') }}-{{ String(manse.solarDate.day).padStart(2, '0') }}
              </span>
            </template>
            <FourPillarsTable :pillars="manse.pillars" :has-hour="manse.hasHour" />
          </BaseDashboardCard>
        </section>

        <!-- 원국 요약 -->
        <section class="section">
          <BaseDashboardCard title="사주 원국 요약" icon="◈">
            <SajuSummary :manse="manse" :current-daeun="detail?.currentDaeun" :daily="detail?.daily" />
          </BaseDashboardCard>
        </section>

        <!-- 점수 -->
        <FortuneHero :fortune="fortune" eyebrow="사주 기준 종합" />

        <!-- 오늘의 기운 -->
        <section class="section">
          <BaseDashboardCard title="오늘의 기운" icon="✦">
            <EnergyCard :energy="fortune.energy" />

            <div v-if="detail" class="influence">
              <p class="eyebrow">오늘 작용하는 십성</p>
              <ul class="inf-list">
                <li v-for="inf in detail.influences" :key="inf.key">
                  <span class="inf-label mono">{{ inf.label }}</span>
                  <span class="inf-pillar">{{ inf.pillar.han }}</span>
                  <span class="inf-god">{{ inf.god }}</span>
                  <span class="inf-weight mono">영향도 {{ inf.weight }}</span>
                </li>
              </ul>
            </div>
          </BaseDashboardCard>
        </section>

        <!-- 종목별 -->
        <section class="section">
          <header class="section-head">
            <div>
              <p class="eyebrow">CATEGORY SCORES</p>
              <h2 class="display-md">종목별 사주 운세</h2>
            </div>
          </header>
          <div class="grid grid-cards">
            <CategoryScoreCard v-for="cat in fortune.categories" :key="cat.key" :category="cat" />
          </div>
        </section>

        <!-- 행동 가이드 -->
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

        <!-- 행운 + 근거 -->
        <section class="section">
          <div class="grid grid-two">
            <BaseDashboardCard title="행운 정보" icon="✧">
              <LuckyItemCard :lucky="fortune.lucky" />
            </BaseDashboardCard>

            <BaseDashboardCard title="판단 근거" icon="≡">
              <FortuneEvidence
                :basis="fortune.basis"
                :categories="fortune.categories"
                note="절입 시각은 태양 황경을 직접 계산해 판정하며, 대운은 년간의 음양과 성별로 방향을 정합니다. 합·충·형·파·해는 이번 버전에서 점수에 반영하지 않았습니다."
              />
            </BaseDashboardCard>
          </div>
        </section>

        <!-- 대운 흐름 -->
        <section v-if="manse.daeun" class="section">
          <BaseDashboardCard title="대운 흐름" icon="⟶">
            <p class="daeun-meta mono">
              {{ manse.daeun.direction }} · {{ manse.daeun.startAge }}세 시작
              <span v-if="manse.daeun.daysToTerm !== null">
                · 절입까지 {{ manse.daeun.daysToTerm }}일
              </span>
            </p>
            <div class="scroll-x">
              <ul class="daeun-list">
                <li
                  v-for="item in manse.daeun.list"
                  :key="item.age"
                  :class="{ current: detail?.currentDaeun?.age === item.age }"
                >
                  <span class="d-age mono">{{ item.age }}세</span>
                  <span class="d-pillar">{{ item.pillar.han }}</span>
                  <span class="d-ko">{{ item.pillar.ko }}</span>
                </li>
              </ul>
            </div>
          </BaseDashboardCard>
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

.solar-date {
  color: var(--text-dim);
  font-size: 0.78rem;
}

.influence {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--line-faint);
}

.inf-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
}

.inf-list li {
  display: grid;
  grid-template-columns: 62px 46px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line-faint);
}

.inf-label {
  color: var(--text-dim);
  font-size: 0.78rem;
}

.inf-pillar {
  font-family: var(--font-display);
  font-size: 1.18rem;
  font-weight: 200;
  color: var(--text-bright);
}

.inf-god {
  color: var(--accent);
  font-size: 0.93rem;
}

.inf-weight {
  color: var(--text-dim);
  font-size: 0.78rem;
}

.daeun-meta {
  margin: 0 0 16px;
  color: var(--text-muted);
}

.daeun-list {
  list-style: none;
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 0 0 6px;
  min-width: 560px;
}

.daeun-list li {
  flex: 1;
  min-width: 64px;
  border: 1px solid var(--line-faint);
  padding: 12px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.daeun-list li.current {
  border-color: var(--accent-soft);
  background: rgba(139, 124, 246, 0.07);
}

.d-age {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.d-pillar {
  font-family: var(--font-display);
  font-size: 1.28rem;
  font-weight: 200;
  color: var(--text-bright);
}

.d-ko {
  font-size: 0.82rem;
  color: var(--text-muted);
}
</style>
