import { generateCategorySvg } from '../../utils/generateCategorySvg';
import { TCategoryStats } from '../../types';

describe('generateCategorySvg 유틸리티 함수 테스트', () => {
  it('유효한 카테고리 데이터로 SVG를 생성해야 함', () => {
    const mockStats: TCategoryStats = {
      nickname: 'weakness',
      total_score: 5000,
      categories: [
        { name: 'web', score: 2000, rank: 50, color: '#ff6b6b' },
        { name: 'pwnable', score: 1500, rank: 100, color: '#339af0' },
        { name: 'reversing', score: 1000, rank: 150, color: '#51cf66' },
        { name: 'crypto', score: 500, rank: 200, color: '#fcc419' }
      ]
    };

    const result = generateCategorySvg(mockStats);
    
    // SVG 문자열이 반환되었는지 확인
    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
    
    // 카테고리 데이터가 SVG에 포함되어 있는지 확인
    expect(result).toContain('web: 2000');
    expect(result).toContain('pwnable: 1500');
    expect(result).toContain('reversing: 1000');
    expect(result).toContain('crypto: 500');
    
    // 색상이 적용되었는지 확인
    expect(result).toContain('fill="#ff6b6b"');
    expect(result).toContain('fill="#339af0"');
    
    // 총점이 표시되는지 확인
    expect(result).toContain('5000');
    
    // 제목이 포함되어 있는지 확인
    expect(result).toContain('Most solved categories');
  });

  it('카테고리가 없는 경우 "No data"가 표시되어야 함', () => {
    const mockStats: TCategoryStats = {
      nickname: 'weakness',
      total_score: 0,
      categories: []
    };

    const result = generateCategorySvg(mockStats);
    
    // "No data" 메시지가 포함되어 있는지 확인
    expect(result).toContain('No data');
    expect(result).toContain('No category data');
  });

  it('많은 카테고리가 있을 때 상위 5개만 범례에 표시되어야 함', () => {
    const mockStats: TCategoryStats = {
      nickname: 'weakness',
      total_score: 10000,
      categories: [
        { name: 'web', score: 3000, rank: 50, color: '#ff6b6b' },
        { name: 'pwnable', score: 2500, rank: 100, color: '#339af0' },
        { name: 'reversing', score: 2000, rank: 150, color: '#51cf66' },
        { name: 'crypto', score: 1500, rank: 200, color: '#fcc419' },
        { name: 'forensic', score: 1000, rank: 250, color: '#cc5de8' },
        { name: 'misc', score: 500, rank: 300, color: '#20c997' }
      ]
    };

    const result = generateCategorySvg(mockStats);
    
    // 상위 5개 카테고리는 범례에 표시되어야 함
    expect(result).toContain('web: 3000');
    expect(result).toContain('pwnable: 2500');
    expect(result).toContain('reversing: 2000');
    expect(result).toContain('crypto: 1500');
    expect(result).toContain('forensic: 1000');
    
    // 6번째 카테고리인 misc는 범례에 없어야 함
    expect(result).not.toContain('misc: 500');
  });

  it('매우 작은 카테고리(<5%)는 퍼센트 라벨이 표시되지 않아야 함', () => {
    const mockStats: TCategoryStats = {
      nickname: 'weakness',
      total_score: 10000,
      categories: [
        { name: 'web', score: 9600, rank: 50, color: '#ff6b6b' }, // 96%
        { name: 'misc', score: 400, rank: 300, color: '#20c997' }  // 4% (5% 미만이므로 표시되지 않아야 함)
      ]
    };

    const result = generateCategorySvg(mockStats);
    
    // 퍼센트 라벨 확인 (4%는 표시되지 않아야 함)
    const percentLabels = result.match(/class="percentage-label">(.*?)%</g) || [];
    
    // 96%만 표시되어야 함
    expect(percentLabels.length).toBe(1);
    expect(percentLabels[0]).toContain('96%');
  });
}); 