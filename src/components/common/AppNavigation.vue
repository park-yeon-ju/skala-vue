<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_ITEMS } from '@/router'
import { useProfileStore } from '@/stores/profileStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const route = useRoute()
const profile = useProfileStore()
const weather = useWeatherStore()
const { format } = useTemperature()

// 모바일에서는 메뉴를 접어둔다.
const menuOpen = ref(false)
watch(() => route.fullPath, () => (menuOpen.value = false))

/** 우측 칩 — 날씨를 이미 불러왔다면 현재 지역과 기온을 함께 보여준다. */
const regionChip = computed(() => {
  const region = weather.activeRegion ?? profile.currentRegionInfo
  if (!region) return null
  const temp = weather.weather ? format(weather.weather.temp, 0) : null
  return { label: region.label, temp }
})
</script>

<template>
  <header class="nav-root">
    <div class="nav-wrap">
      <div class="nav-bar">
        <RouterLink to="/" class="brand" aria-label="The Aura 홈으로">
          <span class="brand-mark" aria-hidden="true">✦</span>
          <span class="brand-name">The Aura</span>
        </RouterLink>

        <nav class="nav-desktop" aria-label="주요 메뉴">
          <RouterLink
            v-for="item in NAV_ITEMS"
            :key="item.name"
            :to="item.to"
            class="nav-link"
            :class="{ 'is-active': route.name === item.name }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="nav-right">
          <span v-if="regionChip" class="chip">
            <span class="chip-dot" aria-hidden="true" />
            {{ regionChip.label }}<template v-if="regionChip.temp"> · {{ regionChip.temp }}</template>
          </span>
          <span v-if="profile.isProfileComplete" class="chip chip--name">{{ profile.nickname }}</span>

          <button
            class="menu-toggle"
            type="button"
            :aria-expanded="menuOpen"
            aria-controls="mobile-menu"
            @click="menuOpen = !menuOpen"
          >
            <span class="sr-only">메뉴 열기</span>
            <span class="menu-bar" :class="{ open: menuOpen }" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- 모바일 메뉴 -->
      <Transition name="drop">
        <nav v-show="menuOpen" id="mobile-menu" class="nav-mobile" aria-label="모바일 메뉴">
          <RouterLink
            v-for="item in NAV_ITEMS"
            :key="item.name"
            :to="item.to"
            class="mobile-link"
            :class="{ 'is-active': route.name === item.name }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
.nav-root {
  position: sticky;
  top: 0;
  z-index: 40;
  padding: 14px 0 6px;
}

/* 알약 바 위아래 여백으로 본문이 비쳐 보이지 않도록 가리개를 깐다 */
.nav-root::before {
  content: '';
  position: absolute;
  inset: -14px 0 auto;
  height: 108px;
  pointer-events: none;
  background: linear-gradient(180deg, var(--bg-void) 0%, rgba(6, 6, 13, 0.86) 46%, transparent 100%);
}

.nav-wrap {
  position: relative;
}

.nav-wrap {
  max-width: var(--shell-max);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

/* 떠 있는 알약 모양 바 */
.nav-bar {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 58px;
  padding: 0 10px 0 18px;
  border: 1px solid var(--line-faint);
  border-radius: 999px;
  background: rgba(14, 15, 26, 0.7);
  backdrop-filter: blur(20px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.4);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: var(--text-bright);
  flex-shrink: 0;
}

.brand-mark {
  font-size: 1.08rem;
  color: var(--accent);
}

.brand-name {
  font-size: 1.14rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.nav-desktop {
  display: none;
  margin: 0 auto;
  gap: 6px;
}

.nav-link {
  position: relative;
  padding: 7px 14px;
  border-radius: 999px;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.99rem;
  transition:
    color 0.25s ease,
    background-color 0.25s ease;
}

.nav-link:hover {
  color: var(--text-bright);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.is-active {
  color: var(--text-bright);
  background: rgba(169, 155, 255, 0.16);
}

.nav-right {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.chip {
  display: none;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  border: 1px solid var(--line-faint);
  border-radius: 999px;
  font-size: 0.87rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 7px var(--accent-soft);
}

.chip--name {
  color: var(--text-primary);
}

.menu-toggle {
  width: 38px;
  height: 38px;
  border: 1px solid var(--line-faint);
  border-radius: 999px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.menu-bar {
  position: relative;
  display: block;
  width: 14px;
  height: 1.5px;
  border-radius: 2px;
  background: var(--text-primary);
  transition: background-color 0.2s ease;
}

.menu-bar::before,
.menu-bar::after {
  content: '';
  position: absolute;
  left: 0;
  width: 14px;
  height: 1.5px;
  border-radius: 2px;
  background: var(--text-primary);
  transition: transform 0.25s ease;
}

.menu-bar::before {
  top: -5px;
}

.menu-bar::after {
  top: 5px;
}

.menu-bar.open {
  background: transparent;
}

.menu-bar.open::before {
  transform: translateY(5px) rotate(45deg);
}

.menu-bar.open::after {
  transform: translateY(-5px) rotate(-45deg);
}

.nav-mobile {
  margin-top: 10px;
  padding: 8px;
  border: 1px solid var(--line-faint);
  border-radius: var(--radius-card);
  background: rgba(14, 15, 26, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45);
}

.mobile-link {
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.99rem;
}

.mobile-link.is-active {
  color: var(--text-bright);
  background: rgba(169, 155, 255, 0.16);
}

.drop-enter-active,
.drop-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (min-width: 640px) {
  .chip {
    display: inline-flex;
  }
}

@media (min-width: 900px) {
  .nav-desktop {
    display: flex;
  }

  .menu-toggle {
    display: none;
  }

  .nav-mobile {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drop-enter-active,
  .drop-leave-active {
    transition: none;
  }
}
</style>
