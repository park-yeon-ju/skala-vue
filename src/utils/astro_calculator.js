/**
 * astro_calculator.js — 서양 점성술 계산 모듈
 *
 * astronomy-engine으로 행성의 황경을 구하고, 출생시각·출생지역이 있을 때만
 * 항성시를 이용해 상승궁(ASC)과 중천(MC)을 계산한다.
 * 하우스는 Whole Sign 방식을 쓴다(Astro-Seek의 Placidus와 표기가 다를 수 있음).
 */
import * as Astronomy from 'astronomy-engine'
import { PLANETS, ASPECTS } from '../constants/astrologyDailyRules.js'
import { signFromLongitude, degreeInSign } from '../constants/zodiacSigns.js'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

const BODY_MAP = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
}

function norm360(deg) {
  return ((deg % 360) + 360) % 360
}

/** 평균 황도경사각(도) */
function obliquity(date) {
  const jd = Astronomy.MakeTime(date).tt + 2451545.0
  const t = (jd - 2451545.0) / 36525
  return 23.439291 - 0.0130042 * t - 0.00000016 * t * t + 0.000000504 * t * t * t
}

/** 특정 시각의 행성 황경(도) — 지구 중심 기준 */
export function planetLongitude(bodyKey, date) {
  const body = BODY_MAP[bodyKey]
  if (!body) return null
  if (body === Astronomy.Body.Moon) {
    return norm360(Astronomy.EclipticGeoMoon(date).lon)
  }
  if (body === Astronomy.Body.Sun) {
    return norm360(Astronomy.SunPosition(date).elon)
  }
  const vec = Astronomy.GeoVector(body, date, true)
  return norm360(Astronomy.Ecliptic(vec).elon)
}

/** 역행 여부 — 하루 뒤 황경과 비교한다. */
export function isRetrograde(bodyKey, date) {
  if (bodyKey === 'Sun' || bodyKey === 'Moon') return false
  const now = planetLongitude(bodyKey, date)
  const later = planetLongitude(bodyKey, new Date(date.getTime() + 24 * 3600 * 1000))
  if (now === null || later === null) return false
  let diff = later - now
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return diff < 0
}

/** 전체 행성 위치 */
export function planetPositions(date) {
  return PLANETS.map((p) => {
    const longitude = planetLongitude(p.key, date)
    const sign = signFromLongitude(longitude)
    return {
      key: p.key,
      name: p.name,
      role: p.role,
      longitude,
      sign,
      degree: degreeInSign(longitude),
      retrograde: isRetrograde(p.key, date),
    }
  })
}

/**
 * 상승궁과 중천 — 출생시각과 좌표가 있어야 계산할 수 있다.
 * @returns {{ ascendant:number, midheaven:number } | null}
 */
export function calculateAngles(date, latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return null
  }
  // 그리니치 항성시(시간) → 지방 항성시 → 적경(RAMC)
  const gst = Astronomy.SiderealTime(date)
  const lst = (gst + longitude / 15 + 24) % 24
  const ramc = lst * 15

  const eps = obliquity(date) * DEG
  const ramcRad = ramc * DEG
  const latRad = latitude * DEG

  const mc = norm360(Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(eps)) * RAD)
  const asc = norm360(
    Math.atan2(
      Math.cos(ramcRad),
      -(Math.sin(ramcRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps)),
    ) * RAD,
  )

  return { ascendant: asc, midheaven: mc }
}

/**
 * Whole Sign 하우스 — 상승궁이 든 별자리가 1하우스가 된다.
 * @returns {Array<{house:number, sign:object}>|null}
 */
export function wholeSignHouses(ascendant) {
  if (ascendant === null || ascendant === undefined) return null
  const startIndex = Math.floor(norm360(ascendant) / 30)
  return Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    sign: signFromLongitude((startIndex + i) * 30),
  }))
}

/** 특정 황경이 몇 하우스에 드는지 */
export function houseOf(longitude, ascendant) {
  if (ascendant === null || ascendant === undefined) return null
  const startIndex = Math.floor(norm360(ascendant) / 30)
  const signIndex = Math.floor(norm360(longitude) / 30)
  return ((signIndex - startIndex + 12) % 12) + 1
}

/** 두 황경 사이의 각도 차 (0~180) */
export function angleBetween(a, b) {
  const diff = Math.abs(norm360(a) - norm360(b))
  return diff > 180 ? 360 - diff : diff
}

/**
 * 두 행성 목록 사이의 주요 어스펙트를 찾는다.
 * @param {Array} fromList 트랜짓(오늘) 행성
 * @param {Array} toList   출생 차트 행성
 */
export function findAspects(fromList, toList) {
  const results = []
  for (const t of fromList) {
    for (const n of toList) {
      const separation = angleBetween(t.longitude, n.longitude)
      for (const aspect of ASPECTS) {
        const orb = Math.abs(separation - aspect.angle)
        if (orb <= aspect.orb) {
          results.push({
            transit: t,
            natal: n,
            aspect,
            orb: Math.round(orb * 10) / 10,
            // 오브가 좁을수록 1에 가깝다.
            strength: Math.round((1 - orb / aspect.orb) * 100) / 100,
          })
          break
        }
      }
    }
  }
  return results.sort((a, b) => b.strength - a.strength)
}

/**
 * 출생 차트를 계산한다.
 * 출생시각이 없으면 정오를 기준으로 행성 위치만 구하고 각(ASC/MC)과 하우스는 만들지 않는다.
 */
export function calculateNatalChart({ birthDate, hasBirthTime, latitude, longitude }) {
  const planets = planetPositions(birthDate)
  const canComputeAngles =
    hasBirthTime && latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined

  const angles = canComputeAngles ? calculateAngles(birthDate, latitude, longitude) : null
  const houses = angles ? wholeSignHouses(angles.ascendant) : null

  const byKey = Object.fromEntries(planets.map((p) => [p.key, p]))
  return {
    planets,
    byKey,
    sun: byKey.Sun,
    moon: byKey.Moon,
    angles,
    houses,
    hasAngles: Boolean(angles),
    ascendantSign: angles ? signFromLongitude(angles.ascendant) : null,
    midheavenSign: angles ? signFromLongitude(angles.midheaven) : null,
  }
}

/** 선택 날짜의 트랜짓 차트 — 정오(한국시간) 기준으로 그날의 대표 배치를 본다. */
export function calculateTransitChart(targetDate) {
  const planets = planetPositions(targetDate)
  const byKey = Object.fromEntries(planets.map((p) => [p.key, p]))
  return { planets, byKey, sun: byKey.Sun, moon: byKey.Moon }
}

export { norm360 }
