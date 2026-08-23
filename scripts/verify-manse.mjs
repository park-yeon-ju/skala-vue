/**
 * 만세력 검산 스크립트 — md/fortune/manse_test_cases.md 의 10개 케이스를 대조한다.
 *   node scripts/verify-manse.mjs
 */
import { calculateManse } from '../src/utils/manse_calculator.js'

const CASES = [
  { id: 'A01', y: 1999, m: 8, d: 31, h: 12, mi: 30, cal: 'solar', leap: false, gender: 'female',
    solar: '1999-08-31', pillars: '壬午/乙卯/壬申/己卯', elements: { 목: 3, 화: 1, 토: 1, 금: 1, 수: 2 },
    daeun: { age: 3, dir: '순행', first: ['癸酉', '甲戌', '乙亥', '丙子'] } },
  { id: 'A02', y: 1971, m: 9, d: 21, h: 4, mi: 0, cal: 'lunar', leap: false, gender: 'female',
    solar: '1971-11-08', pillars: '壬寅/丁酉/戊戌/辛亥', elements: { 목: 1, 화: 1, 토: 2, 금: 2, 수: 2 },
    daeun: { age: 1, dir: '순행', first: ['己亥', '庚子', '辛丑', '壬寅'] } },
  { id: 'A03', y: 1984, m: 2, d: 4, h: 0, mi: 15, cal: 'solar', leap: false, gender: 'male',
    solar: '1984-02-04', pillars: '壬子/戊辰/乙丑/癸亥', elements: { 목: 1, 화: 0, 토: 3, 금: 0, 수: 4 },
    daeun: { age: 9, dir: '역행', first: ['甲子', '癸亥', '壬戌', '辛酉'] }, boundary: true },
  { id: 'A04', y: 1984, m: 10, d: 3, h: 2, mi: 0, cal: 'lunar', leap: true, gender: 'female',
    solar: '1984-11-25', pillars: '癸丑/癸亥/乙亥/甲子', elements: { 목: 2, 화: 0, 토: 1, 금: 0, 수: 5 },
    daeun: { age: 6, dir: '역행', first: ['甲戌', '癸酉', '壬申', '辛未'] } },
  { id: 'A05', y: 1983, m: 9, d: 8, h: 14, mi: 10, cal: 'solar', leap: false, gender: 'female',
    solar: '1983-09-08', pillars: '辛未/己亥/庚申/癸亥', elements: { 목: 0, 화: 0, 토: 2, 금: 3, 수: 3 },
    daeun: { age: 1, dir: '순행', first: ['辛酉', '壬戌', '癸亥', '甲子'] }, boundary: true },
  { id: 'A06', y: 1990, m: 5, d: 15, h: 9, mi: 20, cal: 'solar', leap: false, gender: 'male',
    solar: '1990-05-15', pillars: '辛巳/庚辰/辛巳/庚午', elements: { 목: 0, 화: 3, 토: 1, 금: 4, 수: 0 },
    daeun: { age: 7, dir: '순행', first: ['壬午', '癸未', '甲申', '乙酉'] } },
  { id: 'A07', y: 1990, m: 5, d: 15, h: 9, mi: 20, cal: 'solar', leap: false, gender: 'female',
    solar: '1990-05-15', pillars: '辛巳/庚辰/辛巳/庚午', elements: { 목: 0, 화: 3, 토: 1, 금: 4, 수: 0 },
    daeun: { age: 3, dir: '역행', first: ['庚辰', '己卯', '戊寅', '丁丑'] } },
  { id: 'A08', y: 2000, m: 1, d: 1, h: 23, mi: 40, cal: 'solar', leap: false, gender: 'male',
    solar: '2000-01-01', pillars: '壬子/戊午/丙子/己卯', elements: { 목: 1, 화: 2, 토: 2, 금: 0, 수: 3 },
    daeun: { age: 8, dir: '역행', first: ['乙亥', '甲戌', '癸酉', '壬申'] }, boundary: true },
  { id: 'A09', y: 1995, m: 6, d: 15, h: 18, mi: 45, cal: 'lunar', leap: false, gender: 'male',
    solar: '1995-07-12', pillars: '癸酉/甲辰/癸未/乙亥', elements: { 목: 2, 화: 0, 토: 2, 금: 1, 수: 3 },
    daeun: { age: 2, dir: '역행', first: ['壬午', '辛巳', '庚辰', '己卯'] } },
  { id: 'A10', y: 2026, m: 8, d: 21, h: 10, mi: 41, cal: 'solar', leap: false, gender: 'female',
    solar: '2026-08-21', pillars: '乙巳/丁卯/丙申/丙午', elements: { 목: 2, 화: 5, 토: 0, 금: 1, 수: 0 },
    daeun: { age: 5, dir: '역행', first: ['乙未', '甲午', '癸巳', '壬辰'] } },
]

const pad = (n) => String(n).padStart(2, '0')
let pass = 0
let fail = 0
const failures = []

for (const c of CASES) {
  const r = calculateManse({
    year: c.y, month: c.m, day: c.d, hour: c.h, minute: c.mi,
    gender: c.gender, calendar: c.cal, leapMonth: c.leap,
  })

  if (r.error) {
    fail += 1
    failures.push(`${c.id} 계산 실패: ${r.error}`)
    continue
  }

  const problems = []

  const gotSolar = `${r.solarDate.year}-${pad(r.solarDate.month)}-${pad(r.solarDate.day)}`
  if (gotSolar !== c.solar) problems.push(`양력 ${gotSolar} ≠ ${c.solar}`)

  const gotPillars = [r.pillars.hour?.han ?? '미상', r.pillars.day.han, r.pillars.month.han, r.pillars.year.han].join('/')
  if (gotPillars !== c.pillars) problems.push(`원국 ${gotPillars} ≠ ${c.pillars}`)

  const gotElements = ['목', '화', '토', '금', '수'].map((e) => `${e}${r.elementCount[e]}`).join(' ')
  const wantElements = ['목', '화', '토', '금', '수'].map((e) => `${e}${c.elements[e]}`).join(' ')
  if (gotElements !== wantElements) problems.push(`오행 ${gotElements} ≠ ${wantElements}`)

  if (r.daeun.direction !== c.daeun.dir) problems.push(`대운방향 ${r.daeun.direction} ≠ ${c.daeun.dir}`)
  if (r.daeun.startAge !== c.daeun.age) {
    problems.push(`대운수 ${r.daeun.startAge} ≠ ${c.daeun.age} (절입까지 ${r.daeun.daysToTerm}일)`)
  }
  const gotSeq = r.daeun.list.slice(0, 4).map((x) => x.pillar.han).join(' → ')
  const wantSeq = c.daeun.first.join(' → ')
  if (gotSeq !== wantSeq) problems.push(`대운배열 ${gotSeq} ≠ ${wantSeq}`)

  if (problems.length === 0) {
    pass += 1
    console.log(`✅ ${c.id}${c.boundary ? ' (경계값)' : ''}`)
  } else {
    fail += 1
    console.log(`❌ ${c.id}${c.boundary ? ' (경계값)' : ''}`)
    problems.forEach((p) => console.log(`     ${p}`))
    failures.push(`${c.id}: ${problems.join(' | ')}`)
  }
}

console.log(`\n통과 ${pass} / 실패 ${fail} (총 ${CASES.length})`)
if (fail > 0) process.exitCode = 1
