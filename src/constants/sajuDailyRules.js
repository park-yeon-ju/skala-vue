/**
 * 사주 오늘의 운세 규칙표.
 * 십성이 각 종목에 주는 가중치와, 그 십성이 강한 날의 문장 소재를 모아둔다.
 * 점수는 이 표만으로 결정되므로 같은 사람·같은 날짜면 항상 같은 결과가 나온다.
 */

/** 십성별 종목 가중치 — 기준점 50에 더해진다. */
export const TEN_GOD_WEIGHTS = {
  비견: { wealth: -4, love: -3, health: 5, business: 5, career: -3, study: 1 },
  겁재: { wealth: -8, love: -5, health: 2, business: 3, career: -4, study: -2 },
  식신: { wealth: 5, love: 4, health: 7, business: 5, career: 2, study: 8 },
  상관: { wealth: 3, love: -4, health: 0, business: 6, career: -7, study: 7 },
  편재: { wealth: 9, love: 5, health: -2, business: 8, career: 1, study: -3 },
  정재: { wealth: 8, love: 6, health: 2, business: 3, career: 5, study: 0 },
  편관: { wealth: -3, love: -2, health: -7, business: 6, career: 4, study: -2 },
  정관: { wealth: 2, love: 5, health: 1, business: 2, career: 9, study: 3 },
  편인: { wealth: -3, love: -3, health: 2, business: -2, career: 0, study: 6 },
  정인: { wealth: 1, love: 2, health: 6, business: -1, career: 3, study: 9 },
}

/** 어느 운의 십성을 얼마나 크게 볼지 — 일진이 오늘 체감의 핵심이다. */
export const PILLAR_INFLUENCE = {
  iljin: 3,
  iljinBranch: 1.5,
  wolun: 1.2,
  seun: 0.8,
  daeun: 0.8,
}

/** 십성이 강한 날의 성향 문장 — 좋은 쪽과 주의할 쪽을 함께 쓴다. */
export const TEN_GOD_ENERGY = {
  비견: {
    title: '스스로 밀고 나가는 날',
    description: '내 힘으로 결정하고 움직이려는 기운이 강합니다. 주도권을 쥐기 좋지만 혼자 짊어지기 쉽습니다.',
    helpful: ['혼자 처리하는 업무', '체력을 쓰는 일', '스스로 정한 기준 지키기'],
    cautions: ['고집으로 굳어지는 대화', '도움 요청을 미루는 습관'],
  },
  겁재: {
    title: '경쟁과 지출이 함께 오는 날',
    description: '밀어붙이는 힘은 강하지만 나가는 돈과 감정 소모도 함께 커집니다.',
    helpful: ['승부를 봐야 하는 일', '미뤄둔 정리'],
    cautions: ['충동 지출', '금전이 얽힌 부탁', '감정적인 언쟁'],
  },
  식신: {
    title: '꾸준히 만들어내는 날',
    description: '무리하지 않고도 결과가 쌓이는 흐름입니다. 몸과 마음의 컨디션도 비교적 안정적입니다.',
    helpful: ['반복 작업 마무리', '식사와 휴식 챙기기', '가벼운 창작'],
    cautions: ['늘어지는 일정', '지나친 안주'],
  },
  상관: {
    title: '말과 아이디어가 앞서는 날',
    description: '표현력과 발상이 살아나지만, 규칙이나 윗사람과 부딪히기도 쉽습니다.',
    helpful: ['기획과 제안', '글쓰기와 발표', '새로운 시도'],
    cautions: ['즉흥적인 말', '규정을 건너뛰는 판단', '평가 자리에서의 과한 솔직함'],
  },
  편재: {
    title: '기회가 밖에서 들어오는 날',
    description: '외부 거래와 이동에서 이득이 생깁니다. 다만 손에 들어온 만큼 빠져나가기도 쉽습니다.',
    helpful: ['영업과 미팅', '외부 제안 검토', '이동이 있는 일정'],
    cautions: ['한 번에 크게 거는 결정', '즉흥적인 큰 지출'],
  },
  정재: {
    title: '숫자를 맞춰두기 좋은 날',
    description: '현실 감각이 또렷해집니다. 관리하고 정리하는 일에 특히 잘 맞습니다.',
    helpful: ['예산과 정산', '계약서 확인', '약속 지키기'],
    cautions: ['지나친 계산으로 기회를 놓치는 것', '인색해 보이는 태도'],
  },
  편관: {
    title: '압박이 집중력을 만드는 날',
    description: '긴장이 높아지는 만큼 몰입도 깊어집니다. 대신 몸이 먼저 지칩니다.',
    helpful: ['마감이 걸린 일', '결단이 필요한 사안'],
    cautions: ['과로와 수면 부족', '급한 이동', '감정이 실린 충돌'],
  },
  정관: {
    title: '책임이 인정으로 이어지는 날',
    description: '맡은 자리에서의 태도가 그대로 평가로 돌아옵니다. 공적인 일에 유리합니다.',
    helpful: ['보고와 결재', '공식 요청', '규칙대로 처리하기'],
    cautions: ['부담을 혼자 떠안기', '형식에 눌려 굳어지는 것'],
  },
  편인: {
    title: '직감이 앞서는 날',
    description: '남들이 못 본 지점을 잡아냅니다. 다만 확신이 늦어 결정이 미뤄지기 쉽습니다.',
    helpful: ['자료 조사', '아이디어 수집', '혼자 생각하는 시간'],
    cautions: ['의심으로 인한 지연', '결론 없는 고민'],
  },
  정인: {
    title: '배우고 회복하는 날',
    description: '보호받는 기운입니다. 새로 벌이기보다 채우고 정리하기에 알맞습니다.',
    helpful: ['공부와 정리', '문서 처리', '휴식과 회복'],
    cautions: ['수동적으로 흘려보내는 시간', '결정을 남에게 미루기'],
  },
}

/** 오행이 보완될 때/과열될 때의 한 줄 근거 */
export const ELEMENT_FLOW_NOTE = {
  supplement: (element) => `원국에서 부족한 ${element} 기운이 오늘 들어와 균형을 채워 줍니다.`,
  overheat: (element) => `이미 강한 ${element} 기운이 오늘 다시 겹쳐 과열되기 쉽습니다.`,
  neutral: (element) => `오늘은 ${element} 기운이 무리 없이 흐릅니다.`,
}

/** 점수대별 종합 소견 뼈대 */
export const SUMMARY_TEMPLATES = {
  excellent: '전반적으로 흐름이 열려 있습니다. 미뤄둔 일을 오늘 안에 매듭지어도 무리가 없습니다.',
  good: '큰 걸림돌 없이 움직일 수 있는 날입니다. 계획한 순서대로 밀고 나가면 됩니다.',
  normal: '특별히 좋지도 나쁘지도 않은 평이한 흐름입니다. 새로 벌이기보다 하던 일을 이어가세요.',
  caution: '속도를 줄여야 하는 날입니다. 확인 한 번을 더 넣으면 손실을 막을 수 있습니다.',
  danger: '무리한 결정이 그대로 손해로 이어지기 쉽습니다. 오늘은 규모를 줄이는 편이 낫습니다.',
}
