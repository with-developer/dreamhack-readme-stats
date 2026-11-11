import { generateCategoryBarsSvg } from '../../utils/generateCategoryBarsSvg';
import { TCategoryStats } from '../../types';
import { THEME_NAMES } from '../../utils/svg';

const parse = (svg: string) => new DOMParser().parseFromString(svg.trim(), 'image/svg+xml');

const stats: TCategoryStats = {
  nickname: 'weakness',
  total_score: 4835,
  categories: [
    { name: 'web', score: 3309, rank: 239, solved_cnt: 87, color: '#ff6b6b' },
    { name: 'reversing', score: 991, rank: 609, solved_cnt: 21, color: '#51cf66' },
    { name: 'others', score: 632, rank: 420, solved_cnt: 18, color: '#a78bfa' },
    { name: 'crypto', score: 365, rank: 726, solved_cnt: 13, color: '#fcc419' },
    { name: 'pwnable', score: 0, rank: 24249, solved_cnt: 0, color: '#339af0' },
  ],
};

describe('generateCategoryBarsSvg 함수 테스트', () => {
  it('분야별 이름·점수·푼 문제 수·순위와 총점을 표시해야 함', () => {
    const doc = parse(generateCategoryBarsSvg(stats));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);

    const names = Array.from(doc.querySelectorAll('.cat')).map((el) => el.textContent);
    expect(names).toEqual(['Web', 'Reversing', 'Others', 'Crypto', 'Pwnable']);
    const nums = Array.from(doc.querySelectorAll('.num')).map((el) => el.textContent);
    expect(nums.slice(0, 2)).toEqual(['3309', '87']);
    const ranks = Array.from(doc.querySelectorAll('.rank')).map((el) => el.textContent);
    expect(ranks).toEqual(['#239', '#609', '#420', '#726', '-']);
    expect(doc.querySelector('.total-value')?.textContent).toBe('4835');
  });

  it('막대 길이는 가장 높은 점수를 기준으로 하고, 0점 분야는 막대를 그리지 않아야 함', () => {
    const doc = parse(generateCategoryBarsSvg(stats));
    const fills = Array.from(doc.querySelectorAll('rect[height="8"]')).filter((el) => el.getAttribute('fill') !== '#e2e8f0');
    expect(fills.map((el) => el.getAttribute('width'))).toEqual(['140.0', '41.9', '26.7', '15.4']);
  });

  it('분야가 없으면 안내 문구를 보여줘야 함', () => {
    const result = generateCategoryBarsSvg({ nickname: 'x', total_score: 0, categories: [] });
    expect(result).toContain('No category data');
  });

  it('푼 문제 수가 없는 응답이면 -로 표시하고, 긴 분야 이름은 줄여야 함', () => {
    const doc = parse(generateCategoryBarsSvg({
      nickname: 'x',
      total_score: 10,
      categories: [{ name: 'verylongcategoryname&<', score: 10, rank: 3, color: '#000' }],
    }));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('.cat')?.textContent).toBe('Verylongc…');
    expect(Array.from(doc.querySelectorAll('.num')).map((el) => el.textContent)).toEqual(['10', '-']);
  });

  it('모든 테마에서 올바른 SVG를 만들어야 함', () => {
    for (const theme of THEME_NAMES) {
      expect(parse(generateCategoryBarsSvg(stats, theme)).getElementsByTagName('parsererror')).toHaveLength(0);
    }
  });
});
