<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { REGIONS } from '@/constants/regions'
import { isFutureDate, todayKey } from '@/utils/datetime'

const props = defineProps({
  profile: { type: Object, required: true },
})
const emit = defineEmits(['save', 'reset'])

// 스토어를 직접 수정하지 않고 폼 로컬 상태로 복사해 쓴다.
const form = reactive({
  nickname: '',
  gender: 'female',
  calendar: 'solar',
  leapMonth: false,
  birthDate: '',
  birthTime: '',
  birthTimeUnknown: false,
  birthPlace: '',
  birthPlaceUnknown: false,
  currentRegion: 'seoul',
  temperatureUnit: 'celsius',
})

const errors = reactive({ nickname: '', birthDate: '', currentRegion: '' })
const formRef = ref(null)

function syncFromStore() {
  form.nickname = props.profile.nickname
  form.gender = props.profile.gender
  form.calendar = props.profile.calendar
  form.leapMonth = props.profile.leapMonth
  form.birthDate = props.profile.birthDate
  form.birthTime = props.profile.birthTime
  form.birthTimeUnknown = props.profile.birthTimeUnknown
  form.birthPlace = props.profile.birthPlace
  form.birthPlaceUnknown = props.profile.birthPlaceUnknown
  form.currentRegion = props.profile.currentRegion
  form.temperatureUnit = props.profile.temperatureUnit
}

watch(() => props.profile.loaded, syncFromStore, { immediate: true })
watch(() => props.profile.nickname, syncFromStore)

// '모름'을 켜면 해당 입력을 비우고 비활성화한다.
watch(
  () => form.birthTimeUnknown,
  (unknown) => {
    if (unknown) form.birthTime = ''
  },
)
watch(
  () => form.birthPlaceUnknown,
  (unknown) => {
    if (unknown) form.birthPlace = ''
  },
)
// 양력으로 바꾸면 윤달 표시는 의미가 없다.
watch(
  () => form.calendar,
  (cal) => {
    if (cal === 'solar') form.leapMonth = false
  },
)

const maxDate = computed(() => todayKey())

function validate() {
  errors.nickname = ''
  errors.birthDate = ''
  errors.currentRegion = ''

  const trimmed = form.nickname.trim()
  if (!trimmed) errors.nickname = '닉네임을 입력해 주세요.'
  if (!form.birthDate) errors.birthDate = '생년월일을 선택해 주세요.'
  else if (isFutureDate(form.birthDate)) errors.birthDate = '생년월일은 미래 날짜를 선택할 수 없습니다.'
  if (!form.currentRegion) errors.currentRegion = '현재 지역을 선택해 주세요.'

  return !errors.nickname && !errors.birthDate && !errors.currentRegion
}

function submit() {
  if (!validate()) {
    ElMessage.error('입력값을 다시 확인해 주세요.')
    return
  }
  emit('save', { ...form, nickname: form.nickname.trim() })
}
</script>

