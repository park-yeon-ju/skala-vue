<script setup>
import { computed } from 'vue'
import { REGIONS, findRegion, isWideRegion } from '@/constants/regions'

/** 현재 선택 지역을 props로 받고 변경은 emit으로만 알린다. */
const props = defineProps({
  modelValue: { type: String, required: true },
  defaultRegion: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'reset'])

const region = computed(() => findRegion(props.modelValue))
const showsNotice = computed(() => isWideRegion(region.value))
const isOverridden = computed(() => props.defaultRegion && props.modelValue !== props.defaultRegion)
</script>

<template>
  <div class="region">
    <div class="row">
      <label class="label" for="region-select">지역 선택</label>
      <el-select
        id="region-select"
        :model-value="modelValue"
        class="select"
        placeholder="지역을 선택하세요"
        @update:model-value="(v) => emit('update:modelValue', v)"
      >
        <el-option v-for="r in REGIONS" :key="r.code" :label="r.label" :value="r.code" />
      </el-select>

      <button v-if="isOverridden" class="pill pill--ghost reset" type="button" @click="emit('reset')">
        기본 지역으로
      </button>
    </div>

    <p v-if="showsNotice" class="notice">
      광역 지역의 날씨는 대표 위치 기준입니다. 현재 <strong>{{ region.label }}</strong> 는
      <strong>{{ region.representative }}</strong> 좌표를 사용합니다.
    </p>
    <p v-if="isOverridden" class="temp-note">
      이 화면에서만 임시로 선택한 지역입니다. 설정의 기본 지역은 바뀌지 않습니다.
    </p>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.label {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.select {
  width: 180px;
}

.reset {
  padding: 7px 16px;
  font-size: 0.78rem;
}

.notice,
.temp-note {
  margin: 14px 0 0;
  font-size: 0.87rem;
  color: var(--text-muted);
  padding-left: 12px;
  border-left: 1px solid var(--line-soft);
}

.temp-note {
  border-left-color: var(--accent-soft);
  color: var(--text-dim);
}
</style>
