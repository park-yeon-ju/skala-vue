/**
 * integrated_fortune.js — 사주 결과와 별자리 결과를 종합한다.
 *
 * 두 관점을 그대로 나열하지 않고, 공통점·차이를 판정해 조건부 조언으로 바꾼다.
 * 여기서만 두 계산 결과를 합치고, 각 페이지의 계산은 서로 침범하지 않는다.
 */
import { FORTUNE_CATEGORIES } from '../constants/fortuneCategories.js'
import { clampScore, gradeOf, DIVERGENCE_THRESHOLD } from '../constants/scoreGrades.js'
import { pickLucky } from '../constants/luckyRules.js'

export function buildIntegratedFortune(saju, astro, target) {
  const categories = FORTUNE_CATEGORIES.map((category) => {
    const s = saju.categories.find((c) => c.key === category.key)
    const a = astro.categories.find((c) => c.key === category.key)
    const score = clampScore((s.score + a.score) / 2)
    const gap = Math.abs(s.score - a.score)
    const diverged = gap >= DIVERGENCE_THRESHOLD

    return {
      key: category.key,
      label: category.label,
      score,
      sajuScore: s.score,
      astrologyScore: a.score,
      grade: gradeOf(score).label,
      diverged,
      gap,
      description: mergeDescription(category, s, a, diverged),
      evidence: [...s.evidence.slice(0, 2), ...a.evidence.slice(0, 2)],
    }
  })

  const totalScore = clampScore(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length,
  )
  const grade = gradeOf(totalScore)

  const commonStrengths = categories.filter((c) => c.sajuScore >= 65 && c.astrologyScore >= 65)
  const commonCautions = categories.filter((c) => c.sajuScore < 50 && c.astrologyScore < 50)
  const conflicts = categories.filter((c) => c.diverged)

  // 행운 정보 — 두 관점이 같은 계열을 가리키면 그대로, 다르면 점수가 높은 쪽을 따른다.
  const lucky = mergeLucky(saju, astro)

  return {
    type: 'integrated',
    date: saju.date,
    totalScore,
    grade: grade.label,
    headline: mergeHeadline(saju, astro, totalScore),
    energy: {
      title: '오늘의 통합 기운',
      description: mergeEnergyLine(saju, astro),
      helpful: unique([...saju.energy.helpful.slice(0, 2), ...astro.energy.helpful.slice(0, 2)]),
      cautions: unique([...saju.energy.cautions.slice(0, 2), ...astro.energy.cautions.slice(0, 2)]),
      sajuTags: saju.energy.evidence.slice(0, 3),
      astrologyTags: astro.energy.evidence.slice(0, 3),
      evidence: [...saju.energy.evidence.slice(0, 2), ...astro.energy.evidence.slice(0, 2)],
    },
    summary: mergeSummary(saju, astro, commonStrengths, commonCautions, conflicts),
    outlook: mergeOutlook(categories),
    categories,
    recommendedActions: unique([...saju.recommendedActions, ...astro.recommendedActions]).slice(0, 5),
    cautionActions: unique([...saju.cautionActions, ...astro.cautionActions]).slice(0, 5),
    lucky,
    advice: mergeAdvice(saju, astro, conflicts, grade.tone),
    basis: [
      `사주 종합 ${saju.totalScore}점 · 별자리 종합 ${astro.totalScore}점`,
      ...saju.basis.slice(0, 2),
      ...astro.basis.slice(0, 2),
    ],
    detail: {
      commonStrengths,
      commonCautions,
      conflicts,
      sajuTotal: saju.totalScore,
      astrologyTotal: astro.totalScore,
    },
    targetDate: target,
  }
}

/** 두 관점이 갈릴 때 조건부 조언으로 바꾼다. */
function mergeDescription(category, s, a, diverged) {
  if (!diverged) {
    if (s.score >= 65 && a.score >= 65) {
      return `사주와 별자리가 모두 ${category.label}을 밀어주는 날입니다. 오늘 안에 진행하세요.`
    }
    if (s.score < 50 && a.score < 50) {
      return `두 관점 모두 ${category.label}에 부담을 봅니다. 규모를 줄이고 확인을 늘리세요.`
    }
    return `${category.label}은 큰 변동 없이 평이합니다. 하던 대로 이어가면 됩니다.`
  }

  const sajuUp = s.score > a.score
  const up = sajuUp ? '사주' : '별자리'
  const down = sajuUp ? '별자리' : '사주'
  return `${up}에서는 ${category.label}이 좋은 흐름이지만 ${down}에서는 마찰 신호가 나타납니다. 혼자 처리하는 부분은 속도를 내고, 상대가 있는 결정은 한 번 더 확인하세요.`
}

