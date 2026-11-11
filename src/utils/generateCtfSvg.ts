import { TCtfSeasonResult, TCtfSeasonSummary, Theme, ThemeColors } from '../types';
import { escapeXml, themes } from './svg';
import { textWidth, truncateToWidth } from './text';
import { tierColor } from './tiers';
import { jetBrainsMonoFontFace } from './fonts/jetbrainsMono';

export const CTF_CARD_TITLE = 'Dreamhack CTF';

// Dreamhack CTF 티어 구간 (Dreamhack 웹 페이지의 TIER_DEFINITIONS 값). Bronze~Diamond는 III·II·I 세 단계
export const CTF_TIER_GROUPS = [
  { tierClass: 'unranked', name: 'Unranked', short: 'U', from: 0, to: 900, steps: 1 },
  { tierClass: 'bronze', name: 'Bronze', short: 'B', from: 900, to: 1200, steps: 3 },
  { tierClass: 'silver', name: 'Silver', short: 'S', from: 1200, to: 1500, steps: 3 },
  { tierClass: 'gold', name: 'Gold', short: 'G', from: 1500, to: 1800, steps: 3 },
  { tierClass: 'platinum', name: 'Platinum', short: 'P', from: 1800, to: 2100, steps: 3 },
  { tierClass: 'diamond', name: 'Diamond', short: 'D', from: 2100, to: 2400, steps: 3 },
  { tierClass: 'master', name: 'Master', short: 'M', from: 2400, to: 2750, steps: 1 },
  { tierClass: 'grandmaster', name: 'Grandmaster', short: 'GM', from: 2750, to: 3051, steps: 1 },
];

type TTierGroup = (typeof CTF_TIER_GROUPS)[number];

function tierGroupIndex(rating: number): number {
  if (rating < 0) return 0;
  const index = CTF_TIER_GROUPS.findIndex((group) => rating >= group.from && rating < group.to);
  return index === -1 ? CTF_TIER_GROUPS.length - 1 : index;
}

export function ctfTierGroup(rating: number): TTierGroup {
  return CTF_TIER_GROUPS[tierGroupIndex(rating)];
}

// 'Silver I' → 'S1', 'Master' → 'M' (시즌별 결과 카드의 작은 알약용)
const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3 };
export function ctfTierShort(tier: string): string {
  const [name, position] = tier.split(' ');
  const group = CTF_TIER_GROUPS.find((item) => item.name === name);
  const short = group ? group.short : (name || '?').charAt(0).toUpperCase();
  return position && ROMAN[position] ? `${short}${ROMAN[position]}` : short;
}

const F = "'JetBrains Mono', monospace";

function frame(width: number, height: number, colors: ThemeColors, css: string, body: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <style>
    ${jetBrainsMonoFontFace}
    .title { font: 500 13px ${F}; fill: ${colors.title}; }
    .label { font: 400 10px ${F}; fill: ${colors.subText}; }
    .value { font: 700 18px ${F}; fill: ${colors.text}; }
    .total { font: 700 12px ${F}; fill: ${colors.title}; }
    .accent { font: 700 18px ${F}; fill: ${colors.accent}; }
    .pill-text { font: 700 9px ${F}; letter-spacing: 0.6px; }
    .name { font: 700 26px ${F}; fill: ${colors.text}; }
    .name-small { font: 700 22px ${F}; fill: ${colors.text}; }
    .top-label { font: 500 12px ${F}; fill: ${colors.title}; }
    .rating { font: 700 13px ${F}; fill: ${colors.text}; }
    .note { font: 500 11px ${F}; fill: ${colors.title}; }
    ${css}
  </style>

  <!-- 배경 -->
  <rect width="${width}" height="${height}" fill="${colors.background}" rx="12" ry="12"/>
${body}
  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="${colors.border}" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
}

