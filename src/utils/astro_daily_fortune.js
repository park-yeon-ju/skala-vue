/**
 * astro_daily_fortune.js — 별자리 관점의 오늘의 운세 생성기
 *
 * 오늘 트랜짓과 출생 차트 사이의 각(어스펙트)만으로 점수를 만든다.
 * 사주 계산 결과는 이 모듈에 들어오지 않는다.
 */
import { calculateTransitChart, findAspects, houseOf } from './astro_calculator.js'
import { FORTUNE_CATEGORIES } from '../constants/fortuneCategories.js'
import { clampScore, gradeOf } from '../constants/scoreGrades.js'
import {
  PLANET_CATEGORY_WEIGHTS,
  HOUSE_CATEGORIES,
  HOUSE_MEANINGS,
  MOON_ELEMENT_MOOD,
  SUMMARY_TEMPLATES,
} from '../constants/astrologyDailyRules.js'
import { pickLucky, ASTRO_ELEMENT_TO_FIVE } from '../constants/luckyRules.js'
import { toDateKey } from './saju_daily_fortune.js'

/**
 * @param {object} natal  calculateNatalChart() 결과
 * @param {Date}   target 기준 날짜
 * @returns 공통 운세 결과 모델 (type: 'astrology')
 */
export function buildAstroDailyFortune(natal, target) {
  const transit = calculateTransitChart(target)
  const aspects = findAspects(transit.planets, natal.planets)
  const topAspects = aspects.slice(0, 12)

  const ascendant = natal.angles?.ascendant ?? null
  const moonMood = MOON_ELEMENT_MOOD[transit.moon.sign.element]

  // 종목별 점수 — 각의 성질 × 행성 영향 × 오브 강도
  const categories = FORTUNE_CATEGORIES.map((category) => {
    let raw = 50
    const evidence = []

    for (const item of topAspects) {
      const planetWeight = PLANET_CATEGORY_WEIGHTS[item.transit.key]?.[category.key] ?? 0
      const natalWeight = PLANET_CATEGORY_WEIGHTS[item.natal.key]?.[category.key] ?? 0
      const base = (planetWeight + natalWeight) / 2
      if (base === 0) continue

      const delta = base * item.aspect.polarity * item.strength * 1.15
      raw += delta

      if (Math.abs(delta) >= 3.5) {
        evidence.push(
          `트랜짓 ${item.transit.name} ${item.aspect.name} 출생 ${item.natal.name} (오브 ${item.orb}°) — ${item.aspect.note}`,
        )
      }
    }

    // 하우스 강조 — 하우스를 계산할 수 있을 때만 반영한다.
    if (ascendant !== null) {
      const moonHouse = houseOf(transit.moon.longitude, ascendant)
      if (moonHouse && HOUSE_CATEGORIES[moonHouse]?.includes(category.key)) {
        raw += 5
        evidence.push(`오늘 달이 ${moonHouse}하우스(${HOUSE_MEANINGS[moonHouse]})를 지나 이 영역이 강조됩니다`)
      }
    }

    const score = clampScore(raw)
    return {
      key: category.key,
      label: category.label,
      score,
      grade: gradeOf(score).label,
      description: categoryLine(category.key, score, transit.moon.sign.name),
      evidence: evidence.slice(0, 4),
    }
  })

  const totalScore = clampScore(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  )
  const grade = gradeOf(totalScore)

  const positive = topAspects.filter((a) => a.aspect.polarity > 0).slice(0, 3)
  const negative = topAspects.filter((a) => a.aspect.polarity < 0).slice(0, 3)

  const moonHouse = ascendant !== null ? houseOf(transit.moon.longitude, ascendant) : null

  // 행운 정보 — 오늘 달이 지나는 원소를 오행 표기로 옮겨 규칙표에 태운다.
  const luckyElement = ASTRO_ELEMENT_TO_FIVE[transit.moon.sign.element] ?? '토'
  const lucky = {
    ...pickLucky(luckyElement, Math.round(transit.moon.longitude)),
    evidence: `오늘 달이 ${transit.moon.sign.name}(${transit.moon.sign.element} 원소)를 지나고 있어 그 원소에 맞춘 계열로 골랐습니다.`,
  }

  return {
    type: 'astrology',
    date: toDateKey(target),
    totalScore,
    grade: grade.label,
    headline: `${moonMood.title} — 달이 ${transit.moon.sign.name}에 머무는 날`,
    energy: {
      title: moonMood.title,
      description: moonMood.description,
      helpful: moonMood.helpful,
      cautions: moonMood.cautions,
      evidence: [
        `오늘 달: ${transit.moon.sign.name} ${transit.moon.degree}° (${transit.moon.sign.element} 원소)`,
        `오늘 태양: ${transit.sun.sign.name} ${transit.sun.degree}°`,
        moonHouse ? `강조되는 하우스: ${moonHouse}하우스 · ${HOUSE_MEANINGS[moonHouse]}` : '출생 정보가 부족해 하우스는 계산하지 않았습니다',
        ...topAspects.slice(0, 3).map(
          (a) => `트랜짓 ${a.transit.name} ${a.aspect.name} 출생 ${a.natal.name} (오브 ${a.orb}°)`,
        ),
      ],
    },
    summary: SUMMARY_TEMPLATES[grade.tone],
    outlook: outlookOf(categories, transit),
    categories,
    recommendedActions: moonMood.helpful,
    cautionActions: moonMood.cautions,
    lucky,
    advice: adviceOf(grade.tone, transit, positive, negative),
    basis: [
      `출생 태양 ${natal.sun.sign.name} ${natal.sun.degree}° · 달 ${natal.moon.sign.name} ${natal.moon.degree}°`,
      natal.hasAngles
        ? `상승궁 ${natal.ascendantSign.name} · MC ${natal.midheavenSign.name} (Whole Sign 하우스)`
        : '출생시각 또는 출생지역이 없어 상승궁과 하우스는 계산하지 않았습니다',
      `오늘 트랜짓 달 ${transit.moon.sign.name} ${transit.moon.degree}°`,
      `주요 어스펙트 ${topAspects.length}건 중 상위 ${Math.min(3, topAspects.length)}건을 우선 반영`,
      '하우스는 Whole Sign 방식이라 Placidus를 쓰는 자료와 표기가 다를 수 있습니다',
    ],
    detail: {
      transit,
      aspects: topAspects,
      positive,
      negative,
      moonHouse,
    },
  }
}

