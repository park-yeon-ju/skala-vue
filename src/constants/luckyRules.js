/**
 * 행운 정보 규칙표.
 * 컬러·숫자·방향은 오늘 보완해야 할 오행(사주)이나 조화롭게 작동하는 원소(점성술)에서
 * 규칙적으로 뽑는다. 난수를 쓰지 않으므로 같은 조건이면 항상 같은 값이 나온다.
 */

export const ELEMENT_LUCK = {
  목: {
    colors: [
      { name: '딥 그린', hex: '#315C4A' },
      { name: '청록', hex: '#2F6E63' },
    ],
    numbers: [3, 8],
    direction: '동쪽',
    time: '오전 5시~7시',
  },
  화: {
    colors: [
      { name: '코랄 레드', hex: '#B4463C' },
      { name: '딥 퍼플', hex: '#5B3A73' },
    ],
    numbers: [2, 7],
    direction: '남쪽',
    time: '오전 11시~오후 1시',
  },
  토: {
    colors: [
      { name: '샌드 베이지', hex: '#A8926B' },
      { name: '토프 브라운', hex: '#6E5B44' },
    ],
    numbers: [5, 10],
    direction: '중앙과 남서쪽',
    time: '오후 1시~3시',
  },
  금: {
    colors: [
      { name: '실버 그레이', hex: '#B9BFC7' },
      { name: '샴페인 골드', hex: '#B69A5E' },
    ],
    numbers: [4, 9],
    direction: '서쪽',
    time: '오후 5시~7시',
  },
  수: {
    colors: [
      { name: '미드나잇 블루', hex: '#2B3A6B' },
      { name: '잉크 네이비', hex: '#1E2440' },
    ],
    numbers: [1, 6],
    direction: '북쪽',
    time: '오후 9시~11시',
  },
}

/** 점성술 4원소를 오행 표기로 잇는다 — 행운 규칙을 한 벌로 유지하기 위함 */
export const ASTRO_ELEMENT_TO_FIVE = {
  불: '화',
  흙: '토',
  공기: '목',
  물: '수',
}

/**
 * 오행과 보조 지표로 행운 정보를 고른다.
 * variant는 일진·트랜짓에서 나오는 정수라 난수가 아니다.
 */
export function pickLucky(element, variant = 0) {
  const table = ELEMENT_LUCK[element] ?? ELEMENT_LUCK.토
  const index = Math.abs(variant) % table.colors.length
  const numberIndex = Math.abs(variant) % table.numbers.length
  return {
    color: table.colors[index],
    number: table.numbers[numberIndex],
    direction: table.direction,
    time: table.time,
  }
}
