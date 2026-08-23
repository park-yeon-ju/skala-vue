/**
 * manse_calculator.js — 자체 만세력 계산 모듈
 *
 * 절입(節入)은 태양 황경을 astronomy-engine으로 직접 구해 판정하므로
 * 연도별 표를 들고 있지 않아도 경계 시각까지 정확하게 처리된다.
 *
 *  - 년주: 입춘(황경 315°)을 해의 경계로 삼는다.
 *  - 월주: 12절(15°씩 건너뛴 12개 절기)의 구간으로 가른다.
 *  - 일주: 고정 기준일로부터의 일수를 60으로 나눈 나머지로 구한다.
 *  - 시주: 일간에서 자시 천간을 얻고 시지를 더한다.
 *  - 대운: 년간 음양과 성별로 방향을, 절입까지의 거리로 대운수를 구한다.
 *  - 음력 입력은 삭(신월) 시각과 중기(中氣) 포함 여부로 양력으로 환산한다.
 */
import * as Astronomy from 'astronomy-engine'
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ELEMENT_ORDER,
  pillarFromIndex,
  tenGodOf,
  tenGodOfBranch,
} from '../constants/sajuTerms.js'

const KST_OFFSET_MS = 9 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/** 12절의 태양 황경 — 입춘(315°)부터 30°씩. 배열 순서가 곧 월지 순서(인묘진사오미신유술해자축) */
const MAJOR_TERM_LONGITUDES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285]
const MAJOR_TERM_NAMES = [
  '입춘', '경칩', '청명', '입하', '망종', '소서',
  '입추', '백로', '한로', '입동', '대설', '소한',
]
// 중기(中氣)는 태양 황경이 30의 배수가 되는 순간이다(춘분 0°, 곡우 30° … 우수 330°).
// 값을 나열해두지 않고 containsMidTerm()에서 직접 다음 배수를 찾는다.

/** 일주 기준점: 1984-01-31(KST)이 갑자일. 검산 케이스 10건으로 확인한 값이다. */
const DAY_ANCHOR = { year: 1984, month: 1, day: 31 }

// ---------------------------------------------------------------- 날짜 도우미

/** 그레고리력 → 율리우스 적일(정수) */
function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

const ANCHOR_JDN = gregorianToJDN(DAY_ANCHOR.year, DAY_ANCHOR.month, DAY_ANCHOR.day)

/** 한국 시간대의 연·월·일·시·분을 UTC Date로 변환 */
export function kstToDate(year, month, day, hour = 0, minute = 0) {
  return new Date(Date.UTC(year, month - 1, day, hour, minute) - KST_OFFSET_MS)
}

/** UTC Date → 한국 시간대 기준 달력 필드 */
export function dateToKstParts(date) {
  const shifted = new Date(date.getTime() + KST_OFFSET_MS)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  }
}

// ------------------------------------------------------------ 태양·달 위치

/** 해당 시각의 태양 겉보기 황경(도) */
function sunLongitude(date) {
  return Astronomy.SunPosition(date).elon
}

/**
 * startDate 이후로 태양 황경이 targetLon이 되는 첫 시각.
 * astronomy-engine의 SearchSunLongitude는 AstroTime 또는 null을 돌려준다.
 */
function searchSunLongitude(targetLon, startDate, limitDays = 400) {
  const found = Astronomy.SearchSunLongitude(targetLon, startDate, limitDays)
  return found ? found.date : null
}

/** startDate 이후 첫 삭(신월) 시각 */
function searchNewMoon(startDate, limitDays = 40) {
  const found = Astronomy.SearchMoonPhase(0, startDate, limitDays)
  return found ? found.date : null
}

// -------------------------------------------------------------- 절기 계산

/** 특정 연도의 입춘 시각 */
export function findLichun(year) {
  return searchSunLongitude(315, new Date(Date.UTC(year, 0, 15)), 45)
}