// 진행 중인 시즌은 ONGOING, 끝난 시즌은 FINAL
function statusPill(colors: ThemeColors, live: boolean): string {
  const label = live ? 'ONGOING' : 'FINAL';
  const color = live ? colors.accent : colors.title;
  const width = label.length * 5.8 + 18;
  const x = 370 - width;
  return `<rect x="${x.toFixed(1)}" y="17" width="${width.toFixed(1)}" height="18" rx="9" fill="${color}" fill-opacity="0.14"/>
  <text x="${(x + width / 2).toFixed(1)}" y="29" class="pill-text" fill="${color}" text-anchor="middle">${label}</text>`;
}

function statBox(x: number, label: string, valueSvg: string, colors: ThemeColors): string {
  return `  <g transform="translate(${x}, 117)">
    <rect width="115" height="60" fill="${colors.cardBackground}" rx="8" ry="8"/>
    <text x="57.5" y="16" class="label" text-anchor="middle">${label}</text>
    <text x="57.5" y="44" text-anchor="middle">${valueSvg}</text>
  </g>`;
}

// 닉네임이 오른쪽 글자와 겹치지 않도록 남은 폭에 맞춰 줄임
function fitNickname(nickname: string, availablePx: number, charPx: number): string {
  return truncateToWidth(nickname, Math.max(4, Math.floor(availablePx / charPx)));
}

function topPercentage(result: TCtfSeasonResult): string {
  if (!result.rank || !result.participants) return '-';
  return `${((result.rank / result.participants) * 100).toFixed(2)}%`;
}

// 시즌 카드 기본형: 시즌 티어·레이팅, 다음 티어까지 남은 점수(진행 중) 또는 시즌 중 최고 레이팅(종료), 시즌 순위·상위 %·참가 대회 수
export function generateCtfSeasonSvg(nickname: string, result: TCtfSeasonResult, live: boolean, theme: Theme = 'light'): string {
  const colors = themes[theme];
  const color = tierColor(theme, result.tierClass);
  const groupIndex = tierGroupIndex(result.rating);
  const group = CTF_TIER_GROUPS[groupIndex];
  const next = CTF_TIER_GROUPS[groupIndex + 1];
  const ratio = Math.min(1, Math.max(0, (result.rating - group.from) / (group.to - group.from)));
  const barX = 20;
  const barWidth = 350;
  const separators = group.steps > 1
    ? Array.from({ length: group.steps - 1 }, (_, i) => barX + (barWidth * (i + 1)) / group.steps)
    : [];

  const peak = Math.max(result.rating, ...result.rounds.map((round) => round.rating));
  let right: string;
  if (live) {
    right = next
      ? `${next.from - result.rating} to <tspan fill="${tierColor(theme, next.tierClass)}" font-weight="700">${next.name}</tspan>`
      : 'Top tier';
  } else if (peak > result.rating) {
    right = `Peak <tspan fill="${tierColor(theme, ctfTierGroup(peak).tierClass)}" font-weight="700">${peak}</tspan>`;
  } else {
    right = 'Season final';
  }

  const tierText = result.tier || group.name;
  const tierWidth = textWidth(tierText) * 10.8;
  const name = fitNickname(nickname, 370 - tierWidth - 16 - 20, 15.6);
  const rankValue = result.rank
    ? `<tspan class="value">${escapeXml(result.rank)}</tspan><tspan class="total" dx="1">/${escapeXml(result.participants)}</tspan>`
    : '<tspan class="value">-</tspan>';

  const body = `
  <text x="20" y="30" class="title">Dreamhack CTF Season ${escapeXml(result.season)}</text>
  ${statusPill(colors, live)}
  <text x="20" y="72" class="name">${escapeXml(name)}</text>
  <text x="370" y="52" class="top-label" text-anchor="end">TIER</text>
  <text x="370" y="74" class="tier" text-anchor="end" fill="${color}">${escapeXml(tierText)}</text>

  <text x="20" y="93"><tspan class="label">Rating </tspan><tspan class="rating">${escapeXml(result.rating)}</tspan></text>
  <text x="370" y="93" class="note" text-anchor="end">${right}</text>
  <rect x="${barX}" y="99" width="${barWidth}" height="7" rx="3.5" fill="${colors.track}"/>
  ${ratio > 0 ? `<rect x="${barX}" y="99" width="${(barWidth * ratio).toFixed(1)}" height="7" rx="3.5" fill="${color}"/>` : ''}
  ${separators.map((x) => `<rect x="${(x - 1).toFixed(1)}" y="99" width="2" height="7" fill="${colors.background === 'none' ? colors.title : colors.background}" fill-opacity="${colors.background === 'none' ? 0.5 : 1}"/>`).join('')}

${statBox(15, 'Season Rank', rankValue, colors)}
${statBox(137, 'TOP', `<tspan class="accent">${topPercentage(result)}</tspan>`, colors)}
${statBox(259, 'Contests', `<tspan class="value">${escapeXml(result.contests)}</tspan>`, colors)}`;

  return frame(390, 190, colors, `.tier { font: 700 18px ${F}; }`, body);
}

