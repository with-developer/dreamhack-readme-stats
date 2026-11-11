import { buildCardUrl, buildHtmlCode, buildMarkdownCode, CARD_TYPES, normalizeSeason } from '../../utils/cardCode';

const BASE = 'https://dreamhack-readme-stats.vercel.app';

describe('buildCardUrl 함수 테스트', () => {
  it('기존 카드 주소는 예전 형식 그대로여야 함', () => {
    expect(buildCardUrl(BASE, { card: 'stats', theme: 'light', username: 'weakness' }))
      .toBe('https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=light');
    expect(buildCardUrl(BASE, { card: 'most-solved', theme: 'dark', username: 'p&p' }))
      .toBe('https://dreamhack-readme-stats.vercel.app/api/most-solved?username=p%26p&theme=dark');
    expect(buildCardUrl(BASE, { card: 'stats', theme: 'light', username: '' }))
      .toBe('https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=light');
  });

  it('새 카드는 고정 옵션을 붙이고, 시즌은 CTF 시즌 카드에만 올바른 값일 때 붙여야 함', () => {
    expect(buildCardUrl('', { card: 'most-solved-bars', theme: 'nord', username: 'weakness' }))
      .toBe('/api/most-solved?username=weakness&theme=nord&layout=bars');
    expect(buildCardUrl('', { card: 'ctf-graph', theme: 'light', username: 'weakness', season: ' 7 ' }))
      .toBe('/api/ctf?username=weakness&theme=light&view=graph&season=7');
    expect(buildCardUrl('', { card: 'ctf', theme: 'light', username: 'weakness', season: 'current' }))
      .toBe('/api/ctf?username=weakness&theme=light&season=current');
    expect(buildCardUrl('', { card: 'ctf', theme: 'light', username: 'weakness', season: 'abc' }))
      .toBe('/api/ctf?username=weakness&theme=light');
    expect(buildCardUrl('', { card: 'ctf-seasons', theme: 'light', username: 'weakness', season: '7' }))
      .toBe('/api/ctf?username=weakness&theme=light&view=seasons');
    expect(buildCardUrl('', { card: 'solves-hardest', theme: 'light', username: 'weakness', season: '7' }))
      .toBe('/api/solves?username=weakness&theme=light&sort=hardest');
    expect(buildCardUrl('', { card: 'level', theme: 'transparent', username: 'weakness' }))
      .toBe('/api/level?username=weakness&theme=transparent');
  });

  it('모든 카드 종류가 주소를 만들어야 함', () => {
    for (const card of CARD_TYPES) {
      expect(buildCardUrl('', { card, theme: 'light', username: 'weakness' })).toMatch(/^\/api\/[a-z-]+\?username=weakness&theme=light/);
    }
  });
});

describe('normalizeSeason 함수 테스트', () => {
  it('숫자와 current만 받아야 함', () => {
    expect(normalizeSeason('7')).toBe('7');
    expect(normalizeSeason(' current ')).toBe('current');
    for (const value of ['', '0', '07', '-1', '1000', 'Current', '7&view=graph']) {
      expect(normalizeSeason(value)).toBeNull();
    }
  });
});

describe('README 코드 생성 테스트', () => {
  it('기존 카드의 Markdown·HTML 코드는 예전과 같아야 함', () => {
    expect(buildMarkdownCode(BASE, { card: 'stats', theme: 'dark', username: 'weakness' }))
      .toBe('![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=dark)');
    expect(buildHtmlCode(BASE, { card: 'most-solved', theme: 'light', username: 'weakness' }, 'https://dreamhack.io/users/20691'))
      .toBe(`<a href="https://dreamhack.io/users/20691" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness&theme=light" alt="Dreamhack Category Chart" />
</a>`);
    expect(buildHtmlCode(BASE, { card: 'stats', theme: 'light', username: 'weakness' }, null))
      .toContain('href="https://dreamhack.io/users/사용자ID"');
  });

  it('auto 테마는 GitHub 테마에 따라 바뀌는 <picture> 코드를 만들어야 함', () => {
    expect(buildMarkdownCode(BASE, { card: 'ctf', theme: 'auto', username: 'weakness', season: '7' })).toBe(`<picture>
  <source media="(prefers-color-scheme: dark)" srcset="${BASE}/api/ctf?username=weakness&theme=dark&season=7" />
  <img src="${BASE}/api/ctf?username=weakness&theme=light&season=7" alt="Dreamhack CTF" />
</picture>`);
    expect(buildHtmlCode(BASE, { card: 'stats', theme: 'auto', username: 'weakness' }, null)).toBe(`<a href="https://dreamhack.io/users/사용자ID" target="_blank" rel="noopener noreferrer">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${BASE}/api/stats?username=weakness&theme=dark" />
    <img src="${BASE}/api/stats?username=weakness&theme=light" alt="Dreamhack Stats" />
  </picture>
</a>`);
  });
});