/**
 * 주어진 시각이 속한 월지 구간(0=인월 … 11=축월)과 그 구간의 시작 절기를 구한다.
 */
export function findMonthTerm(date) {
  const lon = sunLongitude(date)
  const order = Math.floor((((lon - 315) % 360) + 360) / 30) % 12
  return {
    order,
    name: MAJOR_TERM_NAMES[order],
    startLongitude: MAJOR_TERM_LONGITUDES[order],
    endLongitude: MAJOR_TERM_LONGITUDES[(order + 1) % 12],
  }
}

/** 주어진 시각 직후의 절입 시각 */
export function findNextTermDate(date) {
  const { endLongitude } = findMonthTerm(date)
  return searchSunLongitude(endLongitude, date, 45)
}

/** 주어진 시각 직전의 절입 시각(= 현재 월 구간의 시작) */
export function findPrevTermDate(date) {
  const { startLongitude } = findMonthTerm(date)
  return searchSunLongitude(startLongitude, new Date(date.getTime() - 45 * DAY_MS), 46)
}

// ------------------------------------------------------------ 기둥 계산

/** 일주 인덱스 — 한국 시간 기준 달력 날짜로만 정해진다(야자시로 날짜를 넘기지 않는다). */
export function dayPillarIndex(date) {
  const { year, month, day } = dateToKstParts(date)
  return (((gregorianToJDN(year, month, day) - ANCHOR_JDN) % 60) + 60) % 60
}

/** 년주 인덱스 — 입춘 이전이면 전년으로 본다. */
export function yearPillarIndex(date) {
  const { year } = dateToKstParts(date)
  const lichun = findLichun(year)
  const solarYear = lichun && date.getTime() < lichun.getTime() ? year - 1 : year
  return (((solarYear - 1984) % 60) + 60) % 60
}

/** 월주 인덱스 — 년간에서 인월 천간을 얻고 절기 순서를 더한다. */
export function monthPillarIndex(date) {
  const yearIdx = yearPillarIndex(date)
  const yearStemIdx = yearIdx % 10
  const { order } = findMonthTerm(date)
  // 갑기년 병인월 / 을경년 무인월 / 병신년 경인월 / 정임년 임인월 / 무계년 갑인월
  const firstMonthStem = ((yearStemIdx % 5) * 2 + 2) % 10
  const stemIdx = (firstMonthStem + order) % 10
  const branchIdx = (2 + order) % 12
  return sexagenaryIndexOf(stemIdx, branchIdx)
}

/** 시지 — 자시는 23시에 시작한다. */
export function hourBranchIndex(hour, minute = 0) {
  const totalMinutes = hour * 60 + minute
  return Math.floor((((totalMinutes + 60) % 1440) / 120)) % 12
}

/** 시주 인덱스 — 갑기일 갑자시 / 을경일 병자시 / 병신일 무자시 / 정임일 경자시 / 무계일 임자시 */
export function hourPillarIndex(dayIndex, hour, minute = 0) {
  const dayStemIdx = dayIndex % 10
  const branchIdx = hourBranchIndex(hour, minute)
  const firstHourStem = ((dayStemIdx % 5) * 2) % 10
  const stemIdx = (firstHourStem + branchIdx) % 10
  return sexagenaryIndexOf(stemIdx, branchIdx)
}

/** 천간·지지 인덱스 조합 → 60갑자 인덱스 */
function sexagenaryIndexOf(stemIdx, branchIdx) {
  for (let i = 0; i < 60; i += 1) {
    if (i % 10 === stemIdx && i % 12 === branchIdx) return i
  }
  return 0
}

// ------------------------------------------------------------ 음력 변환

