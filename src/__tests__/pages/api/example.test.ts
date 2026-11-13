import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/example';
import { CARD_TYPES } from '../../../utils/cardCode';
import { THEME_NAMES } from '../../../utils/svg';
import { renderExampleCard, EXAMPLE_NICKNAME } from '../../../utils/exampleCards';

const call = (query: Record<string, unknown>) => {
  const { req, res } = createMocks({ method: 'GET', query });
  handler(req, res);
  return res;
};

describe('example API 엔드포인트 테스트', () => {
  it('고른 카드와 테마의 목업 카드를 하루 캐시로 돌려줘야 함', () => {
    const res = call({ card: 'ctf-graph', theme: 'dracula' });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getHeaders()).toHaveProperty('cache-control', 'public, max-age=86400, s-maxage=86400');
    expect(res._getData()).toBe(renderExampleCard('ctf-graph', 'dracula'));
  });

  it('모르는 카드·테마는 워게임 카드·light로 처리해야 함', () => {
    for (const query of [{}, { card: 'unknown', theme: 'neon' }, { card: ['ctf'], theme: ['dark'] }, { card: '__proto__' }]) {
      expect(call(query)._getData()).toBe(renderExampleCard('stats', 'light'));
    }
  });
});

describe('renderExampleCard 함수 테스트', () => {
  it('모든 카드·테마 조합이 예시 닉네임이 들어간 올바른 SVG여야 함', () => {
    for (const card of CARD_TYPES) {
      for (const theme of THEME_NAMES) {
        const svg = renderExampleCard(card, theme);
        const doc = new DOMParser().parseFromString(svg.trim(), 'image/svg+xml');
        expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
        // 분야 카드는 닉네임을 표시하지 않음
        if (!card.startsWith('most-solved')) expect(svg).toContain(EXAMPLE_NICKNAME);
      }
    }
  });

  it('같은 입력이면 항상 같은 SVG여야 함 (README 예시 파일을 다시 만들어도 바뀌지 않도록)', () => {
    expect(renderExampleCard('solves', 'nord')).toBe(renderExampleCard('solves', 'nord'));
  });
});
