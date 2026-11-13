import { TSolveRecord, Theme } from '../types';
import { escapeXml, themes } from './svg';
import { truncateToWidth } from './text';
import { challengeTier, tierColor } from './tiers';
import { jetBrainsMonoFontFace } from './fonts/jetbrainsMono';

export type TSolvesCard = 'recent' | 'hardest';

export const SOLVES_CARD_TITLES: Record<TSolvesCard, string> = {
  recent: 'Recent Solves',
  hardest: 'Hardest Solves',
};

export const SOLVES_CARD_ROWS = 5;

// 열 폭 (영문 한 칸 기준): 문제 이름 236px 앞까지, 분야 310px 앞까지
const TITLE_MAX_WIDTH = 22;
const TAG_MAX_WIDTH = 9;
const NICKNAME_MAX_WIDTH = 24;

const TAG_SHORT: Record<string, string> = {
  reversing: 'rev',
  pwnable: 'pwn',
  forensics: 'forensic',
};

function formatTags(tags: string[]): string {
  const text = tags.slice(0, 2).map((tag) => TAG_SHORT[tag] || tag).join('/');
  return truncateToWidth(text, TAG_MAX_WIDTH);
}

// 최근 풀이 / 가장 어려운 풀이 카드: 문제 5개를 난이도·이름·분야와 함께 (오른쪽 열은 푼 날짜 또는 푼 사람 수)
export function generateSolvesSvg(
  card: TSolvesCard,
  nickname: string,
  solves: TSolveRecord[],
  theme: Theme = 'light'
): string {
  const colors = themes[theme];

  const rows = solves.slice(0, SOLVES_CARD_ROWS).map((solve, index) => {
    const y = 46 + index * 27;
    const tier = challengeTier(solve.tier);
    const right = card === 'hardest' ? `${solve.solvers} solvers` : solve.solvedAt.slice(0, 10);
    return `
  <g transform="translate(0, ${y})">
    <rect x="20" y="0" width="30" height="18" rx="4" fill="${tierColor(theme, tier.tierClass)}"/>
    <text x="35" y="12.5" class="pill" text-anchor="middle">${escapeXml(tier.short)}</text>
    <text x="60" y="13" class="challenge">${escapeXml(truncateToWidth(solve.title, TITLE_MAX_WIDTH))}</text>
    <text x="236" y="13" class="tag">${escapeXml(formatTags(solve.tags))}</text>
    <text x="370" y="13" class="right" text-anchor="end">${escapeXml(right)}</text>
  </g>`;
  });

  const body = rows.length
    ? rows.join('')
    : `<text x="195" y="112" class="empty" text-anchor="middle">No solved challenges yet</text>`;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="390" height="190" viewBox="0 0 390 190" fill="none">
  <style>
    ${jetBrainsMonoFontFace}
    .title { font: 500 13px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .nickname { font: 500 11px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .pill { font: 700 10px 'JetBrains Mono', monospace; fill: #ffffff; }
    .challenge { font: 500 12px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .tag { font: 400 10px 'JetBrains Mono', monospace; fill: ${colors.subText}; }
    .right { font: 400 10px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .empty { font: 500 13px 'JetBrains Mono', monospace; fill: ${colors.subText}; }
  </style>

  <!-- 배경 -->
  <rect width="390" height="190" fill="${colors.background}" rx="12" ry="12"/>

  <!-- 타이틀과 닉네임 -->
  <text x="20" y="30" class="title">${SOLVES_CARD_TITLES[card]}</text>
  <text x="370" y="30" class="nickname" text-anchor="end">${escapeXml(truncateToWidth(nickname, NICKNAME_MAX_WIDTH))}</text>

  <!-- 문제 목록 -->
  ${body}

  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="389" height="189" fill="none" stroke="${colors.border}" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
}
