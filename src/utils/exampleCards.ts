import { TCategoryStats, TCtfSeasonResult, TCtfSeasonSummary, TSolveRecord, Theme, Tstats } from '../types';
import { CardType } from './cardCode';
import { generateStatsSvg } from './generateStatsSvg';
import { generateCategorySvg } from './generateCategorySvg';
import { generateCategoryBarsSvg } from './generateCategoryBarsSvg';
import { generateCtfGraphSvg, generateCtfHistorySvg, generateCtfSeasonSvg } from './generateCtfSvg';
import { generateSolvesSvg } from './generateSolvesSvg';
import { generateLevelSvg } from './generateLevelSvg';

// README·메인 페이지 예시 카드용 목업 데이터 (실제 Dreamhack 조회 없이 항상 같은 카드)
// 실제 Dreamhack 사용자와 겹치지 않는 예시 닉네임
export const EXAMPLE_NICKNAME = 'example_user';

const stats: Tstats = {
  nickname: EXAMPLE_NICKNAME,
  wargame_solved: 512,
  wargame_rank: '128/33400',
  wargameRankPercentage: '0.38',
  wargame_score: 15230,
};

// 분야 색은 /api/most-solved와 같게 (원형 차트의 Others는 기본 팔레트 색, 막대형은 보라색)
const categories = [
  { name: 'web', score: 5200, rank: 142, solved_cnt: 160, color: '#ff6b6b' },
  { name: 'pwnable', score: 4100, rank: 260, solved_cnt: 120, color: '#339af0' },
  { name: 'reversing', score: 3200, rank: 310, solved_cnt: 95, color: '#51cf66' },
  { name: 'crypto', score: 1900, rank: 455, solved_cnt: 70, color: '#fcc419' },
  { name: 'others', score: 830, rank: 390, solved_cnt: 67, color: '#63e6be' },
];
const categoryStats: TCategoryStats = { nickname: EXAMPLE_NICKNAME, total_score: 15230, categories };
const categoryBarsStats: TCategoryStats = {
  ...categoryStats,
  categories: categories.map((c) => (c.name === 'others' ? { ...c, color: '#a78bfa' } : c)),
};

// 진행 중인 시즌 8: 대회 7번, 3등 이내 두 번
const ctfSeason: TCtfSeasonResult = {
  season: 8,
  tier: 'Platinum I',
  tierClass: 'platinum',
  rating: 2034,
  rank: 37,
  participants: 1231,
  contests: 7,
  rounds: [
    { round: 1, rating: 1540, rank: 40 },
    { round: 2, rating: 1688, rank: 12 },
    { round: 3, rating: 1655, rank: 55 },
    { round: 4, rating: 1802, rank: 9 },
    { round: 5, rating: 1890, rank: 3 },
    { round: 6, rating: 1968, rank: 6 },
    { round: 7, rating: 2034, rank: 2 },
  ],
};

const ctfHistory: (TCtfSeasonSummary & { live?: boolean })[] = [
  { season: 4, tier: 'Silver II', tierClass: 'silver', rating: 1340 },
  { season: 5, tier: 'Gold III', tierClass: 'gold', rating: 1560 },
  { season: 6, tier: 'Gold I', tierClass: 'gold', rating: 1730 },
  { season: 7, tier: 'Platinum III', tierClass: 'platinum', rating: 1850 },
  { season: 8, tier: 'Platinum I', tierClass: 'platinum', rating: 2034, live: true },
];

// tier: 7 S3, 9 S1, 13 G1, 16 P2, 17 P1, 18 D4, 20 D2, 23 M3
const recentSolves: TSolveRecord[] = [
  { title: 'heap-feng-shui', tier: 16, tags: ['pwnable'], solvedAt: '2026-11-12T21:14:00+09:00', solvers: 87 },
  { title: 'JWT Confusion', tier: 13, tags: ['web'], solvedAt: '2026-11-10T13:02:00+09:00', solvers: 312 },
  { title: 'Lattice Lullaby', tier: 18, tags: ['crypto'], solvedAt: '2026-11-07T23:41:00+09:00', solvers: 41 },
  { title: 'packed-rev', tier: 9, tags: ['reversing'], solvedAt: '2026-11-05T19:30:00+09:00', solvers: 640 },
  { title: 'cookie-jar', tier: 7, tags: ['web'], solvedAt: '2026-11-02T10:08:00+09:00', solvers: 1290 },
];

const hardestSolves: TSolveRecord[] = [
  { title: 'Kernel Sandbox Escape', tier: 23, tags: ['pwnable'], solvedAt: '2026-09-21T02:10:00+09:00', solvers: 9 },
  { title: 'VM Obfuscator', tier: 20, tags: ['reversing'], solvedAt: '2026-08-14T22:45:00+09:00', solvers: 23 },
  { title: 'Lattice Lullaby', tier: 18, tags: ['crypto'], solvedAt: '2026-11-07T23:41:00+09:00', solvers: 41 },
  { title: 'SSRF to RCE', tier: 17, tags: ['web'], solvedAt: '2026-10-03T17:20:00+09:00', solvers: 66 },
  { title: 'heap-feng-shui', tier: 16, tags: ['pwnable'], solvedAt: '2026-11-12T21:14:00+09:00', solvers: 87 },
];

// 카드 종류·테마별 예시 카드 SVG
export function renderExampleCard(card: CardType, theme: Theme = 'light'): string {
  switch (card) {
    case 'stats':
      return generateStatsSvg(stats, theme);
    case 'most-solved':
      return generateCategorySvg(categoryStats, theme);
    case 'most-solved-bars':
      return generateCategoryBarsSvg(categoryBarsStats, theme);
    case 'ctf':
      return generateCtfSeasonSvg(EXAMPLE_NICKNAME, ctfSeason, true, theme);
    case 'ctf-graph':
      return generateCtfGraphSvg(EXAMPLE_NICKNAME, ctfSeason, true, theme);
    case 'ctf-seasons':
      return generateCtfHistorySvg(EXAMPLE_NICKNAME, ctfHistory, theme);
    case 'solves':
      return generateSolvesSvg('recent', EXAMPLE_NICKNAME, recentSolves, theme);
    case 'solves-hardest':
      return generateSolvesSvg('hardest', EXAMPLE_NICKNAME, hardestSolves, theme);
    case 'level':
      return generateLevelSvg(
        {
          nickname: EXAMPLE_NICKNAME,
          level: 23,
          exp: 1320,
          expNeeded: 1890,
          contributionRank: 214,
          wargameTopPercentage: '0.38',
          achievement: 'Night Owl',
        },
        theme
      );
  }
}
