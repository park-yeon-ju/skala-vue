/**
 * 시연용 기본 프로필.
 *
 * 저장된 설정이 하나도 없을 때만 이 값으로 시작한다.
 * 처음 들어온 사람도 설정을 채우지 않고 바로 결과 화면을 볼 수 있게 하려는 것이고,
 * 설정 화면에서 저장하거나 초기화하면 그때부터는 사용자가 넣은 값이 우선한다.
 */
import sampleChartUrl from '@/assets/sample/natal-chart-sample.png'

/** 번들에 포함된 예시 차트를 가리키는 특수 id — IndexedDB를 거치지 않는다. */
export const SAMPLE_CHART_ID = 'sample:natal-chart'
export const SAMPLE_CHART_URL = sampleChartUrl
export const SAMPLE_CHART_NAME = 'astro-seek_1999-08-31_12-30.png'

export const DEFAULT_PROFILE = {
  nickname: '연주',
  gender: 'female',
  calendar: 'solar',
  leapMonth: false,
  birthDate: '1999-08-31',
  birthTime: '12:30',
  birthTimeUnknown: false,
  birthPlace: 'seoul',
  birthPlaceUnknown: false,
  currentRegion: 'gwangju',
  temperatureUnit: 'celsius',
  chartImageId: SAMPLE_CHART_ID,
}

export function isSampleChart(id) {
  return id === SAMPLE_CHART_ID
}
