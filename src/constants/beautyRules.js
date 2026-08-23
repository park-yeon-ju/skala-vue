/**
 * 날씨 조건별 팁 규칙표.
 *
 * 두 갈래로 나눈다.
 *  - beauty : 메이크업·스킨케어
 *  - outfit : 신발·우산·자외선 차단 등 외출 준비
 * 각 갈래에서 조건에 맞는 항목만 우선순위 순으로 최대 4개까지 보여준다.
 */
export const BEAUTY_RULES = [
  // ---------------------------------------------------------- 메이크업·스킨케어
  {
    key: 'dry',
    group: 'beauty',
    priority: 2,
    label: '건조',
    tip: '보습크림과 립밤을 챙기세요.',
    detail: '습도가 40% 아래면 각질과 잔주름이 도드라집니다. 수분 대신 유분으로 막을 만들어 주는 편이 오래 갑니다.',
    match: ({ humidity }) => typeof humidity === 'number' && humidity < 40,
  },
  {
    key: 'humid',
    group: 'beauty',
    priority: 2,
    label: '다습',
    tip: '가벼운 제형과 파우더로 마무리하세요.',
    detail: '습도가 70%를 넘으면 베이스가 밀립니다. 얇게 여러 번 올리고 파우더로 눌러 주세요.',
    match: ({ humidity }) => typeof humidity === 'number' && humidity >= 70,
  },
  {
    key: 'waterproof',
    group: 'beauty',
    priority: 1,
    label: '강수',
    tip: '워터프루프 메이크업을 권합니다.',
    detail: '비가 오거나 강수 확률이 높은 날은 아이라인과 마스카라부터 번집니다.',
    match: ({ precipitating, maxPop }) => precipitating || (typeof maxPop === 'number' && maxPop >= 60),
  },
  {
    key: 'hot',
    group: 'beauty',
    priority: 1,
    label: '고온',
    tip: '피지 조절과 가벼운 베이스가 필요합니다.',
    detail: '기온이 28℃를 넘으면 유분이 빠르게 올라옵니다. 두껍게 올리기보다 자주 눌러 주세요.',
    match: ({ temp }) => typeof temp === 'number' && temp >= 28,
  },
  {
    key: 'cold',
    group: 'beauty',
    priority: 1,
    label: '저온',
    tip: '보습막을 유지하고 각질 제거는 미루세요.',
    detail: '기온이 5℃ 이하면 피부 장벽이 약해집니다. 자극적인 각질 제거는 며칠 뒤로 미루는 편이 낫습니다.',
    match: ({ temp }) => typeof temp === 'number' && temp <= 5,
  },
  {
    key: 'dust',
    group: 'beauty',
    priority: 0,
    label: '미세먼지',
    tip: '외출 후 꼼꼼한 세안이 필요합니다.',
    detail: '미세먼지가 나쁨 이상이면 모공에 남은 입자가 트러블로 이어집니다. 이중 세안으로 정리하세요.',
    match: ({ dustLevel }) => typeof dustLevel === 'number' && dustLevel >= 3,
  },
  {
    key: 'hairFix',
    group: 'beauty',
    priority: 3,
    label: '바람',
    tip: '헤어와 립은 가볍게 고정하세요.',
    detail: '바람이 8m/s를 넘으면 머리가 흐트러지고 립이 들러붙습니다. 스프레이는 가볍게, 립은 매트 제형이 낫습니다.',
    match: ({ windSpeed }) => typeof windSpeed === 'number' && windSpeed >= 8,
  },

  // ------------------------------------------------------------------ 외출 준비
  // 신발 — 시간당 강수량 기준으로 단계를 나눈다.
  {
    key: 'shoesLight',
    group: 'outfit',
    priority: 0,
    label: '약한 비',
    tip: '우산이면 충분합니다. 장화까지는 필요 없어요.',
    detail: '시간당 1mm 미만이면 노면이 살짝 젖는 정도입니다. 평소 신발에 방수 스프레이만 뿌려도 됩니다.',
    match: ({ rainAmount }) => typeof rainAmount === 'number' && rainAmount > 0 && rainAmount < 1,
  },
  {
    key: 'shoesMedium',
    group: 'outfit',
    priority: 0,
    label: '보통 비',
    tip: '장시간 외출이면 장화나 방수 신발을 권합니다.',
    detail: '시간당 1~3mm면 걷는 동안 신발 앞코가 젖습니다. 오래 밖에 있을 예정이면 장화가 편합니다.',
    match: ({ rainAmount }) => typeof rainAmount === 'number' && rainAmount >= 1 && rainAmount < 3,
  },
  {
    key: 'shoesStrong',
    group: 'outfit',
    priority: 0,
    label: '강한 비',
    tip: '장화 착용을 권합니다.',
    detail: '시간당 3~10mm면 물웅덩이가 생깁니다. 굽이 있는 신발보다 방수 장화가 안전합니다.',
    match: ({ rainAmount }) => typeof rainAmount === 'number' && rainAmount >= 3 && rainAmount < 10,
  },
  {
    key: 'shoesHeavy',
    group: 'outfit',
    priority: 0,
    label: '매우 강한 비',
    tip: '장화를 적극 권합니다. 여벌 양말도 챙기세요.',
    detail: '시간당 10~20mm는 우산만으로 하의가 젖습니다. 발이 젖으면 하루 종일 불편합니다.',
    match: ({ rainAmount }) => typeof rainAmount === 'number' && rainAmount >= 10 && rainAmount < 20,
  },
  {
    key: 'shoesFlood',
    group: 'outfit',
    priority: 0,
    label: '집중호우',
    tip: '외출을 최소화하고 침수 구간을 피하세요.',
    detail: '시간당 20mm 이상은 배수가 따라가지 못합니다. 지하 통로와 저지대는 피하는 편이 안전합니다.',
    match: ({ rainAmount }) => typeof rainAmount === 'number' && rainAmount >= 20,
  },
  {
    key: 'umbrella',
    group: 'outfit',
    priority: 1,
    label: '강수 예보',
    tip: '지금은 안 와도 우산을 챙기세요.',
    detail: '오늘 중 강수 확률이 높은 구간이 있습니다. 나갈 때 하늘이 맑아도 우산을 두고 나오지 마세요.',
    match: ({ precipitating, maxPop }) =>
      !precipitating && typeof maxPop === 'number' && maxPop >= 40,
  },

  // 자외선 — 태양 고도와 구름량으로 추정한 지수 기준
  {
    key: 'uvLow',
    group: 'outfit',
    priority: 2,
    label: '자외선 낮음',
    tip: '자외선 부담은 적은 시간대입니다.',
    detail: '자외선 지수 2 이하입니다. 평소 스킨케어만으로 충분합니다.',
    match: ({ uvIndex }) => typeof uvIndex === 'number' && uvIndex > 0 && uvIndex <= 2,
  },
  {
    key: 'uvModerate',
    group: 'outfit',
    priority: 2,
    label: '자외선 보통',
    tip: '외출 전 선크림을 바르세요.',
    detail: '자외선 지수 3~5입니다. 한 번 바른 뒤 3시간쯤 뒤에 덧바르면 좋습니다.',
    match: ({ uvIndex }) => typeof uvIndex === 'number' && uvIndex >= 3 && uvIndex <= 5,
  },
  {
    key: 'uvHigh',
    group: 'outfit',
    priority: 2,
    label: '자외선 높음',
    tip: '선크림은 필수, 2~3시간마다 덧바르세요.',
    detail: '자외선 지수 6~7입니다. 그늘을 골라 다니는 것만으로도 노출량이 크게 줄어듭니다.',
    match: ({ uvIndex }) => typeof uvIndex === 'number' && uvIndex >= 6 && uvIndex <= 7,
  },
  {
    key: 'uvVeryHigh',
    group: 'outfit',
    priority: 2,
    label: '자외선 매우 높음',
    tip: '선크림에 더해 모자나 양산을 챙기세요.',
    detail: '자외선 지수 8~10입니다. 정오 전후 두 시간은 실외 활동을 줄이는 편이 낫습니다.',
    match: ({ uvIndex }) => typeof uvIndex === 'number' && uvIndex >= 8 && uvIndex <= 10,
  },
  {
    key: 'uvExtreme',
    group: 'outfit',
    priority: 2,
    label: '자외선 위험',
    tip: '한낮 외출을 피하고 차단을 최대로 하세요.',
    detail: '자외선 지수 11 이상입니다. 짧은 노출로도 홍반이 생길 수 있습니다.',
    match: ({ uvIndex }) => typeof uvIndex === 'number' && uvIndex >= 11,
  },
  {
    key: 'uvNight',
    group: 'outfit',
    priority: 4,
    label: '야간',
    tip: '해가 져서 자외선 걱정은 없습니다.',
    detail: '태양이 지평선 아래에 있어 자외선 지수는 0입니다.',
    match: ({ uvIndex, solarAltitude }) =>
      uvIndex === 0 && typeof solarAltitude === 'number' && solarAltitude <= 0,
  },

  // 바람 — 단계별
  {
    key: 'windMild',
    group: 'outfit',
    priority: 3,
    label: '산들바람',
    tip: '치마나 모자는 가볍게 눌러 주세요.',
    detail: '5~8m/s는 걷다 보면 옷자락이 날리는 정도입니다.',
    match: ({ windSpeed }) => typeof windSpeed === 'number' && windSpeed >= 5 && windSpeed < 8,
  },
  {
    key: 'windStrong',
    group: 'outfit',
    priority: 3,
    label: '강풍',
    tip: '우산이 뒤집힐 수 있습니다. 짧은 우산이 낫습니다.',
    detail: '8~12m/s는 장우산을 들기 어려운 바람입니다. 모자는 끈이 있는 쪽을 고르세요.',
    match: ({ windSpeed }) => typeof windSpeed === 'number' && windSpeed >= 8 && windSpeed < 12,
  },
  {
    key: 'windSevere',
    group: 'outfit',
    priority: 3,
    label: '매우 강한 바람',
    tip: '우산 대신 방수 아우터를 권합니다.',
    detail: '12m/s 이상은 우산이 거의 소용없습니다. 간판이나 낙하물도 주의하세요.',
    match: ({ windSpeed }) => typeof windSpeed === 'number' && windSpeed >= 12,
  },
]