function mergeHeadline(saju, astro, total) {
  const gap = Math.abs(saju.totalScore - astro.totalScore)
  if (gap >= DIVERGENCE_THRESHOLD) {
    return '두 관점이 서로 다른 흐름을 가리키는 날 — 영역을 나눠 판단하세요'
  }
  if (total >= 85) return '두 관점이 같은 방향으로 열려 있는 날'
  if (total >= 70) return '큰 걸림돌 없이 밀고 나갈 수 있는 날'
  if (total >= 50) return '무리하지 않으면 무난하게 흘러가는 날'
  if (total >= 30) return '속도를 줄이고 확인을 늘려야 하는 날'
  return '중요한 결정을 미루는 편이 나은 날'
}

function mergeEnergyLine(saju, astro) {
  return `사주에서는 ${saju.energy.title.replace(/ 날$/, '')}, 별자리에서는 ${astro.energy.title.replace(/ 날$/, '')} 흐름입니다. 두 기운이 겹치는 지점에서 오늘의 체감이 결정됩니다.`
}

function mergeSummary(saju, astro, strengths, cautions, conflicts) {
  const parts = []
  if (strengths.length) {
    parts.push(`${strengths.map((c) => c.label).join('·')}은 두 관점이 모두 긍정적이라 오늘의 공통 강점입니다.`)
  }
  if (cautions.length) {
    parts.push(`${cautions.map((c) => c.label).join('·')}은 두 관점이 모두 부담을 봐서 주요 주의사항입니다.`)
  }
  if (conflicts.length) {
    parts.push(`${conflicts.map((c) => c.label).join('·')}은 두 관점의 점수 차가 커서 조건부로 판단해야 합니다.`)
  }
  if (!parts.length) {
    parts.push('두 관점 모두 뚜렷한 신호 없이 평이합니다. 하던 일을 이어가기 좋은 날입니다.')
  }
  return parts.join(' ')
}

function mergeOutlook(categories) {
  const best = [...categories].sort((a, b) => b.score - a.score)[0]
  const worst = [...categories].sort((a, b) => a.score - b.score)[0]
  return `오늘 하루는 ${best.label}(${best.score}점)을 중심으로 배치하고, ${worst.label}(${worst.score}점)은 결정을 뒤로 미루는 구성이 가장 안정적입니다.`
}

function mergeAdvice(saju, astro, conflicts, tone) {
  const base = {
    excellent: '두 관점이 같은 방향을 가리키니 오늘은 판단을 믿고 움직여도 좋습니다.',
    good: '흐름이 순한 편이라 계획한 순서대로 진행하면 됩니다.',
    normal: '크게 기대하거나 걱정할 날은 아닙니다. 평소의 리듬을 유지하세요.',
    caution: '오늘은 속도보다 확인이 이득입니다. 되돌릴 수 있는 선택만 하세요.',
    danger: '규모를 줄이고 중요한 결정은 다음으로 미루세요.',
  }[tone]

  const conflictNote = conflicts.length
    ? ` 다만 ${conflicts.map((c) => c.label).join('·')}처럼 두 관점이 갈리는 영역은, 혼자 처리하는 일은 속도를 내고 사람이 얽힌 결정은 한 번 더 확인하는 식으로 나눠 다루세요.`
    : ' 두 관점이 크게 어긋나지 않아 판단 기준을 하나로 유지해도 됩니다.'

  return `${base}${conflictNote} 사주가 짚는 ${saju.lucky.color.name}과 별자리가 짚는 ${astro.lucky.color.name} 중 오늘 손이 가는 쪽을 골라 지니면 하루의 기준점이 됩니다.`
}

function mergeLucky(saju, astro) {
  const preferSaju = saju.totalScore >= astro.totalScore
  const primary = preferSaju ? saju.lucky : astro.lucky
  const secondary = preferSaju ? astro.lucky : saju.lucky
  const sameDirection = saju.lucky.direction === astro.lucky.direction

  return {
    color: primary.color,
    number: primary.number,
    direction: sameDirection ? primary.direction : `${primary.direction} (보조: ${secondary.direction})`,
    time: primary.time,
    alternates: { saju: saju.lucky, astrology: astro.lucky },
    evidence: sameDirection
      ? `사주와 별자리가 같은 방향을 가리켜 ${primary.direction}으로 정했습니다.`
      : `사주(${saju.totalScore}점)와 별자리(${astro.totalScore}점) 중 점수가 높은 ${preferSaju ? '사주' : '별자리'} 쪽 기준을 우선하고 나머지를 보조로 두었습니다.`,
  }
}

function unique(list) {
  return [...new Set(list)]
}

export { pickLucky }
