/**
 * 12 별자리 정의.
 * stars/lines는 별자리 일러스트를 그리는 데 쓰는 좌표다(0~100 정규 좌표).
 * 실제 별자리의 형태를 참고하되 화면용으로 단순화했다.
 */
export const ZODIAC_SIGNS = [
  {
    key: 'aries', name: '양자리', symbol: '♈', element: '불', quality: '활동',
    ruler: '화성', start: [3, 21], end: [4, 19],
    traits: '먼저 움직이고 부딪히며 배우는 성향입니다. 시작하는 힘이 강한 대신 마무리에서 힘이 빠지기 쉽습니다.',
    stars: [[22, 62], [40, 48], [58, 40], [78, 46]],
    lines: [[0, 1], [1, 2], [2, 3]],
  },
  {
    key: 'taurus', name: '황소자리', symbol: '♉', element: '흙', quality: '고정',
    ruler: '금성', start: [4, 20], end: [5, 20],
    traits: '한번 정한 것을 오래 지키는 성향입니다. 감각과 현실 감각이 좋지만 변화를 늦게 받아들입니다.',
    stars: [[20, 40], [36, 52], [52, 58], [68, 46], [80, 32], [46, 72], [62, 76]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]],
  },
  {
    key: 'gemini', name: '쌍둥이자리', symbol: '♊', element: '공기', quality: '변통',
    ruler: '수성', start: [5, 21], end: [6, 21],
    traits: '정보를 빠르게 흡수하고 연결합니다. 관심이 넓은 만큼 한 곳에 오래 머무르기 어려워합니다.',
    stars: [[32, 22], [30, 44], [28, 68], [34, 86], [66, 20], [68, 44], [70, 68], [64, 86]],
    lines: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5]],
  },
  {
    key: 'cancer', name: '게자리', symbol: '♋', element: '물', quality: '활동',
    ruler: '달', start: [6, 22], end: [7, 22],
    traits: '가까운 사람을 보호하려는 마음이 강합니다. 정서적 안정이 확보되어야 능력이 나옵니다.',
    stars: [[50, 34], [38, 52], [62, 54], [28, 72], [72, 74]],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4]],
  },
  {
    key: 'leo', name: '사자자리', symbol: '♌', element: '불', quality: '고정',
    ruler: '태양', start: [7, 23], end: [8, 22],
    traits: '드러내고 인정받을 때 힘이 납니다. 자존심이 동력이자 약점으로 함께 작동합니다.',
    stars: [[24, 30], [34, 22], [46, 28], [48, 46], [66, 52], [78, 40], [72, 68], [40, 62]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [3, 7], [7, 0]],
  },
  {
    key: 'virgo', name: '처녀자리', symbol: '♍', element: '흙', quality: '변통',
    ruler: '수성', start: [8, 23], end: [9, 22],
    traits: '세부를 살피고 정리하는 힘이 뛰어납니다. 기준이 높아 스스로를 먼저 몰아붙입니다.',
    stars: [[22, 28], [38, 38], [54, 34], [70, 42], [50, 56], [44, 76], [66, 70]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [4, 6]],
  },
  {
    key: 'libra', name: '천칭자리', symbol: '♎', element: '공기', quality: '활동',
    ruler: '금성', start: [9, 23], end: [10, 22],
    traits: '균형과 조화를 우선합니다. 관계를 살피느라 자기 결정을 미루기 쉽습니다.',
    stars: [[50, 26], [30, 44], [70, 44], [34, 70], [68, 70]],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [1, 2]],
  },
  {
    key: 'scorpio', name: '전갈자리', symbol: '♏', element: '물', quality: '고정',
    ruler: '명왕성', start: [10, 23], end: [11, 22],
    traits: '한번 파고들면 끝을 봅니다. 감정의 깊이가 크고 신뢰의 기준이 엄격합니다.',
    stars: [[20, 26], [28, 36], [38, 44], [50, 52], [60, 62], [68, 74], [78, 68], [74, 56]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
  },
  {
    key: 'sagittarius', name: '사수자리', symbol: '♐', element: '불', quality: '변통',
    ruler: '목성', start: [11, 23], end: [12, 21],
    traits: '넓게 보고 멀리 갑니다. 자유가 보장될 때 능력이 나오고 구속에는 약합니다.',
    stars: [[26, 66], [40, 54], [54, 44], [70, 32], [46, 70], [60, 62], [34, 40]],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4], [2, 5], [1, 6]],
  },
  {
    key: 'capricorn', name: '염소자리', symbol: '♑', element: '흙', quality: '활동',
    ruler: '토성', start: [12, 22], end: [1, 19],
    traits: '목표를 세우면 오래 밀고 갑니다. 책임감이 크고 감정 표현은 늦게 나옵니다.',
    stars: [[24, 34], [40, 44], [56, 56], [72, 64], [58, 76], [38, 66]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    key: 'aquarius', name: '물병자리', symbol: '♒', element: '공기', quality: '고정',
    ruler: '천왕성', start: [1, 20], end: [2, 18],
    traits: '남과 다른 관점을 자연스럽게 냅니다. 거리를 두고 볼 때 판단이 정확합니다.',
    stars: [[24, 32], [38, 26], [52, 34], [64, 28], [56, 50], [48, 66], [62, 76], [36, 70]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [5, 7]],
  },
  {
    key: 'pisces', name: '물고기자리', symbol: '♓', element: '물', quality: '변통',
    ruler: '해왕성', start: [2, 19], end: [3, 20],
    traits: '분위기와 감정을 빠르게 읽습니다. 경계가 옅어 남의 상태에 쉽게 물듭니다.',
    stars: [[20, 30], [32, 42], [46, 50], [60, 44], [74, 32], [58, 64], [46, 76], [32, 70]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7], [7, 2]],
  },
]

export const ELEMENT_TRAITS = {
  불: '추진과 표현이 앞서는 기운',
  흙: '현실과 지속을 지키는 기운',
  공기: '사고와 관계를 잇는 기운',
  물: '감정과 직관이 깊어지는 기운',
}

/** 생년월일(월, 일)로 태양 별자리를 구한다. */
export function sunSignOf(month, day) {
  return (
    ZODIAC_SIGNS.find((sign) => {
      const [sm, sd] = sign.start
      const [em, ed] = sign.end
      if (sm <= em) {
        return (month === sm && day >= sd) || (month === em && day <= ed)
      }
      // 염소자리처럼 해를 넘기는 구간
      return (month === sm && day >= sd) || (month === em && day <= ed)
    }) ?? ZODIAC_SIGNS[9]
  )
}

/** 황경(0~360)으로 별자리를 구한다 — 양자리 0°부터 30°씩 */
export function signFromLongitude(longitude) {
  const normalized = ((longitude % 360) + 360) % 360
  return ZODIAC_SIGNS[Math.floor(normalized / 30)]
}

/** 별자리 안에서의 도수 */
export function degreeInSign(longitude) {
  const normalized = ((longitude % 360) + 360) % 360
  return Math.round((normalized % 30) * 10) / 10
}

export function findSign(key) {
  return ZODIAC_SIGNS.find((s) => s.key === key) ?? null
}
