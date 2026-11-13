import { generateStatsSvg } from '../../utils/generateStatsSvg';
import { Tstats } from '../../types';
import { THEME_NAMES, themes } from '../../utils/svg';

describe('generateStatsSvg 유틸리티 함수 테스트', () => {
  const mockStats: Tstats = {
    nickname: 'testuser',
    wargame_solved: 50,
    wargame_rank: '200/1000',
    wargameRankPercentage: '20.00',
    wargame_score: 5000
  };

  it('유효한 통계 데이터로 SVG를 생성해야 함', () => {
    const result = generateStatsSvg(mockStats);
    
    // SVG 문자열이 반환되었는지 확인
    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
    
    // 사용자 데이터가 SVG에 포함되어 있는지 확인
    expect(result).toContain('testuser');
    expect(result).toContain('50');
    expect(result).toContain('200');
    expect(result).toContain('1000');
    expect(result).toContain('20.00%');
    expect(result).toContain('5000');
  });

  it('특수 문자가 포함된 사용자 이름을 이스케이프해 올바른 SVG를 만들어야 함', () => {
    for (const nickname of ['Try&Catch', 'DUck_<', 'test<user>', '<script>alert(1)</script>', 'system("/bin/sh")']) {
      const result = generateStatsSvg({ ...mockStats, nickname });

      // XML로 파싱되고, 닉네임이 태그가 아닌 텍스트로 들어가야 함
      const doc = new DOMParser().parseFromString(result.trim(), 'image/svg+xml');
      expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
      expect(doc.getElementsByTagName('script')).toHaveLength(0);
      // 긴 이름은 끝을 …로 줄이되, 줄인 앞부분도 이스케이프돼 그대로 보여야 함
      const shown = doc.querySelector('.user-name')?.textContent ?? '';
      expect(shown === nickname || (shown.endsWith('…') && nickname.startsWith(shown.slice(0, -1)))).toBe(true);
    }
  });

  it('긴 사용자 이름을 처리할 수 있어야 함', () => {
    const longNameStats: Tstats = {
      nickname: 'verylongusernamethatmightcauseissueswithsvgrendering',
      wargame_solved: 50,
      wargame_rank: '200/1000',
      wargameRankPercentage: '20.00',
      wargame_score: 5000
    };

    const result = generateStatsSvg(longNameStats);

    // 오른쪽 TOP 값과 겹치지 않도록 끝을 …로 줄임 (TOP 20.00% 기준 15칸)
    const doc = new DOMParser().parseFromString(result.trim(), 'image/svg+xml');
    expect(doc.querySelector('.user-name')?.textContent).toBe('verylonguserna…');
  });

  it('TOP 값과 겹치지 않는 닉네임은 줄이지 않아야 함 (지금 들어맞는 한글 이름 포함)', () => {
    for (const [nickname, pct] of [['weakness', '1.61'], ['세계정복이 꿈인 해커', '15.10'], ['dlakjdlaksjdjwi', '44.94']]) {
      const doc = new DOMParser().parseFromString(generateStatsSvg({ ...mockStats, nickname, wargameRankPercentage: pct }).trim(), 'image/svg+xml');
      expect(doc.querySelector('.user-name')?.textContent).toBe(nickname);
    }
  });

  it('TOP 값이 길수록 닉네임 자리가 줄어야 함', () => {
    const name = 'dlakjdlaksjdjwiooweflsd';
    const short = new DOMParser().parseFromString(generateStatsSvg({ ...mockStats, nickname: name, wargameRankPercentage: '1.6' }).trim(), 'image/svg+xml');
    const long = new DOMParser().parseFromString(generateStatsSvg({ ...mockStats, nickname: name, wargameRankPercentage: '100.00' }).trim(), 'image/svg+xml');
    expect(short.querySelector('.user-name')?.textContent?.length).toBeGreaterThan(long.querySelector('.user-name')?.textContent?.length ?? 0);
  });

  it('1위처럼 상위 %가 0.01% 미만이면 <0.01%로 표시해야 함', () => {
    const doc = new DOMParser().parseFromString(generateStatsSvg({ ...mockStats, nickname: 'top', wargameRankPercentage: '<0.01' }).trim(), 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('.top-value')?.textContent).toBe('<0.01%');
  });

  it('light 테마(기본)로 SVG를 생성해야 함', () => {
    const result = generateStatsSvg(mockStats);

    // light 테마 색상 확인
    expect(result).toContain('fill="#ffffff"'); // background
    expect(result).toContain('fill="#f8fafc"'); // cardBackground
    expect(result).toContain('stroke="#e2e8f0"'); // border
  });

  it('dark 테마로 SVG를 생성해야 함', () => {
    const result = generateStatsSvg(mockStats, 'dark');

    // dark 테마 색상 확인
    expect(result).toContain('fill="#0d1117"'); // background
    expect(result).toContain('fill="#21262d"'); // cardBackground
    expect(result).toContain('stroke="#30363d"'); // border
  });

  it('폰트를 외부에서 불러오지 않고 SVG에 임베드해야 함', () => {
    const result = generateStatsSvg(mockStats);

    // <img>로 렌더링되는 SVG는 외부 리소스(@import)를 불러올 수 없음
    expect(result).not.toContain('@import');
    expect(result).toContain("font-family: 'JetBrains Mono'");
    expect(result).toContain('url(data:font/woff2;base64,');
  });
}); 
describe('generateStatsSvg 테마 테스트', () => {
  const stats: Tstats = {
    nickname: 'testuser',
    wargame_solved: 50,
    wargame_rank: '200/1000',
    wargameRankPercentage: '20.00',
    wargame_score: 5000,
  };

  it('모든 테마에서 올바른 SVG를 만들고 테마 색을 써야 함', () => {
    for (const name of THEME_NAMES) {
      const result = generateStatsSvg(stats, name);
      const doc = new DOMParser().parseFromString(result.trim(), 'image/svg+xml');
      expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
      expect(result).toContain(`fill: ${themes[name].text}`);
    }
  });

  it('transparent 테마는 배경과 테두리를 그리지 않아야 함', () => {
    const result = generateStatsSvg(stats, 'transparent');
    expect(result).toContain('<rect width="390" height="190" fill="none"');
    expect(result).toContain('stroke="none"');
  });
});
