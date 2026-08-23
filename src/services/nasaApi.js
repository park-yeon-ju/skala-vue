/**
 * nasaApi.js — NASA Image and Video Library
 *
 * https://images-api.nasa.gov 는 별도 키 없이 열려 있고 CORS도 허용된다.
 * 별자리 이름만으로 검색하면 로켓 발사 사진 같은 엉뚱한 결과가 섞이므로,
 * 각 별자리 방향에 실제로 있는 대표 천체를 질의어로 쓰고 결과가 없을 때만 넓혀 잡는다.
 */
import axios from 'axios'
import { dedupe } from './axiosClient'

const client = axios.create({
  baseURL: 'https://images-api.nasa.gov',
  timeout: 12000,
})

/**
 * 별자리별 검색 전략.
 *  - object : 그 별자리 방향에 있는 대표 천체 (화면에 함께 표기해 오해를 막는다)
 *  - queries: 앞에서부터 시도하고 결과가 없으면 다음으로 넘어간다
 */
export const CONSTELLATION_TARGETS = {
  양자리: { object: '양자리 방향의 별들', queries: ['Aries', 'spiral galaxy'] },
  황소자리: { object: '게성운 (M1)', queries: ['Crab Nebula', 'Taurus nebula'] },
  쌍둥이자리: { object: '해파리성운 (IC 443)', queries: ['Jellyfish Nebula', 'Gemini stars'] },
  게자리: { object: '프레세페 성단 (M44)', queries: ['Beehive Cluster', 'star cluster'] },
  사자자리: { object: '사자자리 은하군', queries: ['Leo galaxy', 'spiral galaxy'] },
  처녀자리: { object: '솜브레로 은하 (M104)', queries: ['Sombrero Galaxy', 'Virgo cluster'] },
  천칭자리: { object: '천칭자리 방향의 은하', queries: ['Libra', 'spiral galaxy'] },
  전갈자리: { object: '전갈자리의 성운', queries: ['Scorpius', 'Antares nebula'] },
  사수자리: { object: '석호성운 (M8)', queries: ['Lagoon Nebula', 'Trifid Nebula'] },
  염소자리: { object: '염소자리 방향의 구상성단', queries: ['Messier 30', 'globular cluster'] },
  물병자리: { object: '나선성운 (NGC 7293)', queries: ['Helix Nebula', 'planetary nebula'] },
  물고기자리: { object: '물고기자리 방향의 은하', queries: ['Pisces', 'spiral galaxy'] },
  오리온자리: { object: '오리온 대성운 (M42)', queries: ['Orion Nebula', 'Orion'] },
  큰곰자리: { object: '바람개비 은하 (M101)', queries: ['Pinwheel Galaxy', 'Ursa Major'] },
  카시오페이아자리: { object: '카시오페이아 A 초신성 잔해', queries: ['Cassiopeia A', 'Cassiopeia'] },
  백조자리: { object: '베일성운 (NGC 6960)', queries: ['Veil Nebula', 'Cygnus nebula'] },
  거문고자리: { object: '고리성운 (M57)', queries: ['Ring Nebula', 'planetary nebula'] },
  독수리자리: { object: '독수리자리의 별 형성 구름', queries: ['Aquila', 'Eagle Nebula'] },
}

/** 응답 항목 하나를 화면에서 쓰기 좋은 형태로 정리 */
function normalize(item) {
  const data = item.data?.[0]
  if (!data) return null
  const thumb = item.links?.find((l) => l.render === 'image')?.href ?? item.links?.[0]?.href
  if (!thumb) return null

  return {
    id: data.nasa_id,
    title: data.title ?? '제목 없음',
    description: data.description ?? data.description_508 ?? '',
    center: data.center ?? null,
    dateCreated: data.date_created ?? null,
    photographer: data.photographer ?? data.secondary_creator ?? null,
    thumb,
    // 원본 크기 이미지는 ~thumb 를 ~orig 로 바꾸면 얻을 수 있다.
    full: thumb.replace(/~(thumb|small|medium)\./, '~large.'),
    pageUrl: `https://images.nasa.gov/details/${encodeURIComponent(data.nasa_id)}`,
  }
}

/**
 * 별자리 이름으로 NASA 이미지를 찾는다.
 * @returns {{ query:string, object:string, items:Array }}
 */
export async function fetchConstellationImages(constellationName, limit = 8) {
  const target = CONSTELLATION_TARGETS[constellationName] ?? {
    object: constellationName,
    queries: [constellationName],
  }

  return dedupe(`nasa:${constellationName}`, async () => {
    for (const query of target.queries) {
      const { data } = await client.get('/search', {
        params: { q: query, media_type: 'image', page_size: 24 },
      })
      const items = (data?.collection?.items ?? []).map(normalize).filter(Boolean).slice(0, limit)
      if (items.length) {
        return { query, object: target.object, items, totalHits: data.collection.metadata?.total_hits ?? items.length }
      }
    }
    return { query: target.queries[0], object: target.object, items: [], totalHits: 0 }
  })
}
