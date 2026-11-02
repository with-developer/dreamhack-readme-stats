import { generateStatsSvg } from '../../utils/generateStatsSvg';
import { Tstats } from '../../types';

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
      expect(doc.querySelector('.user-name')?.textContent).toBe(nickname);
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

    // 긴 사용자 이름이 SVG에 포함되어 있는지 확인
    expect(result).toContain('verylongusernamethatmightcauseissueswithsvgrendering');
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