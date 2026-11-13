import { generateLevelSvg, TLevelBadge } from '../../utils/generateLevelSvg';
import { THEME_NAMES } from '../../utils/svg';

const parse = (svg: string) => new DOMParser().parseFromString(svg.trim(), 'image/svg+xml');

const badge: TLevelBadge = {
  nickname: 'weakness',
  level: 17,
  exp: 545,
  expNeeded: 1230,
  contributionRank: 602,
  wargameTopPercentage: '1.60',
  achievement: 'Cloud 9',
};

describe('generateLevelSvg 함수 테스트', () => {
  it('레벨·닉네임·경험치·순위·대표 업적을 표시해야 함', () => {
    const svg = generateLevelSvg(badge);
    const doc = parse(svg);
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('.lv')?.textContent).toBe('Lv.17');
    expect(doc.querySelector('.nick')?.textContent).toBe('weakness');
    expect(doc.querySelector('.ach')?.textContent).toBe('Cloud 9');
    expect(svg).toContain('#602');
    expect(svg).toContain('TOP 1.60%');
    expect(svg).toContain('44% to Lv.18');
  });

  it('경험치 막대는 다음 레벨까지 비율만큼 채워야 함', () => {
    const doc = parse(generateLevelSvg(badge));
    const bars = Array.from(doc.querySelectorAll('rect[height="6"]'));
    expect(bars).toHaveLength(2);
    expect(Number(bars[1].getAttribute('width'))).toBeCloseTo(304 * (545 / 1230), 0);
  });

  it('대표 업적·순위가 없으면 해당 부분을 그리지 않아야 함', () => {
    const svg = generateLevelSvg({ ...badge, achievement: null, contributionRank: null, wargameTopPercentage: null });
    const doc = parse(svg);
    expect(doc.querySelector('.ach')).toBeNull();
    expect(svg).not.toContain('Contrib.');
    expect(svg).not.toContain('Wargame');
  });

  it('필요 경험치가 0이면 막대를 채우지 않고 비율 문구도 빼야 함', () => {
    const svg = generateLevelSvg({ ...badge, exp: 0, expNeeded: 0 });
    expect(parse(svg).querySelectorAll('rect[height="6"]')).toHaveLength(1);
    expect(svg).not.toContain('to Lv.');
  });

  it('특수문자·긴 한글 닉네임과 업적 이름을 이스케이프하고 폭에 맞게 줄여야 함', () => {
    const doc = parse(generateLevelSvg({
      ...badge,
      nickname: '<script>가나다라마바사아자차카타파하</script>',
      achievement: '아주아주아주아주긴업적이름&<>',
    }));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.getElementsByTagName('script')).toHaveLength(0);
    expect(doc.querySelector('.nick')?.textContent?.endsWith('…')).toBe(true);
    expect(doc.querySelector('.ach')?.textContent?.endsWith('…')).toBe(true);
  });

  it('레벨이 세 자리면 닉네임을 오른쪽으로 밀어 겹치지 않게 해야 함', () => {
    const two = parse(generateLevelSvg(badge)).querySelector('.nick')?.getAttribute('x');
    const three = parse(generateLevelSvg({ ...badge, level: 100 })).querySelector('.nick')?.getAttribute('x');
    expect(Number(three)).toBeGreaterThan(Number(two));
  });

  it('모든 테마에서 올바른 SVG를 만들어야 함', () => {
    for (const theme of THEME_NAMES) {
      expect(parse(generateLevelSvg(badge, theme)).getElementsByTagName('parsererror')).toHaveLength(0);
    }
  });
});
