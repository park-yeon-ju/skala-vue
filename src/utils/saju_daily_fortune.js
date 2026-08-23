/**
 * saju_daily_fortune.js — 사주 관점의 오늘의 운세 생성기
 *
 * 점수는 십성 가중치표(sajuDailyRules)와 오행 보완/과열 판정만으로 결정된다.
 * 난수를 쓰지 않으므로 같은 원국·같은 날짜면 언제나 같은 결과가 나온다.
 * 점성술 계산 결과는 이 모듈에 들어오지 않는다.
 */
import { calculateDailyPillars, findCurrentDaeun } from './manse_calculator.js'
import { tenGodOf, tenGodOfBranch, GENERATES, CONTROLS } from '../constants/sajuTerms.js'
import { FORTUNE_CATEGORIES, CATEGORY_KEYS } from '../constants/fortuneCategories.js'
import { clampScore, gradeOf } from '../constants/scoreGrades.js'
import {
  TEN_GOD_WEIGHTS,
  PILLAR_INFLUENCE,
  TEN_GOD_ENERGY,
  ELEMENT_FLOW_NOTE,
  SUMMARY_TEMPLATES,
} from '../constants/sajuDailyRules.js'
import { pickLucky } from '../constants/luckyRules.js'

/**
 * @param {object} manse   calculateManse() 결과
 * @param {Date}   target  기준 날짜
 * @returns 공통 운세 결과 모델 (type: 'saju')
 */
export function buildSajuDailyFortune(manse, target) {
  const daily = calculateDailyPillars(target)
  const dayStem = manse.dayStem
  const currentDaeun = findCurrentDaeun(manse.daeun, manse.birthDate, target)

  // 오늘 작용하는 십성들 — 영향도가 큰 순서대로 모은다.
  const influences = [
    { key: 'iljin', label: '일진', pillar: daily.iljin, god: tenGodOf(dayStem, daily.iljin.stem), weight: PILLAR_INFLUENCE.iljin },
    { key: 'iljinBranch', label: '일진 지지', pillar: daily.iljin, god: tenGodOfBranch(dayStem, daily.iljin.branch), weight: PILLAR_INFLUENCE.iljinBranch },
    { key: 'wolun', label: '월운', pillar: daily.wolun, god: tenGodOf(dayStem, daily.wolun.stem), weight: PILLAR_INFLUENCE.wolun },
    { key: 'seun', label: '세운', pillar: daily.seun, god: tenGodOf(dayStem, daily.seun.stem), weight: PILLAR_INFLUENCE.seun },
    { key: 'daeun', label: '대운', pillar: currentDaeun.pillar, god: tenGodOf(dayStem, currentDaeun.pillar.stem), weight: PILLAR_INFLUENCE.daeun },
  ]

  // 오행 보완/과열 — 원국 분포와 오늘 들어오는 오행을 견준다.
  const todayElement = daily.iljin.stem.element
  const elementFlow = judgeElementFlow(manse, todayElement)

  // 종목별 점수
  const categories = FORTUNE_CATEGORIES.map((category) => {
    let raw = 50
    const evidence = []
    for (const inf of influences) {
      const weight = TEN_GOD_WEIGHTS[inf.god]?.[category.key] ?? 0
      if (weight === 0) continue
      raw += weight * inf.weight
      if (Math.abs(weight) >= 5) {
        evidence.push(`${inf.label} ${inf.pillar.han}의 ${inf.god}이 ${weight > 0 ? '힘을 보탬' : '부담을 줌'}`)
      }
    }
    raw += elementFlow.bonus
    evidence.push(elementFlow.note)

    const score = clampScore(raw)
    return {
      key: category.key,
      label: category.label,
      score,
      grade: gradeOf(score).label,
      description: categoryLine(category.key, score, influences[0].god),
      evidence,
    }
  })

  const totalScore = clampScore(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  )
  const grade = gradeOf(totalScore)
  const mainGod = influences[0].god
  const energy = TEN_GOD_ENERGY[mainGod]

  // 행운 정보 — 보완이 필요한 오행을 우선으로, 일진 인덱스를 변형값으로 쓴다.
  const luckyElement = elementFlow.needElement
  const lucky = {
    ...pickLucky(luckyElement, daily.iljin.index),
    evidence: `원국에서 ${manse.weakestElement} 기운이 가장 약하고 오늘 일진은 ${todayElement} 기운이라, 보완이 필요한 ${luckyElement} 계열로 골랐습니다.`,
  }

  return {
    type: 'saju',
    date: toDateKey(target),
    totalScore,
    grade: grade.label,
    headline: headlineOf(mainGod, totalScore),
    energy: {
      title: energy.title,
      description: `${energy.description} ${elementFlow.note}`,
      helpful: energy.helpful,
      cautions: energy.cautions,
      evidence: influences.map((i) => `${i.label} ${i.pillar.han} · ${i.god}`),
    },
    summary: SUMMARY_TEMPLATES[grade.tone],
    outlook: outlookOf(categories),
    categories,
    recommendedActions: energy.helpful,
    cautionActions: energy.cautions,
    lucky,
    advice: adviceOf(mainGod, grade.tone, elementFlow),
    basis: [
      `원국 ${[manse.pillars.hour?.han ?? '시주 미상', manse.pillars.day.han, manse.pillars.month.han, manse.pillars.year.han].join(' · ')}`,
      `일간 ${manse.dayStem.han}(${manse.dayStem.ko}) · ${manse.dayStem.element} 기운`,
      `현재 대운 ${currentDaeun.pillar.han} (${currentDaeun.age}세 기준)`,
      `세운 ${daily.seun.han} · 월운 ${daily.wolun.han} · 일진 ${daily.iljin.han}`,
      `절기 구간 ${daily.term.name}`,
      manse.hasHour ? '출생시각을 반영한 여덟 글자 기준' : '출생시각 미상으로 여섯 글자 기준 간이 해석',
    ],
    detail: {
      daily,
      currentDaeun,
      influences,
      elementFlow,
    },
  }
}

