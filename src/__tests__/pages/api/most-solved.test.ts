import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/most-solved';
import * as dreamhackUtils from '../../../utils/dreamhack';
import * as generateCategorySvgUtils from '../../../utils/generateCategorySvg';
import * as generateCategoryBarsSvgUtils from '../../../utils/generateCategoryBarsSvg';
import { TuserData } from '../../../types';

// dreamhack 유틸리티 함수 모킹
jest.mock('../../../utils/dreamhack', () => ({
  getUserId: jest.fn(),
  getUserData: jest.fn(),
}));

// generateCategorySvg 유틸리티 함수 모킹
jest.mock('../../../utils/generateCategorySvg', () => ({
  generateCategorySvg: jest.fn(),
}));

// 막대형 생성기는 실제 함수를 감시만 함
jest.mock('../../../utils/generateCategoryBarsSvg', () => ({
  generateCategoryBarsSvg: jest.fn(() => '<svg>Mock Bars SVG</svg>'),
}));

describe('most-solved API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('유효한 사용자 이름으로 카테고리 SVG를 반환해야 함', async () => {
    // 모킹된 데이터 설정
    const mockUserId = 20691;
    const mockUserData: TuserData = {
      nickname: 'weakness',
      contributions: { level: 1, rank: 100 },
      exp: 1000,
      total_wargame: 50,
      wargame: { 
        solved: 50, 
        rank: 200, 
        score: 5000,
        category: {
          web: { score: 2000, rank: 100 },
          pwnable: { score: 1500, rank: 150 },
          reversing: { score: 1000, rank: 200 },
          crypto: { score: 500, rank: 250 }
        }
      },
      ctf: { rank: 300, tier: 'Gold', rating: 2000 },
      profile_image: 'image.jpg'
    };
    const mockSvg = '<svg>Mock Category SVG</svg>';

    // 모킹된 함수 구현
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce(mockUserData);
    (generateCategorySvgUtils.generateCategorySvg as jest.Mock).mockReturnValueOnce(mockSvg);

    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'weakness',
      },
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getHeaders()).toHaveProperty('cache-control', 'no-cache, no-store, must-revalidate');
    expect(res._getData()).toBe(mockSvg);

    // 모킹된 함수 호출 검증
    expect(dreamhackUtils.getUserId).toHaveBeenCalledWith('weakness');
    expect(dreamhackUtils.getUserData).toHaveBeenCalledWith(mockUserId, 'weakness');
    
    // generateCategorySvg 호출 인자 검증
    const generateSvgArg = (generateCategorySvgUtils.generateCategorySvg as jest.Mock).mock.calls[0][0];
    expect(generateSvgArg).toHaveProperty('nickname', 'weakness');
    expect(generateSvgArg).toHaveProperty('total_score', 5000);
    expect(generateSvgArg.categories).toHaveLength(4);
    
    // 카테고리가 점수 순으로 정렬되었는지 확인
    expect(generateSvgArg.categories[0].name).toBe('web');
    expect(generateSvgArg.categories[0].score).toBe(2000);
    expect(generateSvgArg.categories[1].name).toBe('pwnable');
    expect(generateSvgArg.categories[2].name).toBe('reversing');
    expect(generateSvgArg.categories[3].name).toBe('crypto');
  });

  it('카테고리가 없는 사용자에 대해 빈 카테고리 SVG를 반환해야 함', async () => {
    // 모킹된 데이터 설정 (category 없음)
    const mockUserId = 20691;
    const mockUserData: TuserData = {
      nickname: 'weakness',
      contributions: { level: 1, rank: 500 },
      exp: 500,
      total_wargame: 10,
      wargame: { 
        solved: 10, 
        rank: 500, 
        score: 1000
        // category 필드 없음
      },
      ctf: { rank: 600, tier: 'Silver', rating: 1000 },
      profile_image: 'image.jpg'
    };
    const mockSvg = '<svg>Empty Category SVG</svg>';

    // 모킹된 함수 구현
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce(mockUserData);
    (generateCategorySvgUtils.generateCategorySvg as jest.Mock).mockReturnValueOnce(mockSvg);

    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'weakness',
      },
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toBe(mockSvg);

    // generateCategorySvg 호출 인자 검증
    const generateSvgArg = (generateCategorySvgUtils.generateCategorySvg as jest.Mock).mock.calls[0][0];
    expect(generateSvgArg).toHaveProperty('nickname', 'weakness');
    expect(generateSvgArg).toHaveProperty('total_score', 1000);
    expect(generateSvgArg.categories).toHaveLength(0);
  });

  it('사용자 이름이 없을 때 안내 카드를 반환해야 함', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getHeaders()).toHaveProperty('cache-control', 'no-cache, no-store, must-revalidate');
    expect(res._getData()).toContain('Most Solved Categories');
    expect(res._getData()).toContain('Missing username');
  });

  it('사용자를 찾을 수 없을 때 안내 카드를 반환해야 함', async () => {
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'nonexistentuser',
        theme: 'dark',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getHeaders()).toHaveProperty('cache-control', 'no-cache, no-store, must-revalidate');
    expect(res._getData()).toContain('User not found');
    expect(res._getData()).toContain('nonexistentuser');
    // 다크 테마 배경색 적용
    expect(res._getData()).toContain('#0d1117');
  });

  it('사용자 데이터를 가져올 수 없을 때 오류 카드를 반환해야 함', async () => {
    const username = 'weakness';
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(123);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getHeaders()).toHaveProperty('cache-control', 'no-cache, no-store, must-revalidate');
    expect(res._getData()).toContain('Failed to load stats');
    expect(dreamhackUtils.getUserData).toHaveBeenCalledWith(123, username);
  });

  it('예외 발생 시 오류 카드를 반환해야 함', async () => {
    (dreamhackUtils.getUserId as jest.Mock).mockRejectedValueOnce(new Error('테스트 에러'));

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'weakness',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getHeaders()).toHaveProperty('cache-control', 'no-cache, no-store, must-revalidate');
    expect(res._getData()).toContain('Failed to load stats');
  });
}); 
describe('most-solved API 막대형 레이아웃 (layout=bars)', () => {
  const userData: TuserData = {
    nickname: 'weakness',
    contributions: { level: 1, rank: 100 },
    exp: 1000,
    total_wargame: 50,
    wargame: {
      solved: 50,
      rank: 200,
      score: 4000,
      category: {
        web: { score: 3000, rank: 100, solved_cnt: 80 },
        others: { score: 600, rank: 400, solved_cnt: 10 },
        crypto: { score: 400, rank: 500, solved_cnt: 5 },
      },
    },
    ctf: { rank: 300, tier: 'Gold', rating: 2000 },
    profile_image: 'image.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValue(20691);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValue(userData);
  });

  it('layout=bars면 막대형 생성기에 푼 문제 수와 함께 점수 순으로 넘겨야 함', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { username: 'weakness', layout: 'bars', theme: 'nord' } });
    await handler(req, res);

    expect(res._getData()).toBe('<svg>Mock Bars SVG</svg>');
    expect(generateCategorySvgUtils.generateCategorySvg).not.toHaveBeenCalled();
    const [stats, theme] = (generateCategoryBarsSvgUtils.generateCategoryBarsSvg as jest.Mock).mock.calls[0];
    expect(theme).toBe('nord');
    expect(stats.categories.map((c: { name: string }) => c.name)).toEqual(['web', 'others', 'crypto']);
    expect(stats.categories[0]).toMatchObject({ score: 3000, rank: 100, solved_cnt: 80, color: '#ff6b6b' });
    // 막대형에서만 Others를 보라색으로
    expect(stats.categories[1].color).toBe('#a78bfa');
  });

  it('layout이 없거나 모르는 값이면 기존 원형 차트를 써야 하고 Others 색도 그대로여야 함', async () => {
    for (const layout of [undefined, 'pie', 'BARS']) {
      jest.clearAllMocks();
      (generateCategorySvgUtils.generateCategorySvg as jest.Mock).mockReturnValueOnce('<svg>pie</svg>');
      const { req, res } = createMocks({ method: 'GET', query: { username: 'weakness', layout } });
      await handler(req, res);

      expect(res._getData()).toBe('<svg>pie</svg>');
      expect(generateCategoryBarsSvgUtils.generateCategoryBarsSvg).not.toHaveBeenCalled();
      const [stats] = (generateCategorySvgUtils.generateCategorySvg as jest.Mock).mock.calls[0];
      expect(stats.categories[1].color).not.toBe('#a78bfa');
    }
  });
});
