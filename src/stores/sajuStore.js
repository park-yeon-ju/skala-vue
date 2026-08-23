/**
 * sajuStore — 사주 원국과 선택 날짜의 운세.
 * 점성술 결과는 이 스토어에 들어오지 않는다.
 */
import { ref, computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useProfileStore } from './profileStore'
import { calculateManse, kstToDate } from '@/utils/manse_calculator'
import { buildSajuDailyFortune } from '@/utils/saju_daily_fortune'
import { todayKey, keyToDate } from '@/utils/datetime'

export const useSajuStore = defineStore('saju', () => {
  const profile = useProfileStore()

  const selectedDate = ref(todayKey())
  const manse = shallowRef(null)
  const fortune = shallowRef(null)
  const loading = ref(false)
  const error = ref(null)

  // 날짜별 결과 캐시 — 같은 날짜를 다시 열면 재계산하지 않는다.
  const cache = new Map()

  const isReady = computed(() => Boolean(manse.value && fortune.value))
  const hasHourPillar = computed(() => Boolean(manse.value?.hasHour))

  function cacheKey(dateKey) {
    const input = profile.manseInput
    if (!input) return null
    return `${JSON.stringify(input)}::${dateKey}`
  }

  /** 원국 계산 — 설정이 바뀌면 다시 부른다. */
  function buildManse() {
    const input = profile.manseInput
    if (!input) {
      manse.value = null
      error.value = '생년월일을 먼저 설정해 주세요.'
      return null
    }
    const result = calculateManse(input)
    if (result.error) {
      manse.value = null
      error.value = result.error
      return null
    }
    manse.value = result
    error.value = null
    return result
  }

  /** 선택 날짜의 사주 운세 계산 */
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
      const base = manse.value ?? buildManse()
      if (!base) return null
      const target = keyToDate(dateKey)
      const result = buildSajuDailyFortune(base, target)
      cache.set(key, result)
      fortune.value = result
      error.value = null
      return result
    } catch (e) {
      error.value = e?.message ?? '사주 운세를 계산하는 중 오류가 발생했습니다.'
      fortune.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function setDate(dateKey) {
    return loadFortune(dateKey)
  }

  /** 설정이 바뀌면 원국과 캐시를 통째로 비운다. */
  function invalidate() {
    cache.clear()
    manse.value = null
    fortune.value = null
  }

  /** 오늘 기준 원국을 만들어 두기만 하는 용도 (설정 화면 미리보기) */
  function previewManse(input) {
    return calculateManse(input)
  }

  return {
    selectedDate, manse, fortune, loading, error,
    isReady, hasHourPillar,
    buildManse, loadFortune, setDate, invalidate, previewManse,
    kstToDate,
  }
})
