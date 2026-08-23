/**
 * weatherStore — 오늘 하루 페이지의 날씨·미세먼지·뷰티 팁·관측 별자리.
 * 페이지에서 고른 임시 지역은 설정의 기본 지역을 바꾸지 않는다.
 */
import { ref, computed, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useProfileStore } from './profileStore'
import { findRegion, isWideRegion } from '@/constants/regions'
import { fetchCurrentWeather, fetchTodayForecast } from '@/services/weatherApi'
import { fetchAirQuality } from '@/services/airQualityApi'
import { findVisibleConstellations } from '@/services/astronomyService'
import { selectBeautyTips, estimateUvIndex } from '@/constants/beautyRules'
import { describeApiError } from '@/services/axiosClient'

export const useWeatherStore = defineStore('weather', () => {
  const profile = useProfileStore()

  /** 페이지에서만 쓰는 임시 지역. null이면 설정의 기본 지역을 따른다. */
  const overrideRegionCode = ref(null)

  const weather = shallowRef(null)
  const forecast = shallowRef([])
  const airQuality = shallowRef(null)
  const sky = shallowRef(null)
  const loading = ref(false)
  const error = ref(null)
  const loadedRegionCode = ref(null)

  const activeRegionCode = computed(() => overrideRegionCode.value ?? profile.currentRegion)
  const activeRegion = computed(() => findRegion(activeRegionCode.value))
  const showsRepresentativeNotice = computed(() => isWideRegion(activeRegion.value))

  const hasData = computed(() => Boolean(weather.value))
  const isEmpty = computed(() => !loading.value && !error.value && !weather.value)

  /** 오늘 예보 중 가장 높은 강수 확률 */
  const maxPop = computed(() => {
    if (!forecast.value.length) return null
    return Math.max(...forecast.value.map((slot) => slot.pop))
  })

  const isPrecipitating = computed(() => {
    const p = weather.value?.precipitation
    return Boolean(p?.measured && p.amount > 0)
  })

  /** 자외선 지수 — 태양 고도와 구름량으로 추정한다(무료 키에서는 자외선 API 사용 불가). */
  const uvIndex = computed(() => {
    if (!sky.value || !weather.value) return null
    return estimateUvIndex(sky.value.solarAltitude, weather.value.clouds)
  })

  /** 시간당 강수량 — 관측값이 없으면 null(‘데이터 없음’)로 둔다. */
  const rainAmount = computed(() => {
    const p = weather.value?.precipitation
    return p?.measured ? p.amount : null
  })

  /** 팁 — 날씨·미세먼지·자외선 값이 모두 모인 뒤 계산한다. */
  const tipContext = computed(() => ({
    temp: weather.value?.temp ?? null,
    humidity: weather.value?.humidity ?? null,
    clouds: weather.value?.clouds ?? null,
    windSpeed: weather.value?.windSpeed ?? null,
    precipitating: isPrecipitating.value,
    maxPop: maxPop.value,
    rainAmount: rainAmount.value,
    uvIndex: uvIndex.value,
    solarAltitude: sky.value?.solarAltitude ?? null,
    dustLevel: airQuality.value?.overall?.level ?? null,
  }))

  const beautyTips = computed(() => {
    if (!weather.value) return { beauty: [], outfit: [], totalMatched: 0 }
    return selectBeautyTips(tipContext.value)
  })

  function setRegion(code) {
    if (code === activeRegionCode.value) return
    overrideRegionCode.value = code
    load(true)
  }

  /** 설정의 기본 지역으로 되돌린다. */
  function useDefaultRegion() {
    overrideRegionCode.value = null
    load(true)
  }

  async function load(force = false) {
    const region = activeRegion.value
    if (!region) {
      error.value = '지역 정보를 찾을 수 없습니다.'
      return
    }
    if (!force && loadedRegionCode.value === region.code && weather.value) return

    loading.value = true
    error.value = null
    try {
      // 세 가지 요청을 동시에 보낸다. 예보와 대기질은 실패해도 화면을 막지 않는다.
      const [currentResult, forecastResult, airResult] = await Promise.allSettled([
        fetchCurrentWeather(region),
        fetchTodayForecast(region),
        fetchAirQuality(region),
      ])

      if (currentResult.status === 'rejected') throw currentResult.reason
      weather.value = currentResult.value
      forecast.value = forecastResult.status === 'fulfilled' ? forecastResult.value : []
      airQuality.value = airResult.status === 'fulfilled' ? airResult.value : null

      sky.value = findVisibleConstellations({
        date: new Date(),
        latitude: region.lat,
        longitude: region.lon,
        clouds: weather.value.clouds,
        precipitating: isPrecipitating.value,
      })

      loadedRegionCode.value = region.code
    } catch (e) {
      error.value = describeApiError(e)
      weather.value = null
      forecast.value = []
      airQuality.value = null
      sky.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    overrideRegionCode, weather, forecast, airQuality, sky,
    loading, error, loadedRegionCode,
    activeRegionCode, activeRegion, showsRepresentativeNotice,
    hasData, isEmpty, maxPop, isPrecipitating, beautyTips,
    uvIndex, rainAmount, tipContext,
    setRegion, useDefaultRegion, load,
  }
})
