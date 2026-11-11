import {
  ctfTierGroup,
  ctfTierShort,
  generateCtfEmptySvg,
  generateCtfGraphSvg,
  generateCtfHistorySvg,
  generateCtfSeasonSvg,
} from '../../utils/generateCtfSvg';
import { TCtfSeasonResult } from '../../types';
import { THEME_NAMES } from '../../utils/svg';

const parse = (svg: string) => new DOMParser().parseFromString(svg.trim(), 'image/svg+xml');
const ok = (svg: string) => parse(svg).getElementsByTagName('parsererror').length === 0;

const live: TCtfSeasonResult = {
  season: 8,
  tier: 'Diamond I',
  tierClass: 'diamond',
  rating: 2302,
  rank: 1,
  participants: 1231,
  contests: 6,
  rounds: [
    { round: 1, rating: 1605, rank: 5 },
    { round: 2, rating: 1914, rank: 3 },
    { round: 3, rating: 2014, rank: 16 },
    { round: 4, rating: 2130, rank: 5 },
    { round: 5, rating: 2238, rank: 3 },
    { round: 6, rating: 2302, rank: 5 },
  ],
};

const finished: TCtfSeasonResult = {
  season: 7,
  tier: 'Platinum II',
  tierClass: 'platinum',
  rating: 1964,
  rank: 29,
  participants: 4146,
  contests: 10,
  rounds: [
    { round: 1, rating: 1588, rank: 8 },
    { round: 9, rating: 2045, rank: 21 },
    { round: 23, rating: 1964, rank: 21 },
  ],
};

describe('CTF 티어 도우미 테스트', () => {
  it('레이팅으로 티어 구간을 찾아야 함 (Dreamhack 구간 경계)', () => {
    expect(ctfTierGroup(899).name).toBe('Unranked');
    expect(ctfTierGroup(900).name).toBe('Bronze');
    expect(ctfTierGroup(1500).name).toBe('Gold');
    expect(ctfTierGroup(2399).name).toBe('Diamond');
    expect(ctfTierGroup(2400).name).toBe('Master');
    expect(ctfTierGroup(9999).name).toBe('Grandmaster');
    expect(ctfTierGroup(-5).name).toBe('Unranked');
  });

  it('티어 이름을 짧은 표시로 바꿔야 함', () => {
    expect(ctfTierShort('Silver I')).toBe('S1');
    expect(ctfTierShort('Gold III')).toBe('G3');
    expect(ctfTierShort('Master')).toBe('M');
    expect(ctfTierShort('Grandmaster')).toBe('GM');
    expect(ctfTierShort('Legend X')).toBe('L');
  });
});

describe('generateCtfSeasonSvg 함수 테스트', () => {
  it('진행 중인 시즌은 ONGOING과 다음 티어까지 남은 점수를 보여줘야 함', () => {
    const svg = generateCtfSeasonSvg('player', live, true);
    expect(ok(svg)).toBe(true);
    expect(svg).toContain('Dreamhack CTF Season 8');
    expect(svg).toContain('ONGOING');
    expect(svg).toContain('Diamond I');
    expect(svg).toContain('98 to');
    expect(svg).toContain('Master');
    expect(svg).toContain('0.08%');
    expect(parse(svg).querySelector('.name')?.textContent).toBe('player');
  });

  it('끝난 시즌은 FINAL과 시즌 중 최고 레이팅을 보여줘야 함', () => {
    const svg = generateCtfSeasonSvg('player', finished, false);
    expect(svg).toContain('FINAL');
    expect(svg).toContain('Peak');
    expect(svg).toContain('2045');
    expect(svg).toContain('0.70%');
    expect(svg).not.toContain(' to ');
  });

  it('최고 레이팅이 시즌 결과와 같으면 Season final로 표시해야 함', () => {
    const svg = generateCtfSeasonSvg('player', { ...finished, rounds: [{ round: 1, rating: 1900, rank: 1 }] }, false);
    expect(svg).toContain('Season final');
  });

  it('순위·참가자 수가 없으면 -로 표시해야 함', () => {
    const svg = generateCtfSeasonSvg('player', { ...finished, rank: 0, participants: 0 }, false);
    expect(parse(svg).querySelectorAll('.value')[0].textContent).toBe('-');
    expect(parse(svg).querySelector('.accent')?.textContent).toBe('-');
  });

  it('티어 막대를 III·II·I 세 칸으로 나누고 구간 안 위치만큼 채워야 함', () => {
    const doc = parse(generateCtfSeasonSvg('player', live, true));
    const bars = Array.from(doc.querySelectorAll('rect[height="7"]'));
    // 바탕, 채움, 구분선 2개
    expect(bars).toHaveLength(4);
    expect(Number(bars[1].getAttribute('width'))).toBeCloseTo(350 * (202 / 300), 0);
  });

  it('긴 닉네임은 오른쪽 티어와 겹치지 않게 줄이고 특수문자는 이스케이프해야 함', () => {
    const doc = parse(generateCtfSeasonSvg('<script>verylongnickname</script>', finished, false));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.getElementsByTagName('script')).toHaveLength(0);
    expect(doc.querySelector('.name')?.textContent?.endsWith('…')).toBe(true);
  });
});

