/**
 * profileStore — 사용자 설정. localStorage에 저장하고 새로고침 시 복원한다.
 * 차트 이미지 자체는 IndexedDB에 두고 여기에는 id만 남긴다.
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { DEFAULT_REGION_CODE, findRegion } from '@/constants/regions'
import { sunSignOf } from '@/constants/zodiacSigns'
import { saveChartImage, deleteChartImage } from '@/services/imageStorageService'
import { DEFAULT_PROFILE, isSampleChart } from '@/constants/defaultProfile'

const STORAGE_KEY = 'the-aura:profile'

function emptyProfile() {
  return {
    nickname: '',
    gender: 'female',
    calendar: 'solar',
    leapMonth: false,
    birthDate: '',
    birthTime: '',
    birthTimeUnknown: false,
    birthPlace: '',
    birthPlaceUnknown: false,
    currentRegion: DEFAULT_REGION_CODE,
    temperatureUnit: 'celsius',
    chartImageId: null,
  }
}

export const useProfileStore = defineStore('profile', () => {
  const nickname = ref('')
  const gender = ref('female')
  const calendar = ref('solar')
  const leapMonth = ref(false)
  const birthDate = ref('')
  const birthTime = ref('')
  const birthTimeUnknown = ref(false)
  const birthPlace = ref('')
  const birthPlaceUnknown = ref(false)
  const currentRegion = ref(DEFAULT_REGION_CODE)
  const temperatureUnit = ref('celsius')
  const chartImageId = ref(null)
  const loaded = ref(false)

  // --- getters -------------------------------------------------------------

  const isProfileComplete = computed(
    () => Boolean(nickname.value.trim()) && Boolean(birthDate.value) && Boolean(currentRegion.value),
  )
  const hasBirthTime = computed(() => !birthTimeUnknown.value && Boolean(birthTime.value))
  const hasBirthPlace = computed(() => !birthPlaceUnknown.value && Boolean(birthPlace.value))
  const hasChartImage = computed(() => Boolean(chartImageId.value))

  const birthRegion = computed(() => (hasBirthPlace.value ? findRegion(birthPlace.value) : null))
  const currentRegionInfo = computed(() => findRegion(currentRegion.value))

  const birthParts = computed(() => {
    if (!birthDate.value) return null
    const [y, m, d] = birthDate.value.split('-').map(Number)
    if (!y || !m || !d) return null
    let hour = null
    let minute = 0
    if (hasBirthTime.value) {
      const [hh, mm] = birthTime.value.split(':').map(Number)
      if (Number.isFinite(hh)) {
        hour = hh
        minute = Number.isFinite(mm) ? mm : 0
      }
    }
    return { year: y, month: m, day: d, hour, minute }
  })

  /** 양력 생일 기준 태양 별자리 — 음력 입력이면 변환 후 계산해야 하므로 여기서는 양력일 때만 쓴다. */
  const userSunSign = computed(() => {
    const parts = birthParts.value
    if (!parts || calendar.value !== 'solar') return null
    return sunSignOf(parts.month, parts.day)
  })

  /** 계산 모듈에 그대로 넘길 입력 묶음 */
  const manseInput = computed(() => {
    const parts = birthParts.value
    if (!parts) return null
    return {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      gender: gender.value,
      calendar: calendar.value,
      leapMonth: leapMonth.value,
    }
  })

  // --- actions -------------------------------------------------------------

  /** 값 묶음을 그대로 상태에 적용한다. */
  function apply(saved) {
    nickname.value = saved.nickname
    gender.value = saved.gender
    calendar.value = saved.calendar
    leapMonth.value = saved.leapMonth
    birthDate.value = saved.birthDate
    birthTime.value = saved.birthTime
    birthTimeUnknown.value = saved.birthTimeUnknown
    birthPlace.value = saved.birthPlace
    birthPlaceUnknown.value = saved.birthPlaceUnknown
    currentRegion.value = saved.currentRegion || DEFAULT_REGION_CODE
    temperatureUnit.value = saved.temperatureUnit || 'celsius'
    chartImageId.value = saved.chartImageId
  }

  function loadProfile() {
    loaded.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      // 저장된 설정이 없으면 시연용 기본값으로 시작한다.
      if (!raw) {
        apply({ ...emptyProfile(), ...DEFAULT_PROFILE })
        return false
      }
      const saved = { ...emptyProfile(), ...JSON.parse(raw) }
      apply(saved)
      return true
    } catch {
      return false
    }
  }

  function toPlain() {
    return {
      nickname: nickname.value,
      gender: gender.value,
      calendar: calendar.value,
      leapMonth: leapMonth.value,
      birthDate: birthDate.value,
      birthTime: birthTime.value,
      birthTimeUnknown: birthTimeUnknown.value,
      birthPlace: birthPlace.value,
      birthPlaceUnknown: birthPlaceUnknown.value,
      currentRegion: currentRegion.value,
      temperatureUnit: temperatureUnit.value,
      chartImageId: chartImageId.value,
    }
  }

  function saveProfile(next = {}) {
    if (next.nickname !== undefined) nickname.value = String(next.nickname).trim()
    if (next.gender !== undefined) gender.value = next.gender
    if (next.calendar !== undefined) calendar.value = next.calendar
    if (next.leapMonth !== undefined) leapMonth.value = next.leapMonth
    if (next.birthDate !== undefined) birthDate.value = next.birthDate
    if (next.birthTime !== undefined) birthTime.value = next.birthTime
    if (next.birthTimeUnknown !== undefined) birthTimeUnknown.value = next.birthTimeUnknown
    if (next.birthPlace !== undefined) birthPlace.value = next.birthPlace
    if (next.birthPlaceUnknown !== undefined) birthPlaceUnknown.value = next.birthPlaceUnknown
    if (next.currentRegion !== undefined) currentRegion.value = next.currentRegion
    if (next.temperatureUnit !== undefined) temperatureUnit.value = next.temperatureUnit

    // '모름'을 켜면 해당 값을 비운다.
    if (birthTimeUnknown.value) birthTime.value = ''
    if (birthPlaceUnknown.value) birthPlace.value = ''

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
    return true
  }

  async function resetProfile() {
    // 번들에 들어 있는 예시 차트는 지울 대상이 아니다.
    if (chartImageId.value && !isSampleChart(chartImageId.value)) {
      await deleteChartImage(chartImageId.value)
    }
    const blank = emptyProfile()
    nickname.value = blank.nickname
    gender.value = blank.gender
    calendar.value = blank.calendar
    leapMonth.value = blank.leapMonth
    birthDate.value = blank.birthDate
    birthTime.value = blank.birthTime
    birthTimeUnknown.value = blank.birthTimeUnknown
    birthPlace.value = blank.birthPlace
    birthPlaceUnknown.value = blank.birthPlaceUnknown
    currentRegion.value = blank.currentRegion
    temperatureUnit.value = blank.temperatureUnit
    chartImageId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  async function saveChartImageFile(file) {
    const previous = chartImageId.value
    const id = await saveChartImage(file)
    chartImageId.value = id
    if (previous && !isSampleChart(previous)) await deleteChartImage(previous)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
    return id
  }

  async function removeChartImage() {
    if (!chartImageId.value) return
    if (!isSampleChart(chartImageId.value)) await deleteChartImage(chartImageId.value)
    chartImageId.value = null
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPlain()))
  }

  return {
    nickname, gender, calendar, leapMonth,
    birthDate, birthTime, birthTimeUnknown,
    birthPlace, birthPlaceUnknown,
    currentRegion, temperatureUnit, chartImageId, loaded,
    isProfileComplete, hasBirthTime, hasBirthPlace, hasChartImage,
    birthRegion, currentRegionInfo, birthParts, userSunSign, manseInput,
    loadProfile, saveProfile, resetProfile,
    saveChartImage: saveChartImageFile,
    deleteChartImage: removeChartImage,
  }
})
