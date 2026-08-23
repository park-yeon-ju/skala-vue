/**
 * astrologyStore — 출생 차트와 선택 날짜의 트랜짓 기반 별자리 운세.
 * 사주 결과는 이 스토어에 들어오지 않는다.
 */
import { ref, computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useProfileStore } from './profileStore'
import { calculateNatalChart } from '@/utils/astro_calculator'
import { buildAstroDailyFortune } from '@/utils/astro_daily_fortune'
import { calculateManse, kstToDate } from '@/utils/manse_calculator'
import { signFromLongitude } from '@/constants/zodiacSigns'
import { todayKey, keyToDate } from '@/utils/datetime'

export const useAstrologyStore = defineStore('astrology', () => {
  const profile = useProfileStore()

  const selectedDate = ref(todayKey())
  const natal = shallowRef(null)
  const fortune = shallowRef(null)
  const loading = ref(false)
  const error = ref(null)

  const cache = new Map()

  const hasAngles = computed(() => Boolean(natal.value?.hasAngles))
  const sunSign = computed(() => natal.value?.sun?.sign ?? null)
  const moonSign = computed(() => natal.value?.moon?.sign ?? null)
  const ascendantSign = computed(() => natal.value?.ascendantSign ?? null)
  const midheavenSign = computed(() => natal.value?.midheavenSign ?? null)

  /** 출생시각 또는 출생지역이 없어 간이 해석인지 */
  const isSimplified = computed(() => !hasAngles.value)

  function cacheKey(dateKey) {
    const input = profile.manseInput
    if (!input) return null
    return `${JSON.stringify(input)}::${profile.birthPlace}::${dateKey}`
  }

  /** 출생 차트 계산 — 음력 입력이면 양력으로 환산한 뒤 사용한다. */
  function buildNatal() {
    const input = profile.manseInput
    if (!input) {
      natal.value = null
      error.value = '생년월일을 먼저 설정해 주세요.'
      return null
    }

    // 음력·양력 환산은 만세력 모듈이 이미 처리하므로 그 결과의 양력 날짜를 쓴다.
    const manse = calculateManse(input)
    if (manse.error) {
      natal.value = null
      error.value = manse.error
      return null
    }

    const solar = manse.solarDate
    const hasTime = profile.hasBirthTime
    const birthDate = kstToDate(
      solar.year,
      solar.month,
      solar.day,
      hasTime ? input.hour : 12,
      hasTime ? input.minute : 0,
    )

    const region = profile.birthRegion
    const chart = calculateNatalChart({
      birthDate,
      hasBirthTime: hasTime,
      latitude: region?.lat ?? null,
      longitude: region?.lon ?? null,
    })

    natal.value = chart
    error.value = null
    return chart
  }

  function loadFortune(dateKey = selectedDate.value) {
    selectedDate.value = dateKey
    const key = cacheKey(dateKey)
    if (!key) {
      error.value = '생년월일을 먼저 설정해 주세요.'
      fortune.value = null
      return null
    }
    if (cache.has(key)) {
      fortune.value = cache.get(key)
      error.value = null
      return fortune.value
    }

    loading.value = true
    try {
      const base = natal.value ?? buildNatal()
      if (!base) return null
      const result = buildAstroDailyFortune(base, keyToDate(dateKey))
      cache.set(key, result)
      fortune.value = result
      error.value = null
      return result
    } catch (e) {
      error.value = e?.message ?? '별자리 운세를 계산하는 중 오류가 발생했습니다.'
      fortune.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function setDate(dateKey) {
    return loadFortune(dateKey)
  }

  function invalidate() {
    cache.clear()
    natal.value = null
    fortune.value = null
  }

  return {
    selectedDate, natal, fortune, loading, error,
    hasAngles, isSimplified, sunSign, moonSign, ascendantSign, midheavenSign,
    buildNatal, loadFortune, setDate, invalidate,
    signFromLongitude,
  }
})