function tierBands(theme: Theme, low: number, high: number, toY: (rating: number) => number): string {
  const opacity = themes[theme].background === '#ffffff' || theme === 'transparent' ? 0.1 : 0.14;
  return CTF_TIER_GROUPS.filter((group) => group.to > low && group.from < high)
    .map((group) => {
      const top = toY(Math.min(group.to, high));
      const bottom = toY(Math.max(group.from, low));
      const color = tierColor(theme, group.tierClass);
      // 얇은 구간은 이름끼리 겹치므로 이름을 생략
      const label = bottom - top >= 14
        ? `<text x="24" y="${(top + 10).toFixed(1)}" class="band" fill="${color}">${group.name.toUpperCase()}</text>`
        : '';
      return `<rect x="20" y="${top.toFixed(1)}" width="350" height="${(bottom - top).toFixed(1)}" fill="${color}" fill-opacity="${opacity}"/>
  ${label}`;
    })
    .join('\n  ');
}

function headerRight(theme: Theme, tier: string, tierClass: string, rating: number, y: number): { svg: string; width: number } {
  const svg = `<text x="370" y="${y}" text-anchor="end"><tspan class="tier-small" fill="${tierColor(theme, tierClass)}">${escapeXml(tier)}</tspan><tspan class="rating-small" dx="8">${escapeXml(rating)}</tspan></text>`;
  return { svg, width: (textWidth(tier) + String(rating).length) * 9 + 8 };
}

const GRAPH_CSS = `
    .band { font: 700 8px ${F}; letter-spacing: 0.5px; }
    .tier-small { font: 700 15px ${F}; }
    .podium { font: 700 8px ${F}; }
    .end { font: 700 10px ${F}; }
    .tier-pill { font: 700 8.5px ${F}; fill: #ffffff; }
    .season { font: 500 10px ${F}; }`;

