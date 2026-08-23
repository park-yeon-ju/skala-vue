import { ref, onUnmounted } from 'vue'
import { loadChartImage } from '@/services/imageStorageService'
import { isSampleChart, SAMPLE_CHART_URL, SAMPLE_CHART_NAME } from '@/constants/defaultProfile'

/**
 * IndexedDB에 저장된 차트 이미지를 미리보기 URL로 만든다.
 * Object URL은 컴포넌트가 사라질 때 반드시 해제해 메모리 누수를 막는다.
 */
export function useChartImage() {
  const objectUrl = ref(null)
  const meta = ref(null)
  const loading = ref(false)

  /** 번들 자산 URL은 해제 대상이 아니므로 blob: 인 경우에만 revoke 한다. */
  function release() {
    if (objectUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(objectUrl.value)
    }
    objectUrl.value = null
    meta.value = null
  }

  async function load(id) {
    release()
    if (!id) return

    // 시연용 예시 차트는 IndexedDB가 아니라 번들에 들어 있다.
    if (isSampleChart(id)) {
      objectUrl.value = SAMPLE_CHART_URL
      meta.value = { name: SAMPLE_CHART_NAME, size: null, savedAt: null, isSample: true }
      return
    }

    loading.value = true
    try {
      const record = await loadChartImage(id)
      if (record?.blob) {
        objectUrl.value = URL.createObjectURL(record.blob)
        meta.value = { name: record.name, size: record.size, savedAt: record.savedAt }
      }
    } finally {
      loading.value = false
    }
  }

  /** 아직 저장하지 않은 파일을 곧바로 미리보기 */
  function previewFile(file) {
    release()
    objectUrl.value = URL.createObjectURL(file)
    meta.value = { name: file.name, size: file.size, savedAt: null }
  }

  onUnmounted(release)

  return { objectUrl, meta, loading, load, previewFile, release }
}
