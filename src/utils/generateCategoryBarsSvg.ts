import { TCategoryStats, Theme } from '../types';
import { escapeXml, themes } from './svg';
import { jetBrainsMonoFontFace } from './fonts/jetbrainsMono';

const WIDTH = 390;
const HEIGHT = 190;
const MAX_ROWS = 5;
const BAR_X = 100;
const BAR_WIDTH = 140;
// 분야 이름 열(20~100px)에 들어가는 글자 수
const MAX_NAME_LENGTH = 10;

function categoryLabel(name: string): string {
  const chars = Array.from(name.charAt(0).toUpperCase() + name.slice(1));
  return chars.length > MAX_NAME_LENGTH ? `${chars.slice(0, MAX_NAME_LENGTH - 1).join('')}…` : chars.join('');
}

// 분야 카드의 막대형 레이아웃 (layout=bars): 분야별 점수 막대와 점수·푼 문제 수·분야 순위
export function generateCategoryBarsSvg(stats: TCategoryStats, theme: Theme = 'light'): string {
  const colors = themes[theme];
  const categories = stats.categories.slice(0, MAX_ROWS);
  const maxScore = Math.max(0, ...categories.map((category) => category.score));

  let rows: string;
  if (categories.length === 0) {
    rows = `<text x="20" y="100" class="no-data">No category data</text>`;
  } else {
    rows = categories
      .map((category, index) => {
        const y = 74 + index * 23;
        const solved = category.solved_cnt ?? null;
        // 한 문제도 풀지 않은 분야의 순위는 의미가 없어 표시하지 않음
        const played = category.score > 0 || (solved !== null && solved > 0);
        const barWidth = maxScore > 0 && category.score > 0 ? Math.max(4, (BAR_WIDTH * category.score) / maxScore) : 0;
        return `
  <text x="20" y="${y}" class="cat">${escapeXml(categoryLabel(category.name))}</text>
  <rect x="${BAR_X}" y="${y - 8}" width="${BAR_WIDTH}" height="8" rx="4" fill="${colors.track}"/>
  ${barWidth > 0 ? `<rect x="${BAR_X}" y="${y - 8}" width="${barWidth.toFixed(1)}" height="8" rx="4" fill="${escapeXml(category.color)}"/>` : ''}
  <text x="290" y="${y}" class="num" text-anchor="end">${escapeXml(category.score)}</text>
  <text x="326" y="${y}" class="num" text-anchor="end">${solved === null ? '-' : escapeXml(solved)}</text>
  <text x="370" y="${y}" class="rank" text-anchor="end">${played && category.rank > 0 ? `#${escapeXml(category.rank)}` : '-'}</text>`;
      })
      .join('');
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none">
  <style>
    ${jetBrainsMonoFontFace}
    .title { font: 500 13px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .total-label { font: 500 11px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .total-value { font: 700 14px 'JetBrains Mono', monospace; fill: ${colors.accent}; }
    .head { font: 400 9px 'JetBrains Mono', monospace; fill: ${colors.subText}; }
    .cat { font: 500 12px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .num { font: 700 11px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .rank { font: 500 11px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .no-data { font: 500 12px 'JetBrains Mono', monospace; fill: ${colors.subText}; }
  </style>

  <!-- 배경 -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.background}" rx="12" ry="12"/>

  <!-- 타이틀과 총점 -->
  <text x="20" y="30" class="title">Wargame Categories</text>
  <text x="370" y="30" text-anchor="end"><tspan class="total-label">Total </tspan><tspan class="total-value">${escapeXml(stats.total_score)}</tspan></text>

  <!-- 열 제목 -->
  <text x="290" y="54" class="head" text-anchor="end">Score</text>
  <text x="326" y="54" class="head" text-anchor="end">Solved</text>
  <text x="370" y="54" class="head" text-anchor="end">Rank</text>

  <!-- 분야별 막대 -->
  ${rows}

  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" fill="none" stroke="${colors.border}" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
}