describe('generateCtfGraphSvg 함수 테스트', () => {
  it('대회별 레이팅을 선으로 잇고 3등 안에 든 대회에 등수를 표시해야 함', () => {
    const doc = parse(generateCtfGraphSvg('player', live, true));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('polyline')?.getAttribute('points')?.split(' ')).toHaveLength(6);
    expect(Array.from(doc.querySelectorAll('.podium')).map((el) => el.textContent)).toEqual(['#3', '#3']);
    expect(doc.querySelector('.end')?.textContent).toBe('2302');
    expect(doc.querySelector('line[stroke-dasharray]')).toBeNull();
  });

  it('시즌 결과가 마지막 대회 레이팅과 다르면 결과까지 점선으로 이어야 함', () => {
    const adjusted = { ...finished, rating: 2000 };
    const doc = parse(generateCtfGraphSvg('player', adjusted, false));
    expect(doc.querySelector('line[stroke-dasharray]')).not.toBeNull();
    expect(doc.querySelector('.end')?.textContent).toBe('2000');
  });

  it('대회 기록이 없는 시즌은 기본형으로 그려야 함', () => {
    const svg = generateCtfGraphSvg('player', { ...finished, rounds: [], contests: 0 }, false);
    expect(svg).toContain('Season Rank');
    expect(svg).not.toContain('<polyline');
  });

  it('대회가 하나뿐이면 점 하나짜리 그래프 대신 기본형으로 그려야 함', () => {
    const svg = generateCtfGraphSvg('player', { ...finished, rating: 1588, rounds: [{ round: 1, rating: 1588, rank: 8 }] }, false);
    expect(svg).toContain('Season Rank');
    expect(svg).not.toContain('<polyline');
  });

  it('대회가 하나여도 시즌 마감 보정이 있으면 두 점을 이어 그래프로 그려야 함', () => {
    const doc = parse(generateCtfGraphSvg('player', { ...finished, rating: 1600, rounds: [{ round: 1, rating: 1583, rank: 8 }] }, false));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('line[stroke-dasharray]')).not.toBeNull();
  });
});

describe('generateCtfHistorySvg 함수 테스트', () => {
  const seasons = [
    { season: 1, tier: 'Silver III', tierClass: 'silver', rating: 1250 },
    { season: 2, tier: 'Gold II', tierClass: 'gold', rating: 1606 },
    { season: 4, tier: 'Gold III', tierClass: 'gold', rating: 1590 },
    { season: 5, tier: 'Gold II', tierClass: 'gold', rating: 1635 },
  ];

  it('시즌마다 끝났을 때 티어를 표시하고 진행 중인 시즌은 *와 점선으로 표시해야 함', () => {
    const doc = parse(generateCtfHistorySvg('player', [...seasons, { season: 8, tier: 'Diamond I', tierClass: 'diamond', rating: 2302, live: true }]));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(Array.from(doc.querySelectorAll('.tier-pill')).map((el) => el.textContent)).toEqual(['S3', 'G2', 'G3', 'G2', 'D1']);
    expect(Array.from(doc.querySelectorAll('.season')).map((el) => el.textContent)).toEqual([
      'Season 1', 'Season 2', 'Season 4', 'Season 5', 'Season 8*',
    ]);
    expect(doc.querySelector('line[stroke-dasharray]')).not.toBeNull();
    expect(doc.querySelector('.note')?.textContent).toBe('* ongoing');
  });

  it('최근 6개 시즌만 그려야 함', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({ season: i + 1, tier: 'Gold I', tierClass: 'gold', rating: 1700 }));
    const doc = parse(generateCtfHistorySvg('player', many));
    expect(Array.from(doc.querySelectorAll('.season')).map((el) => el.textContent)[0]).toBe('Season 3');
    expect(doc.querySelectorAll('.season')).toHaveLength(6);
  });

  it('시즌이 하나뿐이어도 올바른 SVG를 만들어야 함', () => {
    expect(ok(generateCtfHistorySvg('player', [seasons[0]]))).toBe(true);
  });
});

describe('generateCtfEmptySvg 함수 테스트', () => {
  it('CTF 기록이 아예 없으면 참가 안내를 보여줘야 함', () => {
    const svg = generateCtfEmptySvg('player', null, false, null);
    expect(svg).toContain('No CTF record yet');
    expect(svg).toContain('Join a Dreamhack CTF');
    expect(svg).not.toContain('ONGOING');
  });

  it('이번 시즌에 참가하지 않았으면 마지막으로 참가한 시즌을 함께 보여줘야 함', () => {
    const svg = generateCtfEmptySvg('player', 8, true, { season: 7, tier: 'Gold II', tierClass: 'gold', rating: 1600 });
    expect(svg).toContain('No Season 8 contests yet');
    expect(svg).toContain('Last played: Season 7');
    expect(svg).toContain('ONGOING');
  });

  it('지난 시즌에 결과가 없으면 기록 없음으로 표시해야 함', () => {
    expect(generateCtfEmptySvg('player', 3, false, null)).toContain('No Season 3 record');
  });
});

describe('CTF 카드 테마 테스트', () => {
  it('모든 테마에서 네 가지 카드가 올바른 SVG여야 함', () => {
    for (const theme of THEME_NAMES) {
      expect(ok(generateCtfSeasonSvg('player', live, true, theme))).toBe(true);
      expect(ok(generateCtfGraphSvg('player', finished, false, theme))).toBe(true);
      expect(ok(generateCtfHistorySvg('player', [{ season: 1, tier: 'Gold I', tierClass: 'gold', rating: 1700 }], theme))).toBe(true);
      expect(ok(generateCtfEmptySvg('player', 8, true, null, theme))).toBe(true);
    }
  });
});
