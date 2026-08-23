/**
 * 별자리 오늘의 운세 규칙표.
 * 행성이 어떤 생활 영역을 담당하는지, 각(어스펙트)이 유리한지 부담인지를 정리해
 * 점수 가중치로 쓴다. 사주 규칙과 완전히 분리되어 있다.
 */

export const PLANETS = [
  { key: 'Sun', name: '태양', role: '의식적인 방향과 자기 표현', weight: 1.0 },
  { key: 'Moon', name: '달', role: '감정과 컨디션', weight: 1.2 },
  { key: 'Mercury', name: '수성', role: '말과 문서, 판단', weight: 1.0 },
  { key: 'Venus', name: '금성', role: '관계와 호감, 소비', weight: 1.0 },
  { key: 'Mars', name: '화성', role: '행동과 갈등, 체력', weight: 1.0 },
  { key: 'Jupiter', name: '목성', role: '확장과 기회', weight: 0.8 },
  { key: 'Saturn', name: '토성', role: '책임과 제한', weight: 0.8 },
  { key: 'Uranus', name: '천왕성', role: '돌발 변화', weight: 0.5 },
  { key: 'Neptune', name: '해왕성', role: '혼란과 영감', weight: 0.5 },
  { key: 'Pluto', name: '명왕성', role: '압박과 깊은 변화', weight: 0.5 },
]

/** 각(어스펙트) 정의 — 오브가 좁을수록 강하게 본다. */
export const ASPECTS = [
  { key: 'conjunction', name: '합', angle: 0, orb: 8, polarity: 1.0, note: '두 힘이 겹쳐 한 방향으로 강해집니다' },
  { key: 'sextile', name: '육분', angle: 60, orb: 4, polarity: 1.0, note: '가볍게 도와주는 흐름입니다' },
  { key: 'square', name: '사분', angle: 90, orb: 6, polarity: -1.0, note: '마찰이 생겨 조정이 필요합니다' },
  { key: 'trine', name: '삼분', angle: 120, orb: 6, polarity: 1.2, note: '자연스럽게 풀리는 흐름입니다' },
  { key: 'opposition', name: '충', angle: 180, orb: 7, polarity: -1.1, note: '양쪽으로 당겨져 균형이 필요합니다' },
]

/** 행성이 각 종목에 주는 기본 영향 — 각의 성질(polarity)과 곱해 쓴다. */
export const PLANET_CATEGORY_WEIGHTS = {
  Sun: { wealth: 3, love: 3, health: 5, business: 5, career: 6, study: 3 },
  Moon: { wealth: 2, love: 7, health: 6, business: 2, career: 2, study: 3 },
  Mercury: { wealth: 4, love: 2, health: 2, business: 5, career: 5, study: 8 },
  Venus: { wealth: 6, love: 8, health: 3, business: 4, career: 2, study: 2 },
  Mars: { wealth: 3, love: 4, health: 6, business: 7, career: 5, study: 2 },
  Jupiter: { wealth: 7, love: 4, health: 4, business: 7, career: 5, study: 5 },
  Saturn: { wealth: 4, love: 3, health: 5, business: 4, career: 7, study: 5 },
  Uranus: { wealth: 3, love: 3, health: 2, business: 4, career: 3, study: 3 },
  Neptune: { wealth: 2, love: 4, health: 3, business: 2, career: 2, study: 3 },
  Pluto: { wealth: 4, love: 4, health: 4, business: 4, career: 4, study: 2 },
}

/** 하우스와 생활 영역 연결 */
export const HOUSE_CATEGORIES = {
  1: ['health'],
  2: ['wealth'],
  3: ['study'],
  4: ['health'],
  5: ['love'],
  6: ['health', 'career'],
  7: ['love'],
  8: ['wealth'],
  9: ['study'],
  10: ['career', 'business'],
  11: ['business'],
  12: ['health'],
}

export const HOUSE_MEANINGS = {
  1: '자기 표현과 첫인상',
  2: '수입과 소유',
  3: '소통과 단거리 이동',
  4: '가정과 안정의 기반',
  5: '연애와 창작',
  6: '일상 업무와 건강 관리',
  7: '파트너십과 계약',
  8: '공동 자산과 깊은 변화',
  9: '배움과 먼 곳',
  10: '사회적 위치와 목표',
  11: '동료와 네트워크',
  12: '휴식과 내면 정리',
}

/** 달이 지나는 원소별 오늘의 분위기 */
export const MOON_ELEMENT_MOOD = {
  불: {
    title: '움직이면서 정리되는 날',
    description: '감정이 빠르게 올라오고 그만큼 빨리 식습니다. 앉아서 고민하기보다 몸을 먼저 움직이면 정리됩니다.',
    helpful: ['먼저 연락하기', '몸을 쓰는 일정', '짧게 끊어 결정하기'],
    cautions: ['즉흥적인 승낙', '욱하는 순간의 답장'],
  },
  흙: {
    title: '손에 잡히는 것부터 처리하는 날',
    description: '현실 감각이 또렷해집니다. 눈에 보이는 결과를 만들 때 마음이 안정됩니다.',
    helpful: ['정리와 정산', '미뤄둔 실무', '식사와 수면 정돈'],
    cautions: ['지나친 완벽주의', '변화 앞에서의 경직'],
  },
  공기: {
    title: '말과 정보가 오가는 날',
    description: '생각이 빨라지고 사람과 연결되는 흐름이 늘어납니다. 다만 깊이보다 폭이 넓어집니다.',
    helpful: ['회의와 조율', '자료 정리', '가벼운 만남'],
    cautions: ['말이 앞서는 약속', '집중력 분산'],
  },
  물: {
    title: '감정의 결이 살아나는 날',
    description: '분위기와 사람의 상태를 예민하게 읽습니다. 좋은 직감이 오지만 쉽게 물듭니다.',
    helpful: ['가까운 사람과의 대화', '창작과 기록', '혼자 쉬는 시간'],
    cautions: ['남의 감정까지 떠안기', '과거를 되짚는 대화'],
  },
}

export const SUMMARY_TEMPLATES = {
  excellent: '천체 배치가 서로 밀어주는 날입니다. 미뤄둔 연락과 제안을 오늘 꺼내도 좋습니다.',
  good: '큰 마찰 없이 흘러가는 배치입니다. 하려던 일을 그대로 진행하세요.',
  normal: '눈에 띄는 각이 적어 평이합니다. 새로 벌이기보다 이어가는 편이 낫습니다.',
  caution: '마찰을 만드는 각이 걸려 있습니다. 확인과 여유를 늘리세요.',
  danger: '부딪히는 각이 겹칩니다. 오늘은 결정을 미루고 규모를 줄이세요.',
}
