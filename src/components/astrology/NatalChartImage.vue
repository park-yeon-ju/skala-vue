<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useChartImage } from '@/composables/useChartImage'

const props = defineProps({
  imageId: { type: String, default: null },
})
const emit = defineEmits(['change', 'delete'])

const { objectUrl, meta, loading, load } = useChartImage()
const dialogOpen = ref(false)

onMounted(() => load(props.imageId))
watch(() => props.imageId, (id) => load(id))

async function confirmDelete() {
  try {
    await ElMessageBox.confirm(
      '등록한 차트 이미지를 삭제하면 자체 계산 결과 또는 태양 별자리 일러스트로 전환됩니다.',
      '차트 이미지 삭제',
      { confirmButtonText: '삭제', cancelButtonText: '취소', type: 'warning' },
    )
    emit('delete')
  } catch {
    // 취소한 경우 아무것도 하지 않는다.
  }
}
</script>

<template>
  <div class="natal-image">
    <div v-if="loading" class="placeholder">이미지를 불러오는 중입니다…</div>

    <template v-else-if="objectUrl">
      <button class="image-frame" type="button" @click="dialogOpen = true" aria-label="차트 이미지 확대해서 보기">
        <img :src="objectUrl" :alt="'등록한 Astro-Seek 출생 차트 이미지'" />
        <span class="zoom-hint mono">클릭해서 확대</span>
      </button>

      <div class="actions">
        <button class="pill pill--ghost" type="button" @click="emit('change')">이미지 변경</button>
        <button class="pill pill--ghost" type="button" @click="confirmDelete">이미지 삭제</button>
      </div>

      <p v-if="meta" class="meta mono">{{ meta.name }}<template v-if="meta.size"> · {{ (meta.size / 1024).toFixed(0) }}KB</template><template v-else> · 기본 제공 예시</template></p>

      <el-dialog v-model="dialogOpen" title="Astro-Seek Birth Chart" width="min(92vw, 780px)" append-to-body>
        <img :src="objectUrl" alt="등록한 Astro-Seek 출생 차트 이미지 확대" class="dialog-image" />
      </el-dialog>
    </template>

    <div v-else class="placeholder">등록된 차트 이미지가 없습니다.</div>
  </div>
</template>

<style scoped>
.image-frame {
  display: block;
  position: relative;
  width: 100%;
  max-width: 100%;
  padding: 0;
  border: 1px solid var(--line-faint);
  background: var(--bg-card);
  cursor: zoom-in;
  border-radius: 2px;
  overflow: hidden;
}

.image-frame img {
  display: block;
  width: 100%;
  height: auto;
  /* 비율이 깨지지 않게 한다 */
  object-fit: contain;
}

.zoom-hint {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 3px 9px;
  background: rgba(5, 5, 7, 0.75);
  border: 1px solid var(--line-faint);
  border-radius: 999px;
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.meta {
  margin: 10px 0 0;
  color: var(--text-dim);
}

.placeholder {
  padding: 40px 20px;
  border: 1px dashed var(--line-soft);
  text-align: center;
  color: var(--text-dim);
  font-size: 0.93rem;
}

.dialog-image {
  width: 100%;
  height: auto;
  display: block;
}
</style>
