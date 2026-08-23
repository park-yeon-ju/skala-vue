import { createRouter, createWebHistory } from 'vue-router'
import IntegratedFortuneView from '../views/IntegratedFortuneView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'integrated',
      component: IntegratedFortuneView,
      meta: { index: '00', label: '통합 운세' },
    },
    {
      // 나머지 화면은 방문 시점에 불러온다(지연 로딩).
      path: '/saju',
      name: 'saju',
      component: () => import('../views/SajuFortuneView.vue'),
      meta: { index: '01', label: '사주 운세' },
    },
    {
      path: '/astrology',
      name: 'astrology',
      component: () => import('../views/AstrologyFortuneView.vue'),
      meta: { index: '02', label: '별자리 운세' },
    },
    {
      path: '/daily-life',
      name: 'daily-life',
      component: () => import('../views/DailyLifeView.vue'),
      meta: { index: '03', label: '오늘 하루' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { index: '04', label: '설정' },
    },
    {
      // 존재하지 않는 주소는 모두 안내 화면으로 보낸다.
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { label: '오류' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export const NAV_ITEMS = [
  { name: 'integrated', index: '00', label: '통합 운세', to: '/' },
  { name: 'saju', index: '01', label: '사주 운세', to: '/saju' },
  { name: 'astrology', index: '02', label: '별자리 운세', to: '/astrology' },
  { name: 'daily-life', index: '03', label: '오늘 하루', to: '/daily-life' },
  { name: 'settings', index: '04', label: '설정', to: '/settings' },
]

export default router