<template>
  <form ref="formRef" class="profile-form" novalidate @submit.prevent="submit">
    <div class="field-grid">
      <!-- 닉네임 -->
      <div class="field">
        <label class="label" for="nickname">이름 또는 닉네임 <span class="req">필수</span></label>
        <el-input id="nickname" v-model="form.nickname" placeholder="화면에 표시할 이름" maxlength="20" />
        <p class="hint">닉네임은 화면 표시용이며 운세 계산에는 사용하지 않습니다.</p>
        <p v-if="errors.nickname" class="error">{{ errors.nickname }}</p>
      </div>

      <!-- 성별 -->
      <div class="field">
        <span class="label">성별 <span class="req">필수</span></span>
        <el-radio-group v-model="form.gender" aria-label="성별">
          <el-radio value="female">여성</el-radio>
          <el-radio value="male">남성</el-radio>
        </el-radio-group>
        <p class="hint">대운의 진행 방향(순행·역행)을 정하는 데 쓰입니다.</p>
      </div>

      <!-- 양력 / 음력 -->
      <div class="field">
        <span class="label">달력 기준 <span class="req">필수</span></span>
        <el-radio-group v-model="form.calendar" aria-label="달력 기준">
          <el-radio value="solar">양력</el-radio>
          <el-radio value="lunar">음력</el-radio>
        </el-radio-group>
        <el-checkbox v-if="form.calendar === 'lunar'" v-model="form.leapMonth" class="leap">
          윤달로 태어났습니다
        </el-checkbox>
      </div>

      <!-- 생년월일 -->
      <div class="field">
        <label class="label" for="birth-date">생년월일 <span class="req">필수</span></label>
        <el-date-picker
          id="birth-date"
          v-model="form.birthDate"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY년 M월 D일"
          placeholder="생년월일 선택"
          :disabled-date="(d) => d > new Date()"
          class="full"
        />
        <p class="hint">{{ form.calendar === 'lunar' ? '음력 기준 날짜를 입력하세요.' : '양력 기준 날짜를 입력하세요.' }} (오늘 이후 날짜는 선택할 수 없습니다: {{ maxDate }})</p>
        <p v-if="errors.birthDate" class="error">{{ errors.birthDate }}</p>
      </div>

      <!-- 태어난 시각 -->
      <div class="field">
        <label class="label" for="birth-time">태어난 시각 <span class="opt">선택</span></label>
        <el-time-picker
          id="birth-time"
          v-model="form.birthTime"
          value-format="HH:mm"
          format="HH:mm"
          placeholder="시:분"
          :disabled="form.birthTimeUnknown"
          class="full"
        />
        <el-checkbox v-model="form.birthTimeUnknown" class="unknown">태어난 시각 모름</el-checkbox>
        <p class="hint">시각을 모르면 시주를 제외한 6글자로 간이 해석합니다.</p>
      </div>

      <!-- 출생지역 -->
      <div class="field">
        <label class="label" for="birth-place">출생지역 <span class="opt">선택</span></label>
        <el-select
          id="birth-place"
          v-model="form.birthPlace"
          placeholder="출생지역 선택"
          :disabled="form.birthPlaceUnknown"
          clearable
          class="full"
        >
          <el-option v-for="r in REGIONS" :key="r.code" :label="r.label" :value="r.code" />
        </el-select>
        <el-checkbox v-model="form.birthPlaceUnknown" class="unknown">출생지역 모름</el-checkbox>
        <p class="hint">상승궁과 하우스를 계산하려면 출생시각과 출생지역이 모두 필요합니다.</p>
      </div>

      <!-- 현재 지역 -->
      <div class="field">
        <label class="label" for="current-region">현재 지역 <span class="req">필수</span></label>
        <el-select id="current-region" v-model="form.currentRegion" placeholder="현재 지역 선택" class="full">
          <el-option v-for="r in REGIONS" :key="r.code" :label="r.label" :value="r.code" />
        </el-select>
        <p v-if="errors.currentRegion" class="error">{{ errors.currentRegion }}</p>
      </div>

      <!-- 온도 단위 -->
      <div class="field">
        <span class="label">온도 단위 <span class="req">필수</span></span>
        <el-radio-group v-model="form.temperatureUnit" aria-label="온도 단위">
          <el-radio value="celsius">섭씨 ℃</el-radio>
          <el-radio value="fahrenheit">화씨 ℉</el-radio>
        </el-radio-group>
      </div>
    </div>

    <div class="actions">
      <button class="pill" type="submit">저장하기</button>
      <button class="pill pill--ghost" type="button" @click="syncFromStore">되돌리기</button>
      <button class="pill pill--ghost danger" type="button" @click="emit('reset')">전체 초기화</button>
    </div>
  </form>
</template>

<style scoped>
.field-grid {
  display: grid;
  gap: 26px;
  grid-template-columns: 1fr;
}

@media (min-width: 760px) {
  .field-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.label {
  font-family: var(--font-mono);
  font-size: 0.84rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.req,
.opt {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  border: 1px solid var(--line-faint);
}

.req {
  color: var(--accent);
  border-color: var(--accent-soft);
}

.opt {
  color: var(--text-dim);
}

.full {
  width: 100%;
}

.hint {
  margin: 0;
  font-size: 0.87rem;
  color: var(--text-dim);
  line-height: 1.65;
}

.error {
  margin: 0;
  font-size: 0.87rem;
  color: var(--tone-danger);
}

.unknown,
.leap {
  margin-top: 2px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 34px;
  padding-top: 24px;
  border-top: 1px solid var(--line-faint);
  flex-wrap: wrap;
}

.danger:hover {
  border-color: var(--tone-danger);
  color: var(--tone-danger);
  background: rgba(227, 154, 154, 0.06);
}
</style>
