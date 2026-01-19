import { Tstats, Theme, ThemeColors } from '../types';

const themes: Record<Theme, ThemeColors> = {
  light: {
    background: '#ffffff',
    cardBackground: '#f8fafc',
    border: '#e2e8f0',
    title: '#64748b',
    text: '#0f172a',
    subText: '#94a3b8',
    accent: '#3b82f6',
  },
  dark: {
    background: '#0d1117',
    cardBackground: '#21262d',
    border: '#30363d',
    title: '#8b949e',
    text: '#e6edf3',
    subText: '#7d8590',
    accent: '#58a6ff',
  },
};

export function generateStatsSvg(stats: Tstats, theme: Theme = 'light'): string {
  const colors = themes[theme];

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="390" height="190" viewBox="0 0 390 190" fill="none">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;display=swap');
    .title { font: 500 13px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .user-name { font: 700 28px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .stat-label { font: 400 10px 'JetBrains Mono', monospace; fill: ${colors.subText}; }
    .stat-value { font: 700 18px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .top-label { font: 500 12px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .top-value { font: 700 20px 'JetBrains Mono', monospace; fill: ${colors.accent}; }
  </style>

  <!-- 배경 -->
  <rect width="390" height="190" fill="${colors.background}" rx="12" ry="12"/>

  <!-- 타이틀 -->
  <text x="20" y="30" class="title">Dreamhack Wargame Stats</text>

  <!-- 닉네임 (타이틀과 하단 박스 중앙) -->
  <text x="20" y="75" class="user-name">${stats.nickname}</text>

  <!-- TOP % (우측, 닉네임과 동일 높이) -->
  <g transform="translate(280, 26)">
    <text x="45" y="18" class="top-label" text-anchor="middle">TOP</text>
    <text x="45" y="45" class="top-value" text-anchor="middle">${stats.wargameRankPercentage}%</text>
  </g>

  <!-- 스탯 (하단 가로 배치, 중앙 정렬) -->
  <g transform="translate(15, 105)">
    <rect x="0" y="0" width="115" height="70" fill="${colors.cardBackground}" rx="8" ry="8"/>
    <text x="57.5" y="16" class="stat-label" text-anchor="middle">Solved Challenges</text>
    <text x="57.5" y="48" class="stat-value" text-anchor="middle">${stats.wargame_solved}</text>
  </g>

  <g transform="translate(137, 105)">
    <rect x="0" y="0" width="115" height="70" fill="${colors.cardBackground}" rx="8" ry="8"/>
    <text x="57.5" y="16" class="stat-label" text-anchor="middle">Rank</text>
    <text x="57.5" y="48" class="stat-value" text-anchor="middle">${stats.wargame_rank}</text>
  </g>

  <g transform="translate(259, 105)">
    <rect x="0" y="0" width="115" height="70" fill="${colors.cardBackground}" rx="8" ry="8"/>
    <text x="57.5" y="16" class="stat-label" text-anchor="middle">Score</text>
    <text x="57.5" y="48" class="stat-value" text-anchor="middle">${stats.wargame_score}</text>
  </g>

  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="389" height="189" fill="none" stroke="${colors.border}" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
}
