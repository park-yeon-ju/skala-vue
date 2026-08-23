// 사주 계산에 쓰이는 기본 상수 — 천간, 지지, 오행, 십성 정의
// 계산 모듈(manse_calculator)과 해석 모듈(saju_daily_fortune)이 함께 참조한다.

export const HEAVENLY_STEMS = [
  { han: '甲', ko: '갑', element: '목', yin: false },
  { han: '乙', ko: '을', element: '목', yin: true },
  { han: '丙', ko: '병', element: '화', yin: false },
  { han: '丁', ko: '정', element: '화', yin: true },
  { han: '戊', ko: '무', element: '토', yin: false },
  { han: '己', ko: '기', element: '토', yin: true },
  { han: '庚', ko: '경', element: '금', yin: false },
  { han: '辛', ko: '신', element: '금', yin: true },
  { han: '壬', ko: '임', element: '수', yin: false },
  { han: '癸', ko: '계', element: '수', yin: true },
]

export const EARTHLY_BRANCHES = [
  { han: '子', ko: '자', element: '수', yin: false, animal: '쥐', hourRange: '23~01시' },
  { han: '丑', ko: '축', element: '토', yin: true, animal: '소', hourRange: '01~03시' },
  { han: '寅', ko: '인', element: '목', yin: false, animal: '호랑이', hourRange: '03~05시' },
  { han: '卯', ko: '묘', element: '목', yin: true, animal: '토끼', hourRange: '05~07시' },
  { han: '辰', ko: '진', element: '토', yin: false, animal: '용', hourRange: '07~09시' },
  { han: '巳', ko: '사', element: '화', yin: true, animal: '뱀', hourRange: '09~11시' },
  { han: '午', ko: '오', element: '화', yin: false, animal: '말', hourRange: '11~13시' },
  { han: '未', ko: '미', element: '토', yin: true, animal: '양', hourRange: '13~15시' },
  { han: '申', ko: '신', element: '금', yin: false, animal: '원숭이', hourRange: '15~17시' },
  { han: '酉', ko: '유', element: '금', yin: true, animal: '닭', hourRange: '17~19시' },
  { han: '戌', ko: '술', element: '토', yin: false, animal: '개', hourRange: '19~21시' },
  { han: '亥', ko: '해', element: '수', yin: true, animal: '돼지', hourRange: '21~23시' },
]

// 오행 표시 정보 — 색상만으로 구분하지 않도록 라벨을 항상 함께 쓴다.
export const FIVE_ELEMENTS = {
  목: { label: '목', hanja: '木', color: '#4ade80', tone: '초록', season: '봄', keyword: '성장과 확장' },
  화: { label: '화', hanja: '火', color: '#f87171', tone: '빨강', season: '여름', keyword: '표현과 열정' },
  토: { label: '토', hanja: '土', color: '#d9b06a', tone: '황토', season: '환절기', keyword: '안정과 중재' },
  금: { label: '금', hanja: '金', color: '#d6dae3', tone: '은색', season: '가을', keyword: '결단과 정리' },
  수: { label: '수', hanja: '水', color: '#60a5fa', tone: '파랑', season: '겨울', keyword: '사고와 유연함' },
}

export const ELEMENT_ORDER = ['목', '화', '토', '금', '수']

// 상생: 목→화→토→금→수→목
export const GENERATES = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' }
// 상극: 목→토, 토→수, 수→화, 화→금, 금→목
export const CONTROLS = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' }

// 십성 — 일간과 다른 천간/지지의 관계
export const TEN_GODS = {
  비견: { short: '비견', category: '비겁', plain: '나와 같은 힘, 자기주장과 독립성' },
  겁재: { short: '겁재', category: '비겁', plain: '경쟁과 지출, 관계 긴장' },
  식신: { short: '식신', category: '식상', plain: '생산성과 안정적인 표현' },
  상관: { short: '상관', category: '식상', plain: '말과 창의성, 때로 반발심' },
  편재: { short: '편재', category: '재성', plain: '외부의 돈과 기회, 이동성' },
  정재: { short: '정재', category: '재성', plain: '고정 수입과 현실 감각' },
  편관: { short: '편관', category: '관성', plain: '압박과 변수, 승부의 긴장' },
  정관: { short: '정관', category: '관성', plain: '책임과 규칙, 평가' },
  편인: { short: '편인', category: '인성', plain: '직감과 비정형 도움' },
  정인: { short: '정인', category: '인성', plain: '보호와 문서, 학습과 회복' },
}

export const SEXAGENARY_CYCLE_LENGTH = 60

/** 60갑자 인덱스 → { stem, branch, name } */
export function pillarFromIndex(index) {
  const i = ((index % 60) + 60) % 60
  const stem = HEAVENLY_STEMS[i % 10]
  const branch = EARTHLY_BRANCHES[i % 12]
  return {
    index: i,
    stem,
    branch,
    han: `${stem.han}${branch.han}`,
    ko: `${stem.ko}${branch.ko}`,
  }
}

/**
 * 일간(dayStem)을 기준으로 대상 천간의 십성을 구한다.
 * 오행 관계(같음/생/극)와 음양의 동일 여부로 열 가지를 가른다.
 */
export function tenGodOf(dayStem, targetStem) {
  const me = dayStem.element
  const other = targetStem.element
  const sameYinYang = dayStem.yin === targetStem.yin

  if (me === other) return sameYinYang ? '비견' : '겁재'
  if (GENERATES[me] === other) return sameYinYang ? '식신' : '상관'
  if (CONTROLS[me] === other) return sameYinYang ? '편재' : '정재'
  if (CONTROLS[other] === me) return sameYinYang ? '편관' : '정관'
  if (GENERATES[other] === me) return sameYinYang ? '편인' : '정인'
  return '비견'
}

/** 지지의 오행을 일간 기준 십성으로 환산 — 지지는 대표 오행만 사용하는 간이 방식 */
export function tenGodOfBranch(dayStem, branch) {
  const pseudoStem = { element: branch.element, yin: branch.yin }
  return tenGodOf(dayStem, pseudoStem)
}
