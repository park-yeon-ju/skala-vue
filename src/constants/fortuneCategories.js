// 종목별 운세 6개 — 사주·별자리·통합 페이지가 같은 키를 공유한다.
export const FORTUNE_CATEGORIES = [
  { key: 'wealth', label: '재물운', short: '재물', hint: '돈의 유입과 지출, 현실 감각' },
  { key: 'love', label: '애정운', short: '애정', hint: '관계의 온도와 거리 조절' },
  { key: 'health', label: '건강운', short: '건강', hint: '컨디션과 회복, 생활 관리' },
  { key: 'business', label: '사업운', short: '사업', hint: '확장과 거래, 승부의 타이밍' },
  { key: 'career', label: '직장운', short: '직장', hint: '책임과 평가, 조직 안에서의 위치' },
  { key: 'study', label: '학업운', short: '학업', hint: '집중과 학습, 표현과 생산성' },
]

export const CATEGORY_KEYS = FORTUNE_CATEGORIES.map((c) => c.key)

export function categoryLabel(key) {
  return FORTUNE_CATEGORIES.find((c) => c.key === key)?.label ?? key
}
