import { Theme } from '../types';
import { encodeUsername } from './encodeUsername';

// 메인 페이지에서 고를 수 있는 카드 (같은 API의 옵션 차이도 별도 항목으로 보여줌)
export type CardType =
  | 'stats'
  | 'most-solved'
  | 'most-solved-bars'
  | 'ctf'
  | 'ctf-graph'
  | 'ctf-seasons'
  | 'solves'
  | 'solves-hardest'
  | 'level';

interface CardDefinition {
  label: string;
  endpoint: string;
  alt: string;
  // username·theme 뒤에 붙는 고정 옵션
  params?: Record<string, string>;
  // season 옵션을 받는 카드인지
  season?: boolean;
}

export const CARDS: Record<CardType, CardDefinition> = {
  stats: { label: 'Wargame Stats', endpoint: 'stats', alt: 'Dreamhack Stats' },
  'most-solved': { label: 'Most Solved Categories', endpoint: 'most-solved', alt: 'Dreamhack Category Chart' },
  'most-solved-bars': {
    label: 'Most Solved Categories (Bars)',
    endpoint: 'most-solved',
    alt: 'Dreamhack Category Chart',
    params: { layout: 'bars' },
  },
  ctf: { label: 'CTF Season', endpoint: 'ctf', alt: 'Dreamhack CTF', season: true },
  'ctf-graph': { label: 'CTF Season (Graph)', endpoint: 'ctf', alt: 'Dreamhack CTF', params: { view: 'graph' }, season: true },
  'ctf-seasons': { label: 'CTF Seasons', endpoint: 'ctf', alt: 'Dreamhack CTF Seasons', params: { view: 'seasons' } },
  solves: { label: 'Recent Solves', endpoint: 'solves', alt: 'Dreamhack Recent Solves' },
  'solves-hardest': { label: 'Hardest Solves', endpoint: 'solves', alt: 'Dreamhack Hardest Solves', params: { sort: 'hardest' } },
  level: { label: 'Level Badge', endpoint: 'level', alt: 'Dreamhack Level' },
};

export const CARD_TYPES = Object.keys(CARDS) as CardType[];

// auto는 README를 보는 사람의 GitHub 테마에 따라 light/dark 카드를 골라 보여주는 코드(<picture>)를 만듦
export type ThemeChoice = Theme | 'auto';

export const THEME_LABELS: Record<ThemeChoice, string> = {
  light: 'Light',
  dark: 'Dark',
  dracula: 'Dracula',
  tokyonight: 'Tokyo Night',
  nord: 'Nord',
  gruvbox: 'Gruvbox',
  transparent: 'Transparent',
  auto: 'Auto (GitHub 테마 따라가기)',
};

// 시즌 입력값: 숫자나 current만 주소에 넣음 (그 밖의 값은 무시)
export function normalizeSeason(value: string): string | null {
  const trimmed = value.trim();
  return /^(current|[1-9]\d{0,2})$/.test(trimmed) ? trimmed : null;
}

interface CardUrlOptions {
  card: CardType;
  theme: Theme;
  username: string;
  season?: string;
}

// 카드 주소. base가 ''이면 상대 주소(미리보기용)
export function buildCardUrl(base: string, { card, theme, username, season }: CardUrlOptions): string {
  const definition = CARDS[card];
  const user = username ? encodeUsername(username) : '사용자명';
  let url = `${base}/api/${definition.endpoint}?username=${user}&theme=${theme}`;
  for (const [key, value] of Object.entries(definition.params ?? {})) {
    url += `&${key}=${value}`;
  }
  const normalizedSeason = definition.season && season ? normalizeSeason(season) : null;
  if (normalizedSeason) {
    url += `&season=${normalizedSeason}`;
  }
  return url;
}

interface CardCodeOptions {
  card: CardType;
  theme: ThemeChoice;
  username: string;
  season?: string;
}

// GitHub 다크 모드에서는 dark 카드, 라이트 모드에서는 light 카드
function pictureCode(base: string, options: CardCodeOptions, indent: string): string {
  const { card } = options;
  const dark = buildCardUrl(base, { ...options, theme: 'dark' });
  const light = buildCardUrl(base, { ...options, theme: 'light' });
  return `${indent}<picture>
${indent}  <source media="(prefers-color-scheme: dark)" srcset="${dark}" />
${indent}  <img src="${light}" alt="${CARDS[card].alt}" />
${indent}</picture>`;
}

export function buildMarkdownCode(base: string, options: CardCodeOptions): string {
  if (options.theme === 'auto') {
    return pictureCode(base, options, '');
  }
  return `![${CARDS[options.card].alt}](${buildCardUrl(base, { ...options, theme: options.theme })})`;
}

export function buildHtmlCode(base: string, options: CardCodeOptions, profileUrl: string | null): string {
  const href = profileUrl || 'https://dreamhack.io/users/사용자ID';
  const inner = options.theme === 'auto'
    ? pictureCode(base, options, '  ')
    : `  <img src="${buildCardUrl(base, { ...options, theme: options.theme })}" alt="${CARDS[options.card].alt}" />`;
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">
${inner}
</a>`;
}
