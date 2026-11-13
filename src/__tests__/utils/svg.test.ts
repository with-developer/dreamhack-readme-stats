import { escapeXml, parseTheme, THEME_NAMES, themes } from '../../utils/svg';

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

describe('parseTheme 함수 테스트', () => {
  it('지원하는 테마 이름은 그대로 돌려줘야 함', () => {
    for (const name of THEME_NAMES) {
      expect(parseTheme(name)).toBe(name);
    }
  });

  it('모르는 값, 빈 값, 배열, Object 내장 속성 이름은 light로 처리해야 함', () => {
    for (const value of [undefined, '', 'Dark', 'solarized', ['dark'], '__proto__', 'constructor', 'toString']) {
      expect(parseTheme(value)).toBe('light');
    }
  });

  it('모든 테마가 같은 색 항목을 가져야 함', () => {
    const keys = Object.keys(themes.light).sort();
    for (const name of THEME_NAMES) {
      expect(Object.keys(themes[name]).sort()).toEqual(keys);
    }
  });
});
