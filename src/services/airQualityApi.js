/**
 * airQualityApi.js — OpenWeather Air Pollution
 *
 * OpenWeather 원본 AQI(1~5)와 국내에서 쓰는 PM 농도 기준은 서로 다르다.
 * 두 값을 섞지 않도록 각각 따로 담고 화면에도 출처를 함께 표시한다.
 */
import { openWeatherClient, dedupe } from './axiosClient.js'

/** OpenWeather 자체 AQI 등급 (1~5) */
const OPENWEATHER_AQI_LABELS = {
  1: '좋음',
  2: '양호',
  3: '보통',
  4: '나쁨',
  5: '매우 나쁨',
}

/** 국내 환경부 기준의 PM 농도 등급 */
const PM10_BREAKS = [
  { max: 30, label: '좋음', level: 1 },
  { max: 80, label: '보통', level: 2 },
  { max: 150, label: '나쁨', level: 3 },
  { max: Infinity, label: '매우 나쁨', level: 4 },
]
const PM25_BREAKS = [
  { max: 15, label: '좋음', level: 1 },
  { max: 35, label: '보통', level: 2 },
  { max: 75, label: '나쁨', level: 3 },
  { max: Infinity, label: '매우 나쁨', level: 4 },
]

function gradeBy(breaks, value) {
  if (typeof value !== 'number') return { label: '데이터 없음', level: 0 }
  return breaks.find((b) => value <= b.max) ?? breaks[breaks.length - 1]
}

const OUTDOOR_ADVICE = {
  0: '측정값이 없어 실외 활동 판단은 보류하세요.',
  1: '야외 활동에 무리가 없습니다.',
  2: '민감한 분은 장시간 실외 활동을 조절하세요.',
  3: '외출 시 마스크를 쓰고 귀가 후 꼼꼼히 세안하세요.',
  4: '장시간 외출을 피하고 실내 환기 시간을 줄이세요.',
}

export async function fetchAirQuality(region) {
  return dedupe(`air:${region.code}`, async () => {
    const { data } = await openWeatherClient.get('/air_pollution', {
      params: { lat: region.lat, lon: region.lon },
    })
    const item = data?.list?.[0]
    const pm10 = item?.components?.pm10 ?? null
    const pm25 = item?.components?.pm2_5 ?? null
    const pm10Grade = gradeBy(PM10_BREAKS, pm10)
    const pm25Grade = gradeBy(PM25_BREAKS, pm25)
    const worst = Math.max(pm10Grade.level, pm25Grade.level)

    return {
      regionCode: region.code,
      measuredAt: item?.dt ? new Date(item.dt * 1000) : null,
      pm10,
      pm25,
      pm10Grade,
      pm25Grade,
      // 국내 PM 기준으로 낸 종합 등급
      overall: {
        level: worst,
        label: [null, '좋음', '보통', '나쁨', '매우 나쁨'][worst] ?? '데이터 없음',
        source: '환경부 PM 농도 기준',
      },
      // OpenWeather가 자체적으로 매긴 등급 — 위 값과 섞지 않는다.
      providerAqi: {
        value: item?.main?.aqi ?? null,
        label: OPENWEATHER_AQI_LABELS[item?.main?.aqi] ?? '데이터 없음',
        source: 'OpenWeather AQI',
      },
      advice: OUTDOOR_ADVICE[worst] ?? OUTDOOR_ADVICE[0],
    }
  })
}