// 시즌 카드 그래프형: 그 시즌 대회별 레이팅 (3등 안에 든 대회는 등수 표시). 이을 점이 둘 미만이면 기본형
export function generateCtfGraphSvg(nickname: string, result: TCtfSeasonResult, live: boolean, theme: Theme = 'light'): string {
  const points: { rating: number; rank: number | null; adjusted?: boolean }[] = result.rounds.map((round) => ({ ...round }));
  // 시즌 결과가 마지막 대회 직후 레이팅과 다르면(시즌 마감 보정) 결과 값을 점선으로 이어 붙임
  const adjusted = points.length > 0 && points[points.length - 1].rating !== result.rating;
  if (adjusted) points.push({ rating: result.rating, rank: null, adjusted: true });
  if (points.length < 2) {
    return generateCtfSeasonSvg(nickname, result, live, theme);
  }
  const colors = themes[theme];

  const ratings = points.map((point) => point.rating);
  const low = Math.floor(Math.min(...ratings) / 100) * 100 - 100;
  const high = Math.ceil(Math.max(...ratings) / 100) * 100 + 100;
  const x0 = 80, x1 = 350, y0 = 82, y1 = 176;
  const toX = (i: number) => (points.length === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (points.length - 1));
  const toY = (rating: number) => y1 - ((rating - low) / (high - low)) * (y1 - y0);

  const solidCount = adjusted ? points.length - 1 : points.length;
  const line = points.slice(0, solidCount).map((p, i) => `${toX(i).toFixed(1)},${toY(p.rating).toFixed(1)}`).join(' ');
  const area = `${toX(0).toFixed(1)},${y1} ${line} ${toX(solidCount - 1).toFixed(1)},${y1}`;
  const last = points.length - 1;
  const dots = points.slice(0, last).map((point, i) => {
    const x = toX(i).toFixed(1);
    const y = toY(point.rating);
    const podium = point.rank !== null && point.rank >= 1 && point.rank <= 3;
    return `<circle cx="${x}" cy="${y.toFixed(1)}" r="${podium ? 3.5 : 2.5}" fill="${podium ? colors.accent : colors.background === 'none' ? colors.accent : colors.background}" stroke="${colors.accent}" stroke-width="1.5"/>${
      podium ? `<text x="${x}" y="${(y - 7).toFixed(1)}" class="podium" fill="${colors.title}" text-anchor="middle">#${point.rank}</text>` : ''}`;
  }).join('');
  const lastX = toX(last), lastY = toY(result.rating);
  const tierText = result.tier || ctfTierGroup(result.rating).name;
  const right = headerRight(theme, tierText, result.tierClass, result.rating, 64);
  const name = fitNickname(nickname, 370 - right.width - 16 - 20, 13.2);
  const rankText = result.rank ? `#${result.rank}/${result.participants}` : '-';

  const body = `
  <text x="20" y="30" class="title">Dreamhack CTF Season ${escapeXml(result.season)}</text>
  ${statusPill(colors, live)}
  <text x="20" y="64" class="name-small">${escapeXml(name)}</text>
  ${right.svg}
  <text x="370" y="78" class="label" text-anchor="end">${escapeXml(rankText)} · ${escapeXml(result.contests)} contests</text>
  <g>
  ${tierBands(theme, low, high, toY)}
  </g>
  <polygon points="${area}" fill="${colors.accent}" fill-opacity="0.12"/>
  <polyline points="${line}" fill="none" stroke="${colors.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  ${adjusted ? `<line x1="${toX(last - 1).toFixed(1)}" y1="${toY(points[last - 1].rating).toFixed(1)}" x2="${lastX.toFixed(1)}" y2="${lastY.toFixed(1)}" stroke="${colors.accent}" stroke-width="2" stroke-dasharray="3 3"/>` : ''}
  ${dots}
  <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="4" fill="${tierColor(theme, result.tierClass)}" stroke="${colors.background === 'none' ? colors.title : colors.background}" stroke-width="1.5"/>
  <text x="${(lastX + 5).toFixed(1)}" y="${(lastY - 9).toFixed(1)}" class="end" fill="${colors.text}" text-anchor="end">${escapeXml(result.rating)}</text>`;

  return frame(390, 190, colors, GRAPH_CSS + `\n    .rating-small { font: 700 15px ${F}; fill: ${colors.text}; }`, body);
}

export const CTF_HISTORY_MAX_SEASONS = 6;

