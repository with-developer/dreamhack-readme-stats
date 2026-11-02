import { generateErrorSvg, errorCards } from '../../utils/generateErrorSvg';

const parse = (svg: string) => new DOMParser().parseFromString(svg.trim(), 'image/svg+xml');

describe('generateErrorSvg 유틸리티 함수 테스트', () => {
  it('제목, 메시지, 상세 문구를 표시해야 함', () => {
    const doc = parse(generateErrorSvg(errorCards.userNotFound('Dreamhack Wargame Stats', 'miroo')));

    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('.title')?.textContent).toBe('Dreamhack Wargame Stats');
    expect(doc.querySelector('.message')?.textContent).toBe('User not found');
    expect(Array.from(doc.querySelectorAll('.detail')).map((el) => el.textContent)).toContain('Nickname: miroo');
  });

  it('닉네임을 이스케이프해 태그로 해석되지 않아야 함', () => {
    const svg = generateErrorSvg(errorCards.userNotFound('Dreamhack Wargame Stats', '<svg onload="alert(1)"/>&'));
    const doc = parse(svg);

    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(svg).not.toContain('<svg onload');
    expect(doc.querySelector('.detail')?.textContent).toBe('Nickname: <svg onload="alert(1)"/>&');
  });

  it('긴 닉네임은 잘라서 표시해야 함', () => {
    const doc = parse(generateErrorSvg(errorCards.userNotFound('Most Solved Categories', 'a'.repeat(100))));

    expect(doc.querySelector('.detail')?.textContent).toBe(`Nickname: ${'a'.repeat(27)}...`);
  });

  it('이모지 같은 서로게이트 쌍을 중간에서 자르지 않아야 함', () => {
    const doc = parse(generateErrorSvg(errorCards.userNotFound('Most Solved Categories', '🐿'.repeat(40))));

    expect(doc.querySelector('.detail')?.textContent).toBe(`Nickname: ${'🐿'.repeat(27)}...`);
  });

  it('다크 테마 색상을 적용해야 함', () => {
    const svg = generateErrorSvg(errorCards.fetchFailed('Dreamhack Wargame Stats'), 'dark');

    expect(svg).toContain('fill="#0d1117"');
    expect(svg).toContain('Failed to load stats');
  });

  it('username 파라미터가 없을 때의 안내 문구를 표시해야 함', () => {
    const doc = parse(generateErrorSvg(errorCards.missingUsername('Dreamhack Wargame Stats')));

    expect(doc.querySelector('.message')?.textContent).toBe('Missing username');
    expect(doc.querySelector('.detail')?.textContent).toBe('Add ?username=<nickname> to the card URL.');
  });
});
