import { computed } from 'vue'
import { useProfileStore } from '@/stores/profileStore'

/**
 * 온도 단위 변환 — 원본은 항상 섭씨로 두고 표시할 때만 바꾼다.
 */
export function useTemperature() {
  const profile = useProfileStore()

  const unit = computed(() => profile.temperatureUnit)
  const symbol = computed(() => (unit.value === 'fahrenheit' ? '℉' : '℃'))

  function convert(celsius) {
    if (typeof celsius !== 'number' || Number.isNaN(celsius)) return null
    return unit.value === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
  }

  function format(celsius, digits = 0) {
    const value = convert(celsius)
    if (value === null) return '데이터 없음'
    return `${value.toFixed(digits)}${symbol.value}`
  }

  return { unit, symbol, convert, format }
}