// 시즌별 결과 카드: 시즌마다 끝났을 때 티어를 이은 그래프 (최근 6개 시즌, *는 진행 중)
export function generateCtfHistorySvg(
  nickname: string,
  seasons: (TCtfSeasonSummary & { live?: boolean })[],
  theme: Theme = 'light'
): string {
  const colors = themes[theme];
  const points = seasons.slice(-CTF_HISTORY_MAX_SEASONS);
  const ratings = points.map((point) => point.rating);
  const low = Math.floor(Math.min(...ratings) / 100) * 100 - 100;
  const high = Math.ceil(Math.max(...ratings) / 100) * 100 + 150;
  const x0 = 92, x1 = 340, y0 = 74, y1 = 166;
  const toX = (i: number) => (points.length === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (points.length - 1));
  const toY = (rating: number) => y1 - ((rating - low) / (high - low)) * (y1 - y0);

  const liveIndex = points.findIndex((point) => point.live);
  const finished = liveIndex === -1 ? points : points.slice(0, liveIndex);
  const solid = finished.map((point, i) => `${toX(i).toFixed(1)},${toY(point.rating).toFixed(1)}`).join(' ');
  const liveSegment = liveIndex > 0
    ? `<line x1="${toX(liveIndex - 1).toFixed(1)}" y1="${toY(points[liveIndex - 1].rating).toFixed(1)}" x2="${toX(liveIndex).toFixed(1)}" y2="${toY(points[liveIndex].rating).toFixed(1)}" stroke="${colors.accent}" stroke-width="2" stroke-dasharray="3 3"/>`
    : '';

  const marks = points.map((point, i) => {
    const x = toX(i);
    const y = toY(point.rating);
    const color = tierColor(theme, point.tierClass);
    const short = ctfTierShort(point.tier || ctfTierGroup(point.rating).name);
    const pillWidth = short.length * 6 + 10;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${point.live ? (colors.background === 'none' ? colors.title : colors.background) : color}" stroke="${color}" stroke-width="2"/>
  <rect x="${(x - pillWidth / 2).toFixed(1)}" y="${(y - 23).toFixed(1)}" width="${pillWidth}" height="14" rx="7" fill="${color}"/>
  <text x="${x.toFixed(1)}" y="${(y - 13).toFixed(1)}" class="tier-pill" text-anchor="middle">${escapeXml(short)}</text>
  <text x="${x.toFixed(1)}" y="182" class="season" fill="${colors.subText}" text-anchor="middle">Season ${escapeXml(point.season)}${point.live ? '*' : ''}</text>`;
  }).join('\n  ');

  const latest = points[points.length - 1];
  const right = headerRight(theme, latest.tier || ctfTierGroup(latest.rating).name, latest.tierClass, latest.rating, 60);
  const name = fitNickname(nickname, 370 - right.width - 16 - 20, 13.2);

  const body = `
  <text x="20" y="30" class="title">Dreamhack CTF Seasons</text>
  ${liveIndex !== -1 ? `<text x="370" y="30" class="note" text-anchor="end">* ongoing</text>` : ''}
  <text x="20" y="60" class="name-small">${escapeXml(name)}</text>
  ${right.svg}
  <g>
  ${tierBands(theme, low, high, toY)}
  </g>
  ${finished.length > 1 ? `<polyline points="${solid}" fill="none" stroke="${colors.accent}" stroke-width="2" stroke-linejoin="round"/>` : ''}
  ${liveSegment}
  ${marks}`;

  return frame(390, 190, colors, GRAPH_CSS + `\n    .rating-small { font: 700 15px ${F}; fill: ${colors.text}; }`, body);
}

// 기록이 없을 때: season이 null이면 CTF에 참가한 적 없음, 아니면 그 시즌에 결과 없음
export function generateCtfEmptySvg(
  nickname: string,
  season: number | null,
  live: boolean,
  lastPlayed: TCtfSeasonSummary | null,
  theme: Theme = 'light'
): string {
  const colors = themes[theme];
  const message = season === null
    ? 'No CTF record yet'
    : live
      ? `No Season ${season} contests yet`
      : `No Season ${season} record`;
  const detail = lastPlayed
    ? `Last played: Season ${escapeXml(lastPlayed.season)}  <tspan fill="${tierColor(theme, lastPlayed.tierClass)}" font-weight="700">${escapeXml(lastPlayed.tier || ctfTierGroup(lastPlayed.rating).name)}</tspan> ${escapeXml(lastPlayed.rating)}`
    : 'Join a Dreamhack CTF to get a tier.';

  const body = `
  <text x="20" y="30" class="title">${season === null ? 'Dreamhack CTF' : `Dreamhack CTF Season ${escapeXml(season)}`}</text>
  ${season === null ? '' : statusPill(colors, live)}
  <text x="20" y="72" class="name">${escapeXml(fitNickname(nickname, 350, 15.6))}</text>
  <rect x="15" y="92" width="360" height="84" rx="8" fill="${colors.cardBackground}"/>
  <text x="195" y="126" class="message" text-anchor="middle">${escapeXml(message)}</text>
  <text x="195" y="152" class="note" text-anchor="middle">${detail}</text>`;

  return frame(390, 190, colors, `.message { font: 700 14px ${F}; fill: ${colors.text}; }`, body);
}
