import { Theme } from '../types';
import { escapeXml, themes } from './svg';
import { textWidth, truncateToWidth } from './text';
import { jetBrainsMonoFontFace } from './fonts/jetbrainsMono';

export interface TLevelBadge {
  nickname: string;
  level: number;
  exp: number;
  expNeeded: number;
  // 기여도 순위 (없으면 null)
  contributionRank: number | null;
  // 워게임 상위 % 문자열 (예: '1.60', 없으면 null)
  wargameTopPercentage: string | null;
  // 대표 업적 이름 (없으면 null)
  achievement: string | null;
}

const WIDTH = 340;
const HEIGHT = 114;
const RIGHT = WIDTH - 18;
// 글꼴 크기별 영문 한 글자 폭 (JetBrains Mono는 글꼴 크기의 0.6배)
const LEVEL_CHAR_WIDTH = 18; // 30px
const NICK_CHAR_WIDTH = 9.6; // 16px
const ACHIEVEMENT_MAX_WIDTH = 18;

// 기여도 레벨 배지: 레벨, 다음 레벨까지 경험치, 기여도 순위, 워게임 상위 %, 대표 업적
export function generateLevelSvg(badge: TLevelBadge, theme: Theme = 'light'): string {
  const colors = themes[theme];
  const levelText = `Lv.${badge.level}`;
  const nickX = 18 + levelText.length * LEVEL_CHAR_WIDTH + 14;
  const nickname = truncateToWidth(badge.nickname, Math.floor((RIGHT - nickX) / NICK_CHAR_WIDTH));
  const ratio = badge.expNeeded > 0 ? Math.min(1, Math.max(0, badge.exp / badge.expNeeded)) : 0;
  const barWidth = RIGHT - 18;

  const achievement = badge.achievement ? truncateToWidth(badge.achievement, ACHIEVEMENT_MAX_WIDTH) : null;
  // 대표 업적 알약 크기는 글자 폭(10px 글꼴 = 한 칸 6px, 한글은 두 칸)에 맞춤
  const achievementWidth = achievement ? textWidth(achievement) * 6 + 18 : 0;

  const details: string[] = [];
  if (badge.contributionRank) {
    details.push(`<tspan class="k">Contrib. </tspan><tspan class="v">#${escapeXml(badge.contributionRank)}</tspan>`);
  }
  if (badge.wargameTopPercentage) {
    details.push(`<tspan class="k"${details.length ? ' dx="10"' : ''}>Wargame </tspan><tspan class="v">TOP ${escapeXml(badge.wargameTopPercentage)}%</tspan>`);
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none">
  <style>
    ${jetBrainsMonoFontFace}
    .brand { font: 500 12px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .lv { font: 700 30px 'JetBrains Mono', monospace; fill: ${colors.accent}; }
    .nick { font: 700 16px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .k { font: 400 10px 'JetBrains Mono', monospace; fill: ${colors.subText}; }
    .v { font: 700 10px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .ach { font: 500 10px 'JetBrains Mono', monospace; fill: ${colors.accent}; }
  </style>

  <!-- 배경 -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${colors.background}" rx="12" ry="12"/>

  <text x="18" y="27" class="brand">Dreamhack</text>
  ${achievement ? `<rect x="${RIGHT - achievementWidth}" y="14" width="${achievementWidth}" height="18" rx="9" fill="${colors.accent}" fill-opacity="0.12"/>
  <text x="${RIGHT - achievementWidth / 2}" y="26.5" class="ach" text-anchor="middle">${escapeXml(achievement)}</text>` : ''}

  <!-- 레벨과 닉네임 -->
  <text x="18" y="66" class="lv">${escapeXml(levelText)}</text>
  <text x="${nickX}" y="51" class="nick">${escapeXml(nickname)}</text>
  ${details.length ? `<text x="${nickX}" y="67">${details.join('')}</text>` : ''}

  <!-- 경험치 막대 -->
  <rect x="18" y="80" width="${barWidth}" height="6" rx="3" fill="${colors.track}"/>
  ${ratio > 0 ? `<rect x="18" y="80" width="${(barWidth * ratio).toFixed(1)}" height="6" rx="3" fill="${colors.accent}"/>` : ''}
  <text x="18" y="102"><tspan class="k">EXP </tspan><tspan class="v">${escapeXml(badge.exp)}</tspan>${badge.expNeeded > 0 ? `<tspan class="k"> / ${escapeXml(badge.expNeeded)}</tspan>` : ''}</text>
  ${badge.expNeeded > 0 ? `<text x="${RIGHT}" y="102" class="k" text-anchor="end">${Math.floor(ratio * 100)}% to Lv.${badge.level + 1}</text>` : ''}

  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" fill="none" stroke="${colors.border}" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
}
