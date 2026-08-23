/**
 * weatherApi.js — OpenWeather 현재 날씨 / 예보
 *
 * 강수량은 "데이터 없음"과 "실제 0"을 구분해야 하므로 파싱 단계에서
 * 값의 존재 여부를 별도 플래그로 남긴다.
 */
import { openWeatherClient, dedupe } from './axiosClient.js'

/** rain/snow 필드를 안전하게 읽는다. 필드 자체가 없으면 measured=false */
function parsePrecipitation(source) {
  const rain = source?.rain?.['1h'] ?? source?.rain?.['3h']
  const snow = source?.snow?.['1h'] ?? source?.snow?.['3h']
  const hasRain = typeof rain === 'number'
  const hasSnow = typeof snow === 'number'
  return {
    measured: hasRain || hasSnow,
    amount: (hasRain ? rain : 0) + (hasSnow ? snow : 0),
    type: hasSnow && !hasRain ? '눈' : hasRain ? '비' : null,
  }
}

/** 현재 날씨 */
export async function fetchCurrentWeather(region) {
  return dedupe(`weather:${region.code}`, async () => {
    const { data } = await openWeatherClient.get('/weather', {
      params: { lat: region.lat, lon: region.lon },
    })
    return {
      regionCode: region.code,
      observedAt: new Date(data.dt * 1000),
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      tempMin: data.main.temp_min,
      tempMax: data.main.temp_max,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      clouds: data.clouds?.all ?? null,
      windSpeed: data.wind?.speed ?? null,
      condition: data.weather?.[0]?.description ?? '정보 없음',
      conditionMain: data.weather?.[0]?.main ?? 'Clear',
      icon: data.weather?.[0]?.icon ?? null,
      precipitation: parsePrecipitation(data),
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : null,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000) : null,
    }
  })
}

/**
 * 오늘의 시간대별 강수 정보 — 3시간 간격 예보에서 오늘(한국시간) 구간만 추린다.
 */
export async function fetchTodayForecast(region) {
  return dedupe(`forecast:${region.code}`, async () => {
    const { data } = await openWeatherClient.get('/forecast', {
      params: { lat: region.lat, lon: region.lon },
    })
    const list = data?.list ?? []
    const todayKey = kstDateKey(new Date())

    const slots = list
      .map((slot) => ({
        at: new Date(slot.dt * 1000),
        temp: slot.main.temp,
        pop: Math.round((slot.pop ?? 0) * 100),
        condition: slot.weather?.[0]?.description ?? '',
        conditionMain: slot.weather?.[0]?.main ?? 'Clear',
        precipitation: parsePrecipitation(slot),
      }))
      .filter((slot) => kstDateKey(slot.at) === todayKey)

    // 오늘 남은 구간이 없으면(늦은 밤) 가장 가까운 8구간을 보여준다.
    if (slots.length === 0) {
      return list.slice(0, 8).map((slot) => ({
        at: new Date(slot.dt * 1000),
        temp: slot.main.temp,
        pop: Math.round((slot.pop ?? 0) * 100),
        condition: slot.weather?.[0]?.description ?? '',
        conditionMain: slot.weather?.[0]?.main ?? 'Clear',
        precipitation: parsePrecipitation(slot),
      }))
    }
    return slots
  })
}

function kstDateKey(date) {
  const kst = new Date(date.getTime() + 9 * 3600 * 1000)
  return `${kst.getUTCFullYear()}-${kst.getUTCMonth() + 1}-${kst.getUTCDate()}`
}