/**
 * 음력 → 양력 변환.
 * 한국 음력은 삭이 든 날을 그 달의 초하루로 삼고, 동지가 든 달을 11월로 둔다.
 * 11월과 다음 11월 사이에 13개 달이 들어가면 중기(中氣)가 없는 첫 달을 윤달로 삼는다.
 *
 * @returns {{ year:number, month:number, day:number } | null}
 */
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeapMonth = false) {
  // 11·12월은 그 해의 동지에서 시작하는 다음 주기에 들어 있다.
  const cycleYear = lunarMonth >= 11 ? lunarYear + 1 : lunarYear
  const months = buildLunarMonths(cycleYear)
  if (!months) return null

  const target = months.find(
    (m) =>
      m.owningYear === lunarYear &&
      m.lunarMonth === lunarMonth &&
      m.isLeap === Boolean(isLeapMonth),
  )
  if (!target) return null
  if (lunarDay < 1 || lunarDay > target.length) return null

  return jdnToGregorian(target.startJdn + (lunarDay - 1))
}

/** 율리우스 적일 → 그레고리력 */
function jdnToGregorian(jdn) {
  const a = jdn + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor((146097 * b) / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: 100 * b + d - 4800 + Math.floor(m / 10),
  }
}

/** 한국 시간 기준으로 그 시각이 속한 날짜의 율리우스 적일 */
function jdnOfKstMoment(date) {
  const { year, month, day } = dateToKstParts(date)
  return gregorianToJDN(year, month, day)
}

const lunarMonthCache = new Map()

/**
 * 동지가 든 달(음력 11월)부터 다음 동지가 든 달 직전까지를 한 주기로 잡아 달 목록을 만든다.
 * 주기의 첫 달은 (cycleYear - 1)년 11월이고, 마지막은 cycleYear년 10월 또는 11월이다.
 */
function buildLunarMonths(cycleYear) {
  if (lunarMonthCache.has(cycleYear)) return lunarMonthCache.get(cycleYear)

  // 기준이 되는 두 동지
  const solsticePrev = searchSunLongitude(270, new Date(Date.UTC(cycleYear - 1, 10, 15)), 60)
  const solsticeCurr = searchSunLongitude(270, new Date(Date.UTC(cycleYear, 10, 15)), 60)
  if (!solsticePrev || !solsticeCurr) return null

  // 두 동지를 넉넉히 감싸는 구간의 삭을 모두 모은다.
  const moons = collectNewMoons(
    new Date(solsticePrev.getTime() - 40 * DAY_MS),
    new Date(solsticeCurr.getTime() + 40 * DAY_MS),
  )
  if (moons.length < 14) return null

  const startIdx = monthIndexContaining(moons, solsticePrev)
  const endIdx = monthIndexContaining(moons, solsticeCurr)
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) return null

  const monthCount = endIdx - startIdx // 동짓달부터 다음 동짓달 직전까지

  // 13개월이면 중기가 없는 첫 달이 윤달이다.
  let leapIdx = -1
  if (monthCount === 13) {
    for (let i = startIdx + 1; i < endIdx; i += 1) {
      if (!containsMidTerm(moons[i], moons[i + 1])) {
        leapIdx = i
        break
      }
    }
  }

  const months = []
  let number = 11
  let owningYear = cycleYear - 1
  for (let k = 0; k < monthCount; k += 1) {
    const i = startIdx + k
    const isLeap = i === leapIdx
    if (k > 0 && !isLeap) {
      number = (number % 12) + 1
      if (number === 1) owningYear = cycleYear
    }
    const startJdn = jdnOfKstMoment(moons[i])
    months.push({
      owningYear,
      lunarMonth: number,
      isLeap,
      startJdn,
      length: jdnOfKstMoment(moons[i + 1]) - startJdn,
    })
  }

  lunarMonthCache.set(cycleYear, months)
  return months
}

/** 구간 안의 삭을 순서대로 모은다. */
function collectNewMoons(startDate, endDate) {
  const list = []
  let cursor = new Date(startDate.getTime())
  for (let guard = 0; guard < 20; guard += 1) {
    const nm = searchNewMoon(cursor, 40)
    if (!nm || nm.getTime() > endDate.getTime()) break
    list.push(nm)
    cursor = new Date(nm.getTime() + 2 * DAY_MS)
  }
  return list
}

