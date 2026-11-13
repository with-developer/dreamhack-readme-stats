import { TErrorCard, Theme } from '../types';
import { escapeXml, themes } from './svg';
import { jetBrainsMonoFontFace } from './fonts/jetbrainsMono';

// 카드 폭(390px)을 넘지 않도록 닉네임 표시 길이 제한
const MAX_NICKNAME_LENGTH = 30;

function truncate(value: string, maxLength: number): string {
  const chars = Array.from(value);
  return chars.length > maxLength ? `${chars.slice(0, maxLength - 3).join('')}...` : value;
}

// README에서 깨진 이미지 대신 보여줄 오류 카드 문구
export const errorCards = {
  missingUsername: (title: string): TErrorCard => ({
    title,
    message: 'Missing username',
    details: ['Add ?username=<nickname> to the card URL.'],
  }),
  userNotFound: (title: string, username: string): TErrorCard => ({
    title,
    message: 'User not found',
    details: [
      `Nickname: ${truncate(username, MAX_NICKNAME_LENGTH)}`,
      'Nicknames are case-sensitive.',
      'Only users on the wargame ranking are shown.',
    ],
  }),
  invalidSeason: (title: string, value: string): TErrorCard => ({
    title,
    message: 'Invalid season',
    details: [
      `season: ${truncate(value, MAX_NICKNAME_LENGTH)}`,
      'Use season=<number> or season=current.',
    ],
  }),
  seasonNotFound: (title: string, season: number, latestSeason: number | null): TErrorCard => ({
    title,
    message: `Season ${season} not found`,
    details: latestSeason ? [`Seasons 1-${latestSeason} are available.`] : ['Could not find CTF seasons.'],
  }),
  fetchFailed: (title: string): TErrorCard => ({
    title,
    message: 'Failed to load stats',
    details: ['Could not load data from Dreamhack.', 'Please try again later.'],
  }),
};

export function generateErrorSvg(error: TErrorCard, theme: Theme = 'light'): string {
  const colors = themes[theme];

  const details = error.details
    .map((line, index) => `<text x="20" y="${112 + index * 20}" class="detail">${escapeXml(line)}</text>`)
    .join('\n  ');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="390" height="190" viewBox="0 0 390 190" fill="none">
  <style>
    ${jetBrainsMonoFontFace}
    .title { font: 500 13px 'JetBrains Mono', monospace; fill: ${colors.title}; }
    .message { font: 700 20px 'JetBrains Mono', monospace; fill: ${colors.text}; }
    .detail { font: 400 11px 'JetBrains Mono', monospace; fill: ${colors.title}; }
  </style>

  <!-- 배경 -->
  <rect width="390" height="190" fill="${colors.background}" rx="12" ry="12"/>

  <!-- 타이틀 -->
  <text x="20" y="30" class="title">${escapeXml(error.title)}</text>

  <!-- 오류 메시지 -->
  <text x="20" y="78" class="message">${escapeXml(error.message)}</text>
  ${details}

  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="389" height="189" fill="none" stroke="${colors.border}" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
}
