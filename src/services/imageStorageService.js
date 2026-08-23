/**
 * imageStorageService.js — 출생 차트 이미지 저장소 (IndexedDB)
 *
 * 이미지는 외부로 전송하지 않고 브라우저 안에만 둔다.
 * 사용자 설정 메타데이터는 localStorage(profileStore), 이미지 Blob은 여기에 저장한다.
 */
const DB_NAME = 'the-aura'
const DB_VERSION = 1
const STORE = 'chartImages'

export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
export const MAX_SIZE_BYTES = 5 * 1024 * 1024

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('이 브라우저에서는 이미지 저장을 지원하지 않습니다.'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('저장소를 열지 못했습니다.'))
  })
}

function runTransaction(mode, work) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode)
        const store = tx.objectStore(STORE)
        const request = work(store)
        tx.oncomplete = () => {
          db.close()
          resolve(request?.result ?? null)
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error ?? new Error('저장소 작업에 실패했습니다.'))
        }
      }),
  )
}

/** 업로드 파일 검증 — 형식과 크기 */
export function validateChartFile(file) {
  if (!file) return '파일을 선택해 주세요.'
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'PNG, JPG, JPEG, WebP 형식의 이미지만 등록할 수 있습니다.'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `파일이 너무 큽니다. 5MB 이하로 올려 주세요. (현재 ${(file.size / 1024 / 1024).toFixed(1)}MB)`
  }
  return null
}

/** 이미지 저장 — 저장에 성공하면 id를 돌려준다. */
export async function saveChartImage(file) {
  const error = validateChartFile(file)
  if (error) throw new Error(error)

  const id = `chart-${Date.now()}`
  const record = {
    id,
    blob: file,
    name: file.name,
    type: file.type,
    size: file.size,
    savedAt: new Date().toISOString(),
  }
  await runTransaction('readwrite', (store) => store.put(record))
  return id
}

/** 저장된 이미지 조회 */
export async function loadChartImage(id) {
  if (!id) return null
  try {
    return await runTransaction('readonly', (store) => store.get(id))
  } catch {
    return null
  }
}

/** 이미지 삭제 */
export async function deleteChartImage(id) {
  if (!id) return
  try {
    await runTransaction('readwrite', (store) => store.delete(id))
  } catch {
    // 이미 지워졌거나 저장소를 못 여는 경우 — 화면 상태만 정리하면 된다.
  }
}