/** 원국 오행 분포와 오늘 오행을 견주어 보완/과열을 판정한다. */
function judgeElementFlow(manse, todayElement) {
  const counts = manse.elementCount
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const ratio = counts[todayElement] / total
  const needElement = pickNeedElement(manse)

  if (todayElement === manse.weakestElement || ratio <= 0.12) {
    return { kind: 'supplement', bonus: 6, note: ELEMENT_FLOW_NOTE.supplement(todayElement), needElement }
  }
  if (todayElement === manse.strongestElement && ratio >= 0.35) {
    return { kind: 'overheat', bonus: -6, note: ELEMENT_FLOW_NOTE.overheat(todayElement), needElement }
  }
  return { kind: 'neutral', bonus: 0, note: ELEMENT_FLOW_NOTE.neutral(todayElement), needElement }
}

/**
 * 보완이 필요한 오행 — 가장 약한 오행을 우선하되,
 * 그 오행을 살려주는(생하는) 오행이 더 약하면 그쪽을 택한다.
 */
function pickNeedElement(manse) {
  const weakest = manse.weakestElement
  const supporter = Object.entries(GENERATES).find(([, to]) => to === weakest)?.[0]
  if (supporter && manse.elementCount[supporter] < manse.elementCount[weakest]) return supporter
  return weakest
}

function headlineOf(god, score) {
  const base = TEN_GOD_ENERGY[god]?.title ?? '평이한 흐름의 날'
  if (score >= 85) return `${base} — 흐름이 크게 열려 있습니다`
  if (score >= 70) return `${base} — 밀고 나가도 좋습니다`
  if (score >= 50) return `${base} — 무리 없이 흘러갑니다`
  if (score >= 30) return `${base} — 속도 조절이 필요합니다`
  return `${base} — 오늘은 규모를 줄이세요`
}

