<script setup>
/** 오류·데이터 없음·설정 필요를 한 컴포넌트로 처리한다. */
defineProps({
  title: { type: String, default: '데이터를 불러오지 못했습니다' },
  message: { type: String, default: '' },
  variant: { type: String, default: 'error' }, // error | empty | setup
  actionLabel: { type: String, default: '' },
})
defineEmits(['action'])
</script>

<template>
  <div class="state" :class="`state--${variant}`" role="alert">
    <p class="eyebrow">{{ variant === 'empty' ? 'NO DATA' : variant === 'setup' ? 'SETUP REQUIRED' : 'ERROR' }}</p>
    <h3 class="display-md">{{ title }}</h3>
    <p v-if="message" class="message">{{ message }}</p>
    <slot />
    <button v-if="actionLabel" class="pill" type="button" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.state {
  border: 1px solid var(--line-faint);
  border-left: 1px solid var(--line-strong);
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  background: var(--bg-card);
}

.state--error {
  border-left-color: var(--tone-danger);
}

.state--setup {
  border-left-color: var(--accent);
}

.state--empty {
  border-left-color: var(--line-strong);
}

.message {
  color: var(--text-muted);
  margin: 0;
  max-width: none;
}
</style>
