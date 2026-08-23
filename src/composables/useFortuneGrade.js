import { computed, unref } from 'vue'
import { gradeOf, SCORE_GRADES } from '@/constants/scoreGrades'

/**
 * 점수 → 등급/색상/톤. 색상만으로 구분되지 않도록 라벨을 항상 함께 돌려준다.
 */
export function useFortuneGrade(score) {
  const grade = computed(() => gradeOf(unref(score) ?? 50))
  return {
    grade,
    label: computed(() => grade.value.label),
    tone: computed(() => grade.value.tone),
    color: computed(() => grade.value.color),
    advice: computed(() => grade.value.advice),
  }
}

export { SCORE_GRADES, gradeOf }
