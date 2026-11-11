import type { NextApiResponse } from 'next';
import { Theme, ThemeColors } from '../types';

export const themes: Record<Theme, ThemeColors> = {
  light: {
    background: '#ffffff',
    cardBackground: '#f8fafc',
    border: '#e2e8f0',
    title: '#64748b',
    text: '#0f172a',
    subText: '#94a3b8',
    accent: '#3b82f6',
    track: '#e2e8f0',
    knockout: '#ffffff',
    scheme: 'light',
  },
  dark: {
    background: '#0d1117',
    cardBackground: '#21262d',
    border: '#30363d',
    title: '#8b949e',
    text: '#e6edf3',
    subText: '#7d8590',
    accent: '#58a6ff',
    track: '#30363d',
    knockout: '#0d1117',
    scheme: 'dark',
  },
  dracula: {
    background: '#282a36',
    cardBackground: '#343746',
    border: '#44475a',
    title: '#bd93f9',
    text: '#f8f8f2',
    subText: '#6272a4',
    accent: '#ff79c6',
    track: '#44475a',
    knockout: '#282a36',
    scheme: 'dark',
  },
  tokyonight: {
    background: '#1a1b26',
    cardBackground: '#24283b',
    border: '#2f3549',
    title: '#7aa2f7',
    text: '#c0caf5',
    subText: '#565f89',
    accent: '#bb9af7',
    track: '#2f3549',
    knockout: '#1a1b26',
    scheme: 'dark',
  },
  nord: {
    background: '#2e3440',
    cardBackground: '#3b4252',
    border: '#434c5e',
    title: '#81a1c1',
    text: '#eceff4',
    subText: '#7b88a1',
    accent: '#88c0d0',
    track: '#434c5e',
    knockout: '#2e3440',
    scheme: 'dark',
  },
  gruvbox: {
    background: '#282828',
    cardBackground: '#3c3836',
    border: '#504945',
    title: '#fabd2f',
    text: '#ebdbb2',
    subText: '#a89984',
    accent: '#fe8019',
    track: '#504945',
    knockout: '#282828',
    scheme: 'dark',
  },
  // README 배경(라이트/다크) 어디에 놓여도 읽히도록 글자는 중간 회색, 배경과 테두리는 없음
  transparent: {
    background: 'none',
    cardBackground: '#8b949e1f',
    border: 'none',
    title: '#6e7781',
    text: '#6e7781',
    subText: '#8b949e',
    accent: '#3b82f6',
    track: '#8b949e33',
    knockout: '#8b949e80',
    scheme: 'light',
  },
};

// 테마 이름 목록 (메인 페이지 선택지와 README 표에 같은 순서로 사용)
export const THEME_NAMES = Object.keys(themes) as Theme[];

// 쿼리의 theme 값을 테마로 변환 (모르는 값이나 배열이면 light)
export function parseTheme(value: unknown): Theme {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(themes, value)
    ? (value as Theme)
    : 'light';
}

// SVG(XML)에 넣는 문자열의 특수문자를 이스케이프 (닉네임에 &, < 등이 있으면 SVG가 깨지거나 태그로 해석됨)
// XML에서 허용되지 않는 제어 문자는 제거
export function escapeXml(value: string | number): string {
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// SVG 카드 응답 (GitHub camo는 200이 아닌 응답을 이미지로 보여주지 않으므로 오류 카드도 200으로 응답)
export function sendSvg(res: NextApiResponse, svg: string) {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.status(200).send(svg);
}
