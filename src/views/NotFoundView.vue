<script setup>
import { useRouter } from 'vue-router'
import { NAV_ITEMS } from '@/router'

const router = useRouter()
</script>

<template>
  <div class="shell not-found">
    <p class="eyebrow">NOT FOUND</p>
    <h1 class="display-xl">길을 잃은<br />페이지입니다</h1>
    <p class="lede">
      요청하신 주소가 존재하지 않거나 아직 열리지 않았습니다. 아래 메뉴에서 원하는 화면으로 이동해 주세요.
    </p>

    <div class="actions">
      <button class="pill" type="button" @click="router.push('/')">통합 운세로 이동</button>
      <button class="pill pill--ghost" type="button" @click="router.back()">이전 화면으로</button>
    </div>

    <ul class="links">
      <li v-for="item in NAV_ITEMS" :key="item.name">
        <RouterLink :to="item.to">
          
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.not-found {
  padding: clamp(60px, 12vw, 140px) var(--gutter) 80px;
}

.lede {
  margin: 26px 0 0;
  color: var(--text-muted);
  max-width: none;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 36px;
  flex-wrap: wrap;
}

.links {
  list-style: none;
  margin: 56px 0 0;
  padding: 0;
  border-top: 1px solid var(--line-faint);
}

.links li a {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid var(--line-faint);
  text-decoration: none;
  color: var(--text-muted);
  transition: color 0.25s ease, padding-left 0.25s ease;
}

.links li a:hover {
  color: var(--text-bright);
  padding-left: 8px;
}

.idx {
  color: var(--text-dim);
  font-size: 0.78rem;
}
</style>
