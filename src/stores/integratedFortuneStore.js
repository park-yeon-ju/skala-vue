/**
 * integratedFortuneStore — 사주와 별자리 결과를 불러와 종합한다.
 * 두 계산의 원본은 각자의 스토어가 갖고, 여기서는 합치는 일만 한다.
 */
import { ref, computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useSajuStore } from './sajuStore'
import { useAstrologyStore } from './astrologyStore'
import { buildIntegratedFortune } from '@/utils/integrated_fortune'
import { todayKey, keyToDate } from '@/utils/datetime'

export const useIntegratedFortuneStore = defineStore('integratedFortune', () => {
  const saju = useSajuStore()
  const astrology = useAstrologyStore()

  const selectedDate = ref(todayKey())
  const fortune = shallowRef(null)
  const loading = ref(false)
  const error = ref(null)

  const isReady = computed(() => Boolean(fortune.value))
  const conflicts = computed(() => fortune.value?.detail?.conflicts ?? [])
  const commonStrengths = computed(() => fortune.value?.detail?.commonStrengths ?? [])
  const commonCautions = computed(() => fortune.value?.detail?.commonCautions ?? [])

  function load(dateKey = selectedDate.value) {
    selectedDate.value = dateKey
    loading.value = true
    error.value = null
    try {
      const sajuResult = saju.loadFortune(dateKey)
      const astroResult = astrology.loadFortune(dateKey)
      if (!sajuResult || !astroResult) {
        error.value = saju.error ?? astrology.error ?? '운세를 계산할 수 없습니다.'
        fortune.value = null
        return null
      }
      fortune.value = buildIntegratedFortune(sajuResult, astroResult, keyToDate(dateKey))
      return fortune.value
    } catch (e) {
      error.value = e?.message ?? '통합 운세를 계산하는 중 오류가 발생했습니다.'
      fortune.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function setDate(dateKey) {
    return load(dateKey)
  }

  function invalidate() {
    fortune.value = null
    saju.invalidate()
    astrology.invalidate()
  }

  return {
    selectedDate, fortune, loading, error,
    isReady, conflicts, commonStrengths, commonCautions,
    load, setDate, invalidate,
  }
})
