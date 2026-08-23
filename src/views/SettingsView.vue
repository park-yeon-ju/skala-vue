<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProfileStore } from '@/stores/profileStore'
import { useSajuStore } from '@/stores/sajuStore'
import { useAstrologyStore } from '@/stores/astrologyStore'
import { useIntegratedFortuneStore } from '@/stores/integratedFortuneStore'

import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import ProfileForm from '@/components/settings/ProfileForm.vue'
import NatalChartUploader from '@/components/settings/NatalChartUploader.vue'

const router = useRouter()
const profile = useProfileStore()
const saju = useSajuStore()
const astrology = useAstrologyStore()
const integrated = useIntegratedFortuneStore()

const uploading = ref(false)

onMounted(() => {
  if (!profile.loaded) profile.loadProfile()
})

/** 설정이 바뀌면 계산 결과 캐시를 모두 버린다. */
function invalidateAll() {
  integrated.invalidate()
  saju.invalidate()
  astrology.invalidate()
}

function handleSave(values) {
  profile.saveProfile(values)
  invalidateAll()
  ElMessage.success('설정을 저장했습니다.')
}

async function handleReset() {
  try {
    await ElMessageBox.confirm(
      '저장된 모든 설정과 등록한 차트 이미지가 삭제됩니다. 계속할까요?',
      '설정 초기화',
      { confirmButtonText: '초기화', cancelButtonText: '취소', type: 'warning' },
    )
    await profile.resetProfile()
    invalidateAll()
    ElMessage.success('설정을 초기화했습니다.')
  } catch {
    // 취소
  }
}

async function handleUpload(file) {
  uploading.value = true
  try {
    await profile.saveChartImage(file)
    astrology.invalidate()
    ElMessage.success('차트 이미지를 등록했습니다.')
  } catch (e) {
    ElMessage.error(e?.message ?? '이미지를 저장하지 못했습니다.')
  } finally {
    uploading.value = false
  }
}

async function handleRemoveImage() {
  await profile.deleteChartImage()
  astrology.invalidate()
  ElMessage.success('차트 이미지를 삭제했습니다.')
}

/** 저장된 값으로 만세력을 미리 계산해 확인용으로 보여준다. */
const preview = computed(() => {
  const input = profile.manseInput
  if (!input) return null
  const result = saju.previewManse(input)
  return result.error ? { error: result.error } : result
})
</script>

<template>
  <div class="shell">
    <section class="section head">
      <p class="eyebrow">SETTINGS</p>
      <h1 class="display-lg">설정</h1>
      <p class="lede">
        여기에 입력한 정보로 사주와 별자리를 계산합니다. 모든 값은 이 브라우저에만 저장되며 외부로 전송되지 않습니다.
      </p>
    </section>

    <section class="section">
      <BaseDashboardCard title="기본 정보" icon="◈">
        <ProfileForm :profile="profile" @save="handleSave" @reset="handleReset" />
      </BaseDashboardCard>
    </section>

    <!-- 저장값 검산 -->
    <section v-if="preview" class="section">
      <BaseDashboardCard title="입력값 확인" icon="≡">
        <div v-if="preview.error" class="preview-error">{{ preview.error }}</div>
        <dl v-else class="preview">
          <div>
            <dt>변환된 양력 생일</dt>
            <dd>
              {{ preview.solarDate.year }}-{{ String(preview.solarDate.month).padStart(2, '0') }}-{{ String(preview.solarDate.day).padStart(2, '0') }}
              <span v-if="profile.calendar === 'lunar'" class="mono tag">음력 입력</span>
            </dd>
          </div>
          <div>
            <dt>만세력 (시 · 일 · 월 · 년)</dt>
            <dd class="pillars">
              {{ preview.pillars.hour?.han ?? '미상' }} ·
              {{ preview.pillars.day.han }} ·
              {{ preview.pillars.month.han }} ·
              {{ preview.pillars.year.han }}
            </dd>
          </div>
          <div>
            <dt>대운</dt>
            <dd>{{ preview.daeun.startAge }}세 {{ preview.daeun.direction }}</dd>
          </div>
          <div>
            <dt>상승궁 계산</dt>
            <dd>
              {{ profile.hasBirthTime && profile.hasBirthPlace ? '가능' : '불가 — 출생시각·출생지역이 모두 필요합니다' }}
            </dd>
          </div>
        </dl>
      </BaseDashboardCard>
    </section>

    <!-- 차트 이미지 -->
    <section class="section">
      <BaseDashboardCard title="별자리 차트 이미지" icon="✧">
        <template #action>
          <span v-if="uploading" class="mono uploading">저장 중…</span>
        </template>
        <NatalChartUploader
          :image-id="profile.chartImageId"
          @upload="handleUpload"
          @remove="handleRemoveImage"
        />
      </BaseDashboardCard>
    </section>

    <section v-if="profile.isProfileComplete" class="section go">
      <button class="pill" type="button" @click="router.push('/')">오늘의 통합 운세 보기</button>
    </section>
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

.preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin: 0;
}

.preview div {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
}

.pillars {
  font-family: var(--font-display);
  font-size: 1.23rem;
  letter-spacing: 0.04em;
}

.tag {
  margin-left: 8px;
  padding: 2px 7px;
  border: 1px solid var(--line-faint);
  border-radius: 999px;
  font-size: 0.78rem;
  color: var(--text-dim);
}

.preview-error {
  color: var(--tone-danger);
  font-size: 0.93rem;
}

.uploading {
  color: var(--text-dim);
  font-size: 0.78rem;
}

.go {
  border-top: none;
  padding-top: 0;
}
</style>
