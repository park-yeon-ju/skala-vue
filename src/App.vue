<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import AppNavigation from '@/components/common/AppNavigation.vue'
import StarfieldBackground from '@/components/common/StarfieldBackground.vue'
import IntroSplash from '@/components/common/IntroSplash.vue'
import { useProfileStore } from '@/stores/profileStore'

const profile = useProfileStore()

// 저장된 설정을 복원한다. 새로고침해도 사용자 정보가 유지되게 하는 지점.
onMounted(() => {
  profile.loadProfile()
})
</script>

<template>
  <div class="app-shell">
    <StarfieldBackground />
    <IntroSplash />

    <AppNavigation />

    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <div class="shell footer-inner">
        <div class="footer-left">
          <p class="brand">✦ The Aura</p>
          <p class="maker">SKALA 4기 광주 · 박연주</p>
        </div>
        <p class="disclaimer">
          사주와 점성술은 과학적 예측이 아니라 해석 콘텐츠입니다. 참고 자료로만 활용해 주세요.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  padding-bottom: 40px;
}

.app-footer {
  margin-top: 40px;
  padding: 26px 0 44px;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--line-faint);
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand {
  color: var(--text-muted);
  font-size: 0.93rem;
  letter-spacing: 0.06em;
  margin: 0;
}

.maker {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}

.disclaimer {
  margin: 0;
  font-size: 0.87rem;
  color: var(--text-dim);
  max-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}
</style>
