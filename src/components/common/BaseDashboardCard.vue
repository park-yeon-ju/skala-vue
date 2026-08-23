<script setup>
/**
 * 카드 껍데기. 제목·아이콘·본문·액션을 slot으로 받는다.
 * 데이터 흐름에는 관여하지 않고 시각적 틀만 담당한다.
 */
defineProps({
  title: { type: String, default: '' },
  index: { type: String, default: '' },
  icon: { type: String, default: '' },
  flat: { type: Boolean, default: false },
})
</script>

<template>
  <section class="aura-card" :class="{ 'aura-card--flat': flat }">
    <header v-if="title || index || $slots.header" class="card-head">
      <slot name="header">
        <p class="eyebrow">
          <span v-if="icon" aria-hidden="true">{{ icon }}</span>
          <span>{{ title }}</span>
        </p>
      </slot>
      <div v-if="$slots.action" class="card-action">
        <slot name="action" />
      </div>
    </header>

    <div class="card-body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card-foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.card-action {
  flex-shrink: 0;
}

.card-foot {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid var(--line-faint);
}
</style>