export const MAX_TIPS_PER_GROUP = 4

export const TIP_GROUPS = [
  { key: 'beauty', label: '메이크업 · 스킨케어', icon: '✦' },
  { key: 'outfit', label: '외출 준비', icon: '☂' },
]

/**
 * 날씨·대기질 값으로 오늘의 팁을 고른다.
 * 갈래별로 조건에 맞는 항목만 남기고 우선순위 순으로 최대 4개까지 반환한다.
 */
export function selectBeautyTips(context) {
  const matched = BEAUTY_RULES.filter((rule) => {
    try {
      return rule.match(context)
    } catch {
      return false
    }
  }).sort((a, b) => a.priority - b.priority)

  return {
    beauty: matched.filter((r) => r.group === 'beauty').slice(0, MAX_TIPS_PER_GROUP),
    outfit: matched.filter((r) => r.group === 'outfit').slice(0, MAX_TIPS_PER_GROUP),
    totalMatched: matched.length,
  }
}

/**
 * 자외선 지수 추정.
 * 무료 키에서는 자외선 API를 쓸 수 없어, 태양 고도와 구름량으로 근사한다.
 * 맑은 하늘의 최대치를 태양 고도의 sin 값에 비례시키고 구름으로 감쇠시킨다.
 */
export function estimateUvIndex(solarAltitude, clouds) {
  if (typeof solarAltitude !== 'number' || solarAltitude <= 0) return 0
  const clear = 12 * Math.sin((solarAltitude * Math.PI) / 180) ** 1.35
  const cloudFactor = typeof clouds === 'number' ? 1 - 0.75 * (clouds / 100) ** 3 : 1
  return Math.max(0, Math.round(clear * cloudFactor))
}
