<script setup>
import { ref, watch, computed } from 'vue'
import { fetchConstellationImages } from '@/services/nasaApi'
import { getConstellationShape } from '@/constants/constellationShapes'
import ZodiacConstellation from '@/components/astrology/ZodiacConstellation.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** 클릭한 별자리 항목 { constellation, star, direction, altitude } */
  target: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

/** NASA 사진은 한눈에 알아보기 어려워, 별자리 모양 그림을 먼저 보여 준다. */
const shape = computed(() =>
  props.target ? getConstellationShape(props.target.constellation) : null,
)

const loading = ref(false)
const error = ref(null)
const result = ref(null)
const selected = ref(null)

async function load(name) {
  loading.value = true
  error.value = null
  result.value = null
  selected.value = null
  try {
    result.value = await fetchConstellationImages(name)
  } catch {
    error.value = 'NASA 이미지 라이브러리에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    loading.value = false
  }
}

// 다이얼로그가 열릴 때만 불러온다.
watch(
  () => [props.modelValue, props.target?.constellation],
  ([open, name]) => {
    if (open && name) load(name)
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="target ? `${target.constellation} · 실제 관측 사진` : '관측 사진'"
    width="min(94vw, 900px)"
    append-to-body
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- 별자리 모양부터 보여 주고, 그 아래에 실제 관측 사진을 붙인다 -->
    <div v-if="shape" class="shape-wrap">
      <ZodiacConstellation :sign="shape" centered />
    </div>

    <div v-if="target" class="meta-row">
      <span class="chip">{{ target.direction }}</span>
      <span class="chip">고도 {{ target.altitude }}°</span>
      <span class="chip">대표 별 {{ target.star }}</span>
    </div>

    <p v-if="result" class="object-line">
      아래 사진은 <strong>{{ result.object }}</strong> 를 담은 NASA 공개 이미지입니다.
      별자리 전체가 아니라 그 방향에 있는 대표 천체를 보여 줍니다.
    </p>

    <div v-if="loading" class="state">NASA 이미지 라이브러리에서 찾는 중입니다…</div>
    <div v-else-if="error" class="state state--error">{{ error }}</div>
    <div v-else-if="result && !result.items.length" class="state">
      이 별자리에 해당하는 공개 이미지를 찾지 못했습니다.
    </div>

    <!-- 큰 이미지 -->
    <figure v-if="selected" class="viewer">
      <img :src="selected.full" :alt="selected.title" loading="lazy" @error="selected.full = selected.thumb" />
      <figcaption>
        <p class="v-title">{{ selected.title }}</p>
        <p v-if="selected.description" class="v-desc">{{ selected.description.slice(0, 320) }}</p>
        <p class="v-meta">
          <span v-if="selected.center">{{ selected.center }}</span>
          <span v-if="selected.dateCreated">{{ selected.dateCreated.slice(0, 10) }}</span>
          <a :href="selected.pageUrl" target="_blank" rel="noopener noreferrer">NASA에서 원본 보기 ↗</a>
        </p>
      </figcaption>
    </figure>

    <!-- 썸네일 목록 -->
    <ul v-if="result && result.items.length" class="thumbs">
      <li v-for="item in result.items" :key="item.id">
        <button
          type="button"
          class="thumb"
          :class="{ 'is-active': selected?.id === item.id }"
          @click="selected = { ...item }"
        >
          <img :src="item.thumb" :alt="item.title" loading="lazy" />
          <span class="thumb-title">{{ item.title }}</span>
        </button>
      </li>
    </ul>

    <!-- 닫기는 다이얼로그 우측 상단의 기본 버튼을 쓴다 -->
    <template #footer>
      <span class="source">출처 · NASA Image and Video Library</span>
    </template>
  </el-dialog>
</template>

<style scoped>
.shape-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line-faint);
}

.meta-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.chip {
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(169, 155, 255, 0.14);
  color: var(--accent-strong);
  font-size: 0.82rem;
}

.object-line {
  margin: 0 0 18px;
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.object-line strong {
  color: var(--text-bright);
  font-weight: 500;
}

.state {
  padding: 30px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.93rem;
}

.state--error {
  color: var(--tone-danger);
}

.viewer {
  margin: 0 0 20px;
  border-radius: var(--radius-card);
  overflow: hidden;
  border: 1px solid var(--line-faint);
  background: rgba(0, 0, 0, 0.35);
}

.viewer img {
  display: block;
  width: 100%;
  max-height: 46vh;
  object-fit: contain;
  background: #05050b;
}

figcaption {
  padding: 16px 18px;
}

.v-title {
  margin: 0 0 8px;
  color: var(--text-bright);
  font-size: 1.02rem;
  font-weight: 500;
}

.v-desc {
  margin: 0 0 10px;
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.7;
}

.v-meta {
  margin: 0;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 0.82rem;
  color: var(--text-dim);
}

.v-meta a {
  color: var(--accent);
  text-decoration: none;
}

.v-meta a:hover {
  text-decoration: underline;
}

.thumbs {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
}

.thumb {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 0 0 10px;
  border: 1px solid var(--line-faint);
  border-radius: var(--radius-inner);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.25s ease,
    transform 0.25s ease;
}

.thumb:hover {
  border-color: var(--accent-soft);
  transform: translateY(-2px);
}

.thumb.is-active {
  border-color: var(--accent);
  background: rgba(169, 155, 255, 0.12);
}

.thumb img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  background: #05050b;
}

.thumb-title {
  padding: 0 10px;
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.source {
  margin-right: auto;
  font-size: 0.82rem;
  color: var(--text-dim);
}

:deep(.el-dialog__footer) {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
