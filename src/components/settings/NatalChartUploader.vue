<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { validateChartFile, MAX_SIZE_BYTES } from '@/services/imageStorageService'
import { useChartImage } from '@/composables/useChartImage'

const props = defineProps({
  imageId: { type: String, default: null },
})
const emit = defineEmits(['upload', 'remove'])

const { objectUrl, meta, load, previewFile, release } = useChartImage()
const fileInput = ref(null)
const errorMessage = ref('')

onMounted(() => load(props.imageId))
watch(() => props.imageId, (id) => load(id))
// Object URL 은 composable 이 언마운트 시 해제하지만, 여기서도 명시적으로 정리한다.
onUnmounted(release)

function openPicker() {
  errorMessage.value = ''
  fileInput.value?.click()
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // 같은 파일을 다시 골라도 change 가 발생하도록 초기화
  if (!file) return

  const problem = validateChartFile(file)
  if (problem) {
    errorMessage.value = problem
    ElMessage.error(problem)
    return
  }

  errorMessage.value = ''
  previewFile(file) // 업로드 즉시 미리보기
  emit('upload', file)
}
</script>

<template>
  <div class="uploader">
    <p class="guide">
      더 정확한 별자리 운세를 원하면 Astro-Seek에서 Birth chart 이미지를 내려받아 등록해주세요.
      등록하지 않을 경우 생년월일시와 출생지역 기반 자체 계산 결과, 또는 태양 별자리 일러스트가 표시됩니다.
    </p>

    <div class="preview-row">
      <div class="preview">
        <img v-if="objectUrl" :src="objectUrl" alt="등록한 출생 차트 이미지 미리보기" />
        <span v-else class="placeholder">등록된 이미지 없음</span>
      </div>

      <div class="controls">
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          class="sr-only"
          aria-label="출생 차트 이미지 파일 선택"
          @change="onFileChange"
        />
        <button class="pill" type="button" @click="openPicker">
          {{ imageId ? '이미지 변경' : '이미지 등록' }}
        </button>
        <button v-if="imageId" class="pill pill--ghost" type="button" @click="emit('remove')">
          이미지 삭제
        </button>

        <p class="constraints mono">
          PNG · JPG · JPEG · WebP / 최대 {{ (MAX_SIZE_BYTES / 1024 / 1024).toFixed(0) }}MB
        </p>
        <p v-if="meta" class="meta mono">{{ meta.name }}<template v-if="meta.size"> · {{ (meta.size / 1024).toFixed(0) }}KB</template><template v-else> · 기본 제공 예시</template></p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </div>

    <p class="privacy mono">등록한 이미지는 브라우저 안에만 저장되며 외부로 전송되지 않습니다.</p>
  </div>
</template>

<style scoped>
.guide {
  margin: 0 0 20px;
  padding: 13px 15px;
  border: 1px solid var(--line-faint);
  border-left: 1px solid var(--accent-soft);
  font-size: 0.93rem;
  color: var(--text-muted);
  line-height: 1.75;
}

.preview-row {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.preview {
  width: 200px;
  height: 200px;
  border: 1px solid var(--line-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  overflow: hidden;
  flex-shrink: 0;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.placeholder {
  font-size: 0.87rem;
  color: var(--text-dim);
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.constraints,
.meta {
  color: var(--text-dim);
  font-size: 0.78rem;
  margin: 0;
}

.error {
  margin: 0;
  color: var(--tone-danger);
  font-size: 0.87rem;
}

.privacy {
  margin: 18px 0 0;
  color: var(--text-dim);
  font-size: 0.78rem;
}
</style>