function categoryLine(key, score, god) {
  const tone = score >= 70 ? 'good' : score >= 50 ? 'normal' : 'caution'
  const lines = {
    wealth: {
      good: '들어오는 쪽이 나가는 쪽보다 큽니다. 정산과 청구를 오늘 처리하세요.',
      normal: '큰 변동은 없습니다. 예산 범위 안에서 움직이면 무리 없습니다.',
      caution: '나가는 돈이 커지기 쉽습니다. 큰 지출은 하루 미루세요.',
    },
    love: {
      good: '표현이 그대로 전달됩니다. 미뤄둔 연락을 하기 좋습니다.',
      normal: '평소의 거리감을 유지하면 무난합니다.',
      caution: '말이 의도보다 세게 나갑니다. 한 박자 늦춰 답하세요.',
    },
    health: {
      good: '컨디션이 안정적입니다. 미뤄둔 운동을 시작하기 좋습니다.',
      normal: '무리하지 않으면 평소만큼 유지됩니다.',
      caution: '피로가 몰립니다. 수면과 식사 시간을 먼저 확보하세요.',
    },
    business: {
      good: '제안과 거래가 잘 붙습니다. 먼저 연락하세요.',
      normal: '진행 중인 건을 이어가기에 적당합니다.',
      caution: '새로 벌이기보다 기존 건을 지키는 편이 낫습니다.',
    },
    career: {
      good: '맡은 일이 그대로 평가로 이어집니다. 보고를 미루지 마세요.',
      normal: '정해진 절차대로 처리하면 무난합니다.',
      caution: '윗선과 부딪히기 쉽습니다. 기록을 남기며 진행하세요.',
    },
    study: {
      good: '집중이 오래 갑니다. 어려운 과제를 앞으로 당기세요.',
      normal: '분량을 나눠 처리하면 무리 없습니다.',
      caution: '산만해지기 쉽습니다. 짧게 끊어 반복하세요.',
    },
  }
  return `${lines[key][tone]} (오늘의 핵심 십성: ${god})`
}

function outlookOf(categories) {
  const best = [...categories].sort((a, b) => b.score - a.score)[0]
  const worst = [...categories].sort((a, b) => a.score - b.score)[0]
  return `오늘은 ${best.label}이 가장 무난하고, ${worst.label}이 가장 조심스러운 자리입니다. ${best.label} 쪽으로 시간을 몰아주고 ${worst.label}은 결정을 미루면 하루가 정리됩니다.`
}

function adviceOf(god, tone, elementFlow) {
  const head = {
    excellent: '오늘은 판단이 빠르고 결과도 따라옵니다.',
    good: '흐름이 순한 편이라 계획대로 밀어도 됩니다.',
    normal: '크게 기대하거나 걱정할 날은 아닙니다.',
    caution: '오늘은 확인을 늘리는 것이 가장 확실한 이득입니다.',
    danger: '규모를 줄이고 되돌릴 수 있는 선택만 하세요.',
  }[tone]

  const godNote = TEN_GOD_ENERGY[god]?.description ?? ''
  const flowNote =
    elementFlow.kind === 'supplement'
      ? '부족했던 기운이 채워지는 날이라 평소보다 회복이 빠릅니다.'
      : elementFlow.kind === 'overheat'
        ? '한쪽으로 기운이 몰리는 날이라 과속이 가장 큰 위험입니다.'
        : '기운이 한쪽으로 치우치지 않아 판단이 흔들릴 일은 적습니다.'

  return `${head} ${godNote} ${flowNote} 중요한 결정이 있다면 ${elementFlow.needElement} 기운을 보완하는 방향, 즉 서두르기보다 한 단계 확인하는 쪽으로 잡으세요.`
}

/** 오늘 강한 오행이 눌러야 할 상대 — 판단 근거 문장에 쓴다. */
export function controlledBy(element) {
  return Object.entries(CONTROLS).find(([, to]) => to === element)?.[0] ?? null
}

export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export { CATEGORY_KEYS }
