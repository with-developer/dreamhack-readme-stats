import { challengeTier, tierColor, tierColors } from '../../utils/tiers';

describe('challengeTier 함수 테스트', () => {
  it('Dreamhack 응답의 tier 숫자를 tier_display와 같은 짧은 표시로 바꿔야 함', () => {
    // 실제 응답에서 확인한 값: 4 Bronze 2, 11 Gold 3, 14 Platinum 4, 15 Platinum 3, 16 Platinum 2, 18 Diamond 4, 20 Diamond 2
    expect(challengeTier(4)).toEqual({ tierClass: 'bronze', short: 'B2' });
    expect(challengeTier(11)).toEqual({ tierClass: 'gold', short: 'G3' });
    expect(challengeTier(14)).toEqual({ tierClass: 'platinum', short: 'P4' });
    expect(challengeTier(15)).toEqual({ tierClass: 'platinum', short: 'P3' });
    expect(challengeTier(16)).toEqual({ tierClass: 'platinum', short: 'P2' });
    expect(challengeTier(18)).toEqual({ tierClass: 'diamond', short: 'D4' });
    expect(challengeTier(20)).toEqual({ tierClass: 'diamond', short: 'D2' });
  });

  it('구간 경계와 범위 밖 값을 처리해야 함', () => {
    expect(challengeTier(0)).toEqual({ tierClass: 'unranked', short: '-' });
    expect(challengeTier(-1).tierClass).toBe('unranked');
    expect(challengeTier(1)).toEqual({ tierClass: 'sprout', short: 'Sp' });
    expect(challengeTier(2).short).toBe('B4');
    expect(challengeTier(5).short).toBe('B1');
    expect(challengeTier(6).short).toBe('S4');
    expect(challengeTier(21).short).toBe('D1');
    // 실제 응답: 22 → Master 4
    expect(challengeTier(22)).toEqual({ tierClass: 'master', short: 'M4' });
    expect(challengeTier(25)).toEqual({ tierClass: 'master', short: 'M1' });
    expect(challengeTier(26)).toEqual({ tierClass: 'master', short: 'M' });
  });
});

describe('tierColor 함수 테스트', () => {
  it('밝은 배경 테마(light, transparent)는 진한 색, 어두운 테마는 밝은 색을 써야 함', () => {
    expect(tierColors('light')).toBe(tierColors('transparent'));
    expect(tierColors('dark')).toBe(tierColors('dracula'));
    expect(tierColor('light', 'gold')).not.toBe(tierColor('dark', 'gold'));
  });

  it('모르는 계열 이름은 unranked 색을 써야 함', () => {
    expect(tierColor('light', 'legend')).toBe(tierColors('light').unranked);
    expect(tierColor('light', 'constructor')).toBe(tierColors('light').unranked);
  });
});