/** 해당 시각이 속한 달(삭 배열의 인덱스) */
function monthIndexContaining(moons, moment) {
  const target = jdnOfKstMoment(moment)
  for (let i = moons.length - 2; i >= 0; i -= 1) {
    if (jdnOfKstMoment(moons[i]) <= target && target < jdnOfKstMoment(moons[i + 1])) return i
  }
  return -1
}

/**
 * 그 달에 중기(황경 30° 배수)가 들어 있는지.
 *
 * 달의 경계가 "삭이 든 날"이라는 날짜 단위로 정해지므로, 중기도 시각이 아니라
 * 한국 시간 기준 날짜로 따져야 한다. 동지가 자정 직후에 드는 해에서는 이 차이가
 * 윤달 위치를 통째로 바꾼다.
 */
function containsMidTerm(startMoon, endMoon) {
  const startLon = sunLongitude(startMoon)
  const nextMidLon = ((Math.floor(startLon / 30) + 1) * 30) % 360
  const midMoment = searchSunLongitude(nextMidLon, startMoon, 40)
  if (!midMoment) return false
  return jdnOfKstMoment(midMoment) < jdnOfKstMoment(endMoon)
}

// ------------------------------------------------------------ 대운 계산

/**
 * 대운 — 방향과 대운수, 이후 8개 대운을 만든다.
 * 년간이 양이면 남자는 순행·여자는 역행, 음이면 반대다.
 */
export function calculateDaeun(birthDate, gender, yearIndex, monthIndex) {
  const yearStem = HEAVENLY_STEMS[yearIndex % 10]
  const isMale = gender === 'male'
  const forward = yearStem.yin ? !isMale : isMale

  const boundary = forward ? findNextTermDate(birthDate) : findPrevTermDate(birthDate)
  let startAge = 1
  let daysToTerm = null
  if (boundary) {
    daysToTerm = Math.abs(boundary.getTime() - birthDate.getTime()) / DAY_MS
    // 3일을 1년으로 환산해 반올림한다. 절입에 아주 가까우면 최소 1세로 둔다.
    startAge = Math.max(1, Math.round(daysToTerm / 3))
  }

  const list = []
  for (let i = 0; i < 8; i += 1) {
    const offset = forward ? i + 1 : -(i + 1)
    list.push({
      age: startAge + i * 10,
      pillar: pillarFromIndex(monthIndex + offset),
    })
  }

  return {
    forward,
    direction: forward ? '순행' : '역행',
    startAge,
    daysToTerm: daysToTerm === null ? null : Math.round(daysToTerm * 100) / 100,
    list,
  }
}

/** 특정 날짜 기준으로 현재 적용 중인 대운 */
export function findCurrentDaeun(daeun, birthDate, targetDate) {
  const age = koreanAge(birthDate, targetDate)
  let current = daeun.list[0]
  for (const item of daeun.list) {
    if (age >= item.age) current = item
    else break
  }
  return { ...current, age }
}

/** 한국식 세는 나이 */
export function koreanAge(birthDate, targetDate) {
  const b = dateToKstParts(birthDate)
  const t = dateToKstParts(targetDate)
  return t.year - b.year + 1
}

// ------------------------------------------------------------ 메인 진입점

/**
 * 사주 원국을 계산한다.
 *
 * @param {object} input
 * @param {number} input.year  생년 (음력이면 음력 연도)
 * @param {number} input.month 생월
 * @param {number} input.day   생일
 * @param {number|null} input.hour   생시 (모르면 null)
 * @param {number|null} input.minute 생분
 * @param {'male'|'female'} input.gender
 * @param {'solar'|'lunar'} input.calendar
 * @param {boolean} input.leapMonth 음력 윤달 여부
 */
