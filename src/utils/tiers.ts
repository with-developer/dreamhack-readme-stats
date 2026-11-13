import { Theme } from '../types';
import { themes } from './svg';

// Dreamhack 티어 계열 (문제 난이도와 CTF 티어가 같은 이름을 씀)
export type TTierClass =
  | 'unranked'
  | 'sprout'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'master'
  | 'grandmaster';

// 밝은 배경용은 진하게, 어두운 배경용은 밝게 (글자로도 쓰이므로 각 배경에서 읽히는 색)
const LIGHT: Record<TTierClass, string> = {
  unranked: '#94a3b8',
  sprout: '#3f9b4f',
  bronze: '#a8642f',
  silver: '#6b7f95',
  gold: '#c48a00',
  platinum: '#13a383',
  diamond: '#1f8ee6',
  master: '#9b45d9',
  grandmaster: '#d6336c',
};

const DARK: Record<TTierClass, string> = {
  unranked: '#7d8590',
  sprout: '#5cc26c',
  bronze: '#d08a55',
  silver: '#a3b5c8',
  gold: '#f0b429',
  platinum: '#3ad1ad',
  diamond: '#58b4ff',
  master: '#c27cf5',
  grandmaster: '#f06595',
};

// 테마의 scheme을 따름 (transparent는 README가 라이트일 수도 다크일 수도 있어 양쪽에서 읽히는 진한 쪽인 light)
export function tierColors(theme: Theme): Record<TTierClass, string> {
  return themes[theme].scheme === 'light' ? LIGHT : DARK;
}

export function tierColor(theme: Theme, tierClass: string): string {
  const colors = tierColors(theme);
  return Object.prototype.hasOwnProperty.call(colors, tierClass) ? colors[tierClass as TTierClass] : colors.unranked;
}

// 문제 난이도 숫자 → 계열과 짧은 표시 (예: 14 → Platinum 4 → 'P4')
// 0 Unrated, 1 Sprout, 2~5 Bronze 4~1, 6~9 Silver, 10~13 Gold, 14~17 Platinum, 18~21 Diamond, 22~25 Master 4~1
export function challengeTier(tier: number): { tierClass: TTierClass; short: string } {
  if (!tier || tier < 1) return { tierClass: 'unranked', short: '-' };
  if (tier === 1) return { tierClass: 'sprout', short: 'Sp' };
  const groups: [TTierClass, string, number][] = [
    ['bronze', 'B', 2],
    ['silver', 'S', 6],
    ['gold', 'G', 10],
    ['platinum', 'P', 14],
    ['diamond', 'D', 18],
    ['master', 'M', 22],
  ];
  for (const [tierClass, letter, start] of groups) {
    if (tier < start + 4) return { tierClass, short: `${letter}${4 - (tier - start)}` };
  }
  return { tierClass: 'master', short: 'M' };
}
