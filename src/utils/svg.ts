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
