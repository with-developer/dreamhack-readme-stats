import { escapeXml } from '../../utils/svg';

describe('escapeXml 함수 테스트', () => {
  it('XML 특수 문자를 이스케이프해야 함', () => {
    expect(escapeXml(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f');
  });

  it('이미 이스케이프된 문자열의 &도 다시 이스케이프해야 함', () => {
    expect(escapeXml('&amp;')).toBe('&amp;amp;');
  });

  it('XML에서 허용되지 않는 제어 문자를 제거해야 함', () => {
    expect(escapeXml('a\u0000b\u0008c\u001Fd')).toBe('abcd');
  });

  it('탭, 줄바꿈, 한글, 이모지는 그대로 두어야 함', () => {
    expect(escapeXml('꿈나라역1번출구\t🐿\n')).toBe('꿈나라역1번출구\t🐿\n');
  });

  it('숫자도 문자열로 변환해야 함', () => {
    expect(escapeXml(5000)).toBe('5000');
  });
});