function categoryLine(key, score, moonSignName) {
  const tone = score >= 70 ? 'good' : score >= 50 ? 'normal' : 'caution'
  const lines = {
    wealth: {
      good: '금전 흐름을 만드는 각이 우세합니다. 청구와 정산을 미루지 마세요.',
      normal: '큰 변동 신호가 없습니다. 계획한 지출 안에서 움직이세요.',
      caution: '소비를 부추기는 각이 걸려 있습니다. 큰 결제는 하루 뒤로 미루세요.',
    },
    love: {
      good: '관계를 부드럽게 만드는 각이 들어옵니다. 먼저 표현해도 좋습니다.',
      normal: '평소의 거리를 유지하면 무난합니다.',
      caution: '오해가 생기기 쉬운 배치입니다. 문자보다 통화로 확인하세요.',
    },
    health: {
      good: '체력과 회복이 안정적입니다. 루틴을 다시 잡기 좋습니다.',
      normal: '무리하지 않으면 유지됩니다.',
      caution: '피로가 몰리는 각입니다. 수면 시간을 먼저 확보하세요.',
    },
    business: {
      good: '확장과 제안에 유리한 각입니다. 먼저 움직이세요.',
      normal: '진행 중인 건을 이어가기 적당합니다.',
      caution: '새 계약은 조건을 한 번 더 확인하세요.',
    },
    career: {
      good: '책임을 맡을수록 평가가 올라가는 배치입니다.',
      normal: '정해진 절차대로 처리하면 무난합니다.',
      caution: '상급자와의 마찰이 생기기 쉽습니다. 기록을 남기세요.',
    },
    study: {
      good: '집중이 오래 갑니다. 어려운 자료를 앞으로 당기세요.',
      normal: '분량을 나눠 처리하면 무리 없습니다.',
      caution: '주의가 흩어지기 쉽습니다. 짧게 끊어 반복하세요.',
    },
  }
  return `${lines[key][tone]} (오늘의 달: ${moonSignName})`
}

function outlookOf(categories, transit) {
  const best = [...categories].sort((a, b) => b.score - a.score)[0]
  const worst = [...categories].sort((a, b) => a.score - b.score)[0]
  return `달이 ${transit.moon.sign.name}를 지나며 ${best.label} 쪽이 가장 매끄럽고, ${worst.label}이 가장 조심스럽습니다. ${best.label}에 시간을 몰아주고 ${worst.label}은 확인을 한 번 더 넣으면 하루가 안정됩니다.`
}

function adviceOf(tone, transit, positive, negative) {
  const head = {
    excellent: '오늘은 천체 배치가 서로 밀어줍니다.',
    good: '큰 마찰 없이 흘러가는 배치입니다.',
    normal: '눈에 띄는 각이 적어 평이한 하루입니다.',
    caution: '마찰을 만드는 각이 걸려 있습니다.',
    danger: '부딪히는 각이 겹쳐 무리한 결정이 위험합니다.',
  }[tone]

  const good = positive[0]
    ? `${positive[0].transit.name}이 ${positive[0].natal.name}과 ${positive[0].aspect.name}을 이루어 ${positive[0].transit.role} 쪽이 잘 풀립니다.`
    : '특별히 밀어주는 각은 없습니다.'
  const bad = negative[0]
    ? `반대로 ${negative[0].transit.name}과 ${negative[0].natal.name}의 ${negative[0].aspect.name}이 걸려 ${negative[0].natal.role} 쪽에서 마찰이 생기기 쉽습니다.`
    : '크게 부딪히는 각은 없습니다.'

  return `${head} ${good} ${bad} 달이 ${transit.moon.sign.name}에 있는 동안은 ${MOON_ELEMENT_MOOD[transit.moon.sign.element].helpful[0]} 쪽으로 하루를 배치하면 체감이 좋아집니다.`
}
