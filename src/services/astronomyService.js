/**
 * astronomyService.js — 지금 관측 가능한 주요 별자리 판정
 *
 * 별자리 대표 별의 적경·적위를 지역 좌표·현재 시각과 함께 계산해 고도와 방위각을 얻고,
 * 태양 고도(일몰 여부)와 구름량·강수를 반영해 실제 관측 가능성을 가른다.
 */
import * as Astronomy from 'astronomy-engine'
import { ZODIAC_SIGNS } from '../constants/zodiacSigns.js'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

/**
 * 별자리 대표 별 (J2000 적경 시간 / 적위 도).
 * 황도 12궁 외에 사계절 대표 별자리 몇 개를 함께 본다.
 */
export const REFERENCE_STARS = [
  { constellation: '양자리', star: '하말', ra: 2.119, dec: 23.462 },
  { constellation: '황소자리', star: '알데바란', ra: 4.598, dec: 16.509 },
  { constellation: '쌍둥이자리', star: '폴룩스', ra: 7.755, dec: 28.026 },
  { constellation: '게자리', star: '아셀루스', ra: 8.744, dec: 21.469 },
  { constellation: '사자자리', star: '레굴루스', ra: 10.139, dec: 11.967 },
  { constellation: '처녀자리', star: '스피카', ra: 13.42, dec: -11.161 },
  { constellation: '천칭자리', star: '주벤엘게누비', ra: 14.848, dec: -16.042 },
  { constellation: '전갈자리', star: '안타레스', ra: 16.49, dec: -26.432 },
  { constellation: '사수자리', star: '카우스 아우스트랄리스', ra: 18.403, dec: -34.385 },
  { constellation: '염소자리', star: '데네브 알게디', ra: 21.784, dec: -16.127 },
  { constellation: '물병자리', star: '사달수드', ra: 21.526, dec: -5.571 },
  { constellation: '물고기자리', star: '알레샤', ra: 1.524, dec: 15.346 },
  { constellation: '오리온자리', star: '리겔', ra: 5.242, dec: -8.202 },
  { constellation: '큰곰자리', star: '두베', ra: 11.062, dec: 61.751 },
  { constellation: '카시오페이아자리', star: '시더', ra: 0.675, dec: 56.537 },
  { constellation: '백조자리', star: '데네브', ra: 20.69, dec: 45.28 },
  { constellation: '거문고자리', star: '베가', ra: 18.615, dec: 38.784 },
  { constellation: '독수리자리', star: '알타이르', ra: 19.846, dec: 8.868 },
]

function norm360(v) {
  return ((v % 360) + 360) % 360
}

/** 방위각(도) → 한국어 방향 */
function azimuthLabel(az) {
  const names = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  return `${names[Math.round(norm360(az) / 45) % 8]}쪽 하늘`
}

/** 적경·적위 → 고도·방위각 */
function horizontalOf(raHours, decDeg, date, lat, lon) {
  const gst = Astronomy.SiderealTime(date) // 시간 단위
  const lst = (gst + lon / 15 + 24) % 24
  const hourAngle = norm360((lst - raHours) * 15) * DEG
  const decRad = decDeg * DEG
  const latRad = lat * DEG

  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(hourAngle)
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD

  const azimuth = norm360(
    Math.atan2(
      -Math.sin(hourAngle) * Math.cos(decRad),
      Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.sin(latRad) * Math.cos(hourAngle),
    ) * RAD,
  )
  return { altitude, azimuth }
}

/** 태양 고도 — 일몰 여부 판정에 쓴다. */
export function sunAltitude(date, lat, lon) {
  const observer = new Astronomy.Observer(lat, lon, 0)
  const equ = Astronomy.Equator(Astronomy.Body.Sun, date, observer, true, true)
  const hor = Astronomy.Horizon(date, observer, equ.ra, equ.dec, 'normal')
  return hor.altitude
}

/**
 * 지금 관측 가능한 주요 별자리를 판정한다.
 *
 * @param {object} opts
 * @param {Date}   opts.date
 * @param {number} opts.latitude
 * @param {number} opts.longitude
 * @param {number|null} opts.clouds       구름량(%)
 * @param {boolean} opts.precipitating    강수 여부
 */
export function findVisibleConstellations({ date, latitude, longitude, clouds = null, precipitating = false }) {
  const solarAltitude = sunAltitude(date, latitude, longitude)
  const isDark = solarAltitude < -12 // 항해박명보다 어두워야 별이 제대로 보인다
  const isTwilight = solarAltitude >= -12 && solarAltitude < 0

  const items = REFERENCE_STARS.map((star) => {
    const { altitude, azimuth } = horizontalOf(star.ra, star.dec, date, latitude, longitude)
    return {
      ...star,
      altitude: Math.round(altitude * 10) / 10,
      azimuth: Math.round(azimuth),
      direction: azimuthLabel(azimuth),
      aboveHorizon: altitude > 15,
      isZodiac: ZODIAC_SIGNS.some((s) => s.name === star.constellation),
    }
  })
    .filter((item) => item.aboveHorizon)
    .sort((a, b) => b.altitude - a.altitude)

  // 구름량과 강수를 반영한 실제 관측 가능성
  let visibility = 'good'
  let visibilityLabel = '좋음'
  if (precipitating) {
    visibility = 'low'
    visibilityLabel = '낮음'
  } else if (typeof clouds === 'number') {
    if (clouds >= 70) {
      visibility = 'low'
      visibilityLabel = '낮음'
    } else if (clouds >= 30) {
      visibility = 'fair'
      visibilityLabel = '보통'
    }
  }

  return {
    isDark,
    isTwilight,
    solarAltitude: Math.round(solarAltitude * 10) / 10,
    daylightNote: isDark
      ? null
      : isTwilight
        ? '해가 막 진 직후라 밝은 별부터 서서히 보이기 시작합니다.'
        : '현재는 밝아서 관측이 어렵습니다.',
    bestTime: bestViewingWindow(date, latitude, longitude),
    visibility,
    visibilityLabel,
    clouds,
    items: items.slice(0, 6),
    disclaimer: '실제 관측은 주변 조명, 건물, 시야에 따라 달라질 수 있습니다.',
  }
}

/** 오늘 밤 가장 보기 좋은 시간대 — 천문박명 종료 이후를 기준으로 안내한다. */
function bestViewingWindow(date, latitude, longitude) {
  try {
    const observer = new Astronomy.Observer(latitude, longitude, 0)
    const dusk = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, date, 1, -18)
    if (!dusk) return '오늘 밤 늦은 시간'
    const start = new Date(dusk.date.getTime())
    const end = new Date(start.getTime() + 3 * 3600 * 1000)
    return `${formatKstHour(start)} ~ ${formatKstHour(end)}`
  } catch {
    return '오늘 밤 늦은 시간'
  }
}

function formatKstHour(date) {
  const kst = new Date(date.getTime() + 9 * 3600 * 1000)
  const h = kst.getUTCHours()
  const m = kst.getUTCMinutes()
  return `${h}시 ${String(m).padStart(2, '0')}분`
}
