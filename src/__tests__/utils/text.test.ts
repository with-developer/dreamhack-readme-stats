import { textWidth, truncateToWidth } from '../../utils/text';

describe('textWidth 함수 테스트', () => {
  it('영문·숫자는 한 칸, 한글·한자·전각·이모지는 두 칸으로 세야 함', () => {
    expect(textWidth('weakness')).toBe(8);
    expect(textWidth('동그람쥐')).toBe(8);
    expect(textWidth('漢字')).toBe(4);
    expect(textWidth('ＡＢ')).toBe(4);
    expect(textWidth('a🐿')).toBe(3);
    expect(textWidth('')).toBe(0);
  });
});

describe('truncateToWidth 함수 테스트', () => {
  it('폭 안에 들어가면 그대로 둬야 함', () => {
    expect(truncateToWidth('Chaining', 8)).toBe('Chaining');
    expect(truncateToWidth('동그람쥐', 8)).toBe('동그람쥐');
  });

  it('넘치면 …를 포함해 폭 안으로 줄여야 함', () => {
    expect(truncateToWidth('Rednose Airlines', 10)).toBe('Rednose A…');
    expect(textWidth(truncateToWidth('Rednose Airlines', 10))).toBe(10);
    // 한글은 두 칸이라 절반만 들어감
    expect(truncateToWidth('가나다라마바사', 8)).toBe('가나다…');
  });

  it('서로게이트 쌍(이모지)을 반으로 자르지 않아야 함', () => {
    const result = truncateToWidth('🐿🐿🐿🐿', 5);
    expect(result).toBe('🐿🐿…');
  });
});
