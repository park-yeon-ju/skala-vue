/**
 * 날짜 도우미 — 화면 표시와 저장 키를 한국 시간 기준으로 통일한다.
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/ko'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('ko')

export const KST = 'Asia/Seoul'

/** 오늘(한국시간) 날짜 키 */
export function todayKey() {
  return dayjs().tz(KST).format('YYYY-MM-DD')
}

/** 'YYYY-MM-DD' → 그 날 정오(한국시간)의 Date. 하루의 대표 시각으로 정오를 쓴다. */
export function keyToDate(key) {
  return dayjs.tz(`${key} 12:00`, KST).toDate()
}

/** 'YYYY-MM-DD' → '2026년 8월 23일 (일)' */
export function formatKoreanDate(key) {
  return dayjs.tz(key, KST).format('YYYY년 M월 D일 (ddd)')
}

/** 짧은 표기 '8월 23일 (일)' */
export function formatShortDate(key) {
  return dayjs.tz(key, KST).format('M월 D일 (ddd)')
}

/** 날짜 키 이동 */
export function shiftDateKey(key, days) {
  return dayjs.tz(key, KST).add(days, 'day').format('YYYY-MM-DD')
}

export function isToday(key) {
  return key === todayKey()
}

/** Date → '오전 6:12' */
export function formatKstTime(date) {
  if (!date) return '데이터 없음'
  return dayjs(date).tz(KST).format('A h:mm')
}

/** Date → '15시' */
export function formatKstHour(date) {
  if (!date) return '-'
  return dayjs(date).tz(KST).format('H시')
}

/** Date → '8월 23일 21:04' */
export function formatKstDateTime(date) {
  if (!date) return '데이터 없음'
  return dayjs(date).tz(KST).format('M월 D일 HH:mm')
}

/** 미래 날짜인지 — 생년월일 검증에 쓴다. */
export function isFutureDate(key) {
  if (!key) return false
  return dayjs.tz(key, KST).isAfter(dayjs().tz(KST), 'day')
}

export default dayjs
