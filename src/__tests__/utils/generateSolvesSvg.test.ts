import { generateSolvesSvg } from '../../utils/generateSolvesSvg';
import { TSolveRecord } from '../../types';
import { THEME_NAMES } from '../../utils/svg';

const parse = (svg: string) => new DOMParser().parseFromString(svg.trim(), 'image/svg+xml');

const solves: TSolveRecord[] = [
  { title: 'Chaining', tier: 14, tags: ['reversing'], solvedAt: '2024-08-13T22:50:06.610753+09:00', solvers: 103 },
  { title: 'Simple Login', tier: 11, tags: ['web'], solvedAt: '2024-07-10T14:33:46+09:00', solvers: 284 },
  { title: 'Dream DRM', tier: 18, tags: ['web', 'reversing'], solvedAt: '2024-06-07T18:10:44+09:00', solvers: 102 },
  { title: 'ICM2022', tier: 4, tags: ['crypto'], solvedAt: '2024-03-08T08:30:37+09:00', solvers: 437 },
  { title: "Santa's workshop", tier: 16, tags: ['web'], solvedAt: '2024-02-27T18:06:35+09:00', solvers: 93 },
  { title: 'Sixth', tier: 1, tags: [], solvedAt: '2024-01-01T00:00:00+09:00', solvers: 1 },
];

const texts = (doc: Document, selector: string) => Array.from(doc.querySelectorAll(selector)).map((el) => el.textContent);

describe('generateSolvesSvg 함수 테스트', () => {
  it('최근 풀이 카드는 문제 5개를 난이도·이름·분야·푼 날짜와 함께 보여줘야 함', () => {
    const doc = parse(generateSolvesSvg('recent', 'weakness', solves));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.querySelector('.title')?.textContent).toBe('Recent Solves');
    expect(doc.querySelector('.nickname')?.textContent).toBe('weakness');
    expect(texts(doc, '.pill')).toEqual(['P4', 'G3', 'D4', 'B2', 'P2']);
    expect(texts(doc, '.challenge')).toEqual(['Chaining', 'Simple Login', 'Dream DRM', 'ICM2022', "Santa's workshop"]);
    expect(texts(doc, '.tag')).toEqual(['rev', 'web', 'web/rev', 'crypto', 'web']);
    // 날짜는 응답의 한국 시간 그대로 (UTC로 바꾸면 하루가 밀릴 수 있음)
    expect(texts(doc, '.right')).toEqual(['2024-08-13', '2024-07-10', '2024-06-07', '2024-03-08', '2024-02-27']);
  });

  it('가장 어려운 풀이 카드는 날짜 대신 푼 사람 수를 보여줘야 함', () => {
    const doc = parse(generateSolvesSvg('hardest', 'weakness', solves));
    expect(doc.querySelector('.title')?.textContent).toBe('Hardest Solves');
    expect(texts(doc, '.right')[0]).toBe('103 solvers');
  });

  it('긴 문제 이름·한글 이름은 폭에 맞게 줄이고 특수문자는 이스케이프해야 함', () => {
    const doc = parse(generateSolvesSvg('recent', '<b>닉네임</b>', [
      { title: 'A very long challenge title that overflows', tier: 0, tags: ['forensics', 'misc', 'web'], solvedAt: '', solvers: 0 },
      { title: '한글로된아주긴문제이름입니다', tier: 22, tags: ['web3'], solvedAt: '2024-01-01', solvers: 5 },
      { title: '</text><script>x</script>', tier: 3, tags: [], solvedAt: '2024-01-01', solvers: 5 },
    ]));
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect(doc.getElementsByTagName('script')).toHaveLength(0);
    expect(texts(doc, '.challenge')[0]).toBe('A very long challenge…');
    expect(texts(doc, '.challenge')[1]).toBe('한글로된아주긴문제이…');
    expect(texts(doc, '.challenge')[2]).toBe('</text><script>x</scr…');
    expect(texts(doc, '.tag')[0]).toBe('forensic…');
    expect(texts(doc, '.pill')).toEqual(['-', 'M', 'B3']);
    expect(doc.querySelector('.nickname')?.textContent).toBe('<b>닉네임</b>');
  });

  it('푼 문제가 없으면 안내 문구를 보여줘야 함', () => {
    const svg = generateSolvesSvg('recent', 'newbie', []);
    expect(svg).toContain('No solved challenges yet');
  });

  it('모든 테마에서 올바른 SVG를 만들어야 함', () => {
    for (const theme of THEME_NAMES) {
      expect(parse(generateSolvesSvg('recent', 'weakness', solves, theme)).getElementsByTagName('parsererror')).toHaveLength(0);
    }
  });
});