export function calculateManse(input) {
  const {
    year,
    month,
    day,
    hour = null,
    minute = 0,
    gender = 'female',
    calendar = 'solar',
    leapMonth = false,
  } = input

  let solar = { year, month, day }
  if (calendar === 'lunar') {
    const converted = lunarToSolar(year, month, day, leapMonth)
    if (!converted) {
      return { error: '음력 날짜를 양력으로 변환하지 못했습니다. 날짜와 윤달 여부를 확인해 주세요.' }
    }
    solar = converted
  }

  const hasHour = hour !== null && hour !== undefined && hour !== ''
  // 시각을 모르면 정오를 기준으로 삼되 시주는 만들지 않는다(절입 판정 오차를 줄이기 위함).
  const birthDate = kstToDate(solar.year, solar.month, solar.day, hasHour ? hour : 12, hasHour ? minute : 0)

  const yearIndex = yearPillarIndex(birthDate)
  const monthIndex = monthPillarIndex(birthDate)
  const dayIndex = dayPillarIndex(birthDate)
  const hourIndex = hasHour ? hourPillarIndex(dayIndex, hour, minute) : null

  const pillars = {
    year: pillarFromIndex(yearIndex),
    month: pillarFromIndex(monthIndex),
    day: pillarFromIndex(dayIndex),
    hour: hourIndex === null ? null : pillarFromIndex(hourIndex),
  }

  const dayStem = pillars.day.stem
  const elementCount = countElements(pillars)
  const daeun = calculateDaeun(birthDate, gender, yearIndex, monthIndex)
  const term = findMonthTerm(birthDate)

  return {
    solarDate: solar,
    birthDate,
    hasHour,
    pillars,
    dayStem,
    elementCount,
    strongestElement: strongestOf(elementCount),
    weakestElement: weakestOf(elementCount),
    tenGods: {
      year: tenGodOf(dayStem, pillars.year.stem),
      month: tenGodOf(dayStem, pillars.month.stem),
      hour: pillars.hour ? tenGodOf(dayStem, pillars.hour.stem) : null,
      yearBranch: tenGodOfBranch(dayStem, pillars.year.branch),
      monthBranch: tenGodOfBranch(dayStem, pillars.month.branch),
      dayBranch: tenGodOfBranch(dayStem, pillars.day.branch),
      hourBranch: pillars.hour ? tenGodOfBranch(dayStem, pillars.hour.branch) : null,
    },
    daeun,
    monthTerm: term,
  }
}

/**
 * 선택한 날짜의 세운·월운·일진을 구한다. 원국과 무관하게 날짜만으로 정해진다.
 */
export function calculateDailyPillars(targetDate) {
  const yearIndex = yearPillarIndex(targetDate)
  const monthIndex = monthPillarIndex(targetDate)
  const dayIndex = dayPillarIndex(targetDate)
  return {
    seun: pillarFromIndex(yearIndex),
    wolun: pillarFromIndex(monthIndex),
    iljin: pillarFromIndex(dayIndex),
    term: findMonthTerm(targetDate),
  }
}

/** 원국 여덟 글자(또는 여섯 글자)의 오행 개수 */
function countElements(pillars) {
  const counts = Object.fromEntries(ELEMENT_ORDER.map((e) => [e, 0]))
  const parts = [pillars.year, pillars.month, pillars.day, pillars.hour].filter(Boolean)
  for (const p of parts) {
    counts[p.stem.element] += 1
    counts[p.branch.element] += 1
  }
  return counts
}

function strongestOf(counts) {
  return ELEMENT_ORDER.reduce((best, e) => (counts[e] > counts[best] ? e : best), ELEMENT_ORDER[0])
}

function weakestOf(counts) {
  return ELEMENT_ORDER.reduce((worst, e) => (counts[e] < counts[worst] ? e : worst), ELEMENT_ORDER[0])
}

export { HEAVENLY_STEMS, EARTHLY_BRANCHES, MAJOR_TERM_NAMES }
