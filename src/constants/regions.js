// 지역 목록 — 광역 지역은 대표 위치의 좌표를 사용한다.
export const REGIONS = [
  { code: 'seoul', label: '서울', representative: '서울', lat: 37.5665, lon: 126.978 },
  { code: 'gyeonggi', label: '경기', representative: '수원', lat: 37.2636, lon: 127.0286 },
  { code: 'pangyo', label: '판교', representative: '성남시 판교', lat: 37.3947, lon: 127.1112 },
  { code: 'gangwon', label: '강원', representative: '춘천', lat: 37.8813, lon: 127.7298 },
  { code: 'chungnam', label: '충남', representative: '천안', lat: 36.8151, lon: 127.1139 },
  { code: 'chungbuk', label: '충북', representative: '청주', lat: 36.6424, lon: 127.489 },
  { code: 'gwangju', label: '광주', representative: '광주광역시', lat: 35.1595, lon: 126.8526 },
  { code: 'jeonnam', label: '전남', representative: '목포', lat: 34.8118, lon: 126.3922 },
  { code: 'jeonbuk', label: '전북', representative: '전주', lat: 35.8242, lon: 127.148 },
  { code: 'gyeongnam', label: '경남', representative: '창원', lat: 35.2279, lon: 128.6811 },
  { code: 'gyeongbuk', label: '경북', representative: '안동', lat: 36.5684, lon: 128.7294 },
  { code: 'jeju', label: '제주', representative: '제주시', lat: 33.4996, lon: 126.5312 },
]

export const DEFAULT_REGION_CODE = 'seoul'

export function findRegion(code) {
  return REGIONS.find((r) => r.code === code) ?? null
}

/** 광역 지역인지 — 대표 위치 안내 문구를 띄울지 판단한다. */
export function isWideRegion(region) {
  return Boolean(region) && region.label !== region.representative
}
