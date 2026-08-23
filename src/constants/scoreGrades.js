// 점수 → 등급 변환. 색상만으로 구분하지 않도록 라벨을 항상 함께 쓴다.
export const SCORE_GRADES = [
  { min: 85, max: 100, label: '매우 좋음', tone: 'excellent', color: '#8fd6c0', advice: '적극적으로 움직여도 좋은 날' },
  { min: 70, max: 84, label: '좋음', tone: 'good', color: '#a9b8f0', advice: '계획한 일을 밀어붙이기 좋은 날' },
  { min: 50, max: 69, label: '보통', tone: 'normal', color: '#c9c9d6', advice: '무리 없이 평소대로 가는 날' },
  { min: 30, max: 49, label: '주의', tone: 'caution', color: '#e2c08d', advice: '속도를 줄이고 확인을 늘릴 날' },
  { min: 0, max: 29, label: '매우 주의', tone: 'danger', color: '#e39a9a', advice: '중요한 결정을 미루는 편이 나은 날' },
]

export function gradeOf(score) {
  const clamped = clampScore(score)
  return SCORE_GRADES.find((g) => clamped >= g.min && clamped <= g.max) ?? SCORE_GRADES[2]
}

export function clampScore(score) {
  if (!Number.isFinite(score)) return 50
  return Math.max(0, Math.min(100, Math.round(score)))
}

/** 두 관점의 점수 차이가 이 이상이면 "서로 다른 흐름"으로 본다. */
export const DIVERGENCE_THRESHOLD = 20
