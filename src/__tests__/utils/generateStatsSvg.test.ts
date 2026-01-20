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
    expect(result).toContain('200/1000');
    expect(result).toContain('20.00%');
    expect(result).toContain('5000');
  });

  it('특수 문자가 포함된 사용자 이름을 올바르게 처리해야 함', () => {
    const specialStats: Tstats = {
      nickname: 'test<user>',
      wargame_solved: 50,
      wargame_rank: '200/1000',
      wargameRankPercentage: '20.00',
      wargame_score: 5000
    };

    const result = generateStatsSvg(specialStats);
    
    // 특수 문자가 포함된 사용자 이름이 SVG에 포함되어 있는지 확인
    expect(result).toContain('test<user>');
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
}); 