/**
 * axiosClient.js — 외부 호출 공통 설정
 * 컴포넌트에서 URL을 직접 쓰지 않도록 baseURL과 오류 처리를 여기에 모은다.
 */
import axios from 'axios'

export const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY ?? ''

export const openWeatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
  params: { appid: OPENWEATHER_KEY, units: 'metric', lang: 'kr' },
})

/** 응답 오류를 화면에 그대로 쓸 수 있는 한국어 문구로 바꾼다. */
export function describeApiError(error) {
  if (!OPENWEATHER_KEY) {
    return 'API 키가 설정되지 않았습니다. .env.local 에 VITE_OPENWEATHER_API_KEY 를 넣어 주세요.'
  }
  const status = error?.response?.status
  if (status === 401) {
    return 'API 키가 아직 활성화되지 않았을 수 있습니다. 신규 발급 키는 반영까지 시간이 걸립니다.'
  }
  if (status === 404) return '해당 지역의 데이터를 찾지 못했습니다.'
  if (status === 429) return '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.'
  if (error?.code === 'ECONNABORTED') return '응답이 지연되고 있습니다. 네트워크 상태를 확인해 주세요.'
  return '데이터를 불러오는 중 오류가 발생했습니다.'
}

/**
 * 같은 키의 요청이 겹치면 앞선 Promise를 재사용해 중복 호출을 막는다.
 */
const inFlight = new Map()

export function dedupe(key, factory) {
  if (inFlight.has(key)) return inFlight.get(key)
  const promise = factory().finally(() => inFlight.delete(key))
  inFlight.set(key, promise)
  return promise
}
