import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/stats';
import * as dreamhackUtils from '../../../utils/dreamhack';
import * as generateSvgUtils from '../../../utils/generateStatsSvg';
import { TuserData } from '../../../types';

// dreamhack 유틸리티 함수 모킹
jest.mock('../../../utils/dreamhack', () => ({
  getUserId: jest.fn(),
  getLastRank: jest.fn(),
  getUserData: jest.fn(),
  calculateTopPercentage: jest.fn(),
}));

// generateStatsSvg 유틸리티 함수 모킹
jest.mock('../../../utils/generateStatsSvg', () => ({
  generateStatsSvg: jest.fn(),
}));

describe('stats API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('유효한 사용자 이름으로 SVG를 반환해야 함', async () => {
    // 모킹된 데이터 설정
    const mockUserId = 20691;
    const mockLastRank = 1000;
    const mockUserData: TuserData = {
      nickname: 'weakness',
      contributions: { level: 1, rank: 100 },
      exp: 1000,
      total_wargame: 50,
      wargame: { solved: 50, rank: 200, score: 5000 },
      ctf: { rank: 300, tier: 'Gold', rating: 2000 },
      profile_image: 'image.jpg'
    };
    const mockSvg = '<svg>Mock SVG</svg>';

    // 모킹된 함수 구현
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    (dreamhackUtils.getLastRank as jest.Mock).mockResolvedValueOnce(mockLastRank);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce(mockUserData);
    (dreamhackUtils.calculateTopPercentage as jest.Mock).mockReturnValueOnce('20.00');
    (generateSvgUtils.generateStatsSvg as jest.Mock).mockReturnValueOnce(mockSvg);

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
    expect(dreamhackUtils.getLastRank).toHaveBeenCalled();
    expect(dreamhackUtils.getUserData).toHaveBeenCalledWith(mockUserId, 'weakness');
    expect(dreamhackUtils.calculateTopPercentage).toHaveBeenCalledWith(mockUserData.wargame.rank, mockLastRank);
    expect(generateSvgUtils.generateStatsSvg).toHaveBeenCalledWith({
      nickname: mockUserData.nickname,
      wargame_solved: mockUserData.total_wargame,
      wargame_rank: `${mockUserData.wargame.rank}/${mockLastRank}`,
      wargameRankPercentage: '20.00',
      wargame_score: mockUserData.wargame.score,
    });
  });

  it('사용자 이름이 없을 때 400 에러를 반환해야 함', async () => {
    // HTTP 요청 모킹 (사용자 이름 없음)
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Username is required' });
  });

  it('사용자를 찾을 수 없을 때 400 에러를 반환해야 함', async () => {
    // 모킹된 함수 구현 (사용자 ID가 null)
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(null);

    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'nonexistentuser',
      },
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'User not found' });
  });

  it('마지막 랭크를 가져올 수 없을 때 500 에러를 반환해야 함', async () => {
    // 모킹된 함수 구현
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(123);
    (dreamhackUtils.getLastRank as jest.Mock).mockResolvedValueOnce(null);

    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'testuser',
      },
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Failed to fetch last rank' });
  });

  it('사용자 데이터를 가져올 수 없을 때 400 에러를 반환해야 함', async () => {
    // 모킹된 함수 구현
    const username = 'testuser';
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(123);
    (dreamhackUtils.getLastRank as jest.Mock).mockResolvedValueOnce(1000);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce(null);

    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username,
      },
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({ error: 'User information cannot be read.' });
    expect(dreamhackUtils.getUserData).toHaveBeenCalledWith(123, username);
  });

  it('예외 발생 시 500 에러를 반환해야 함', async () => {
    // 모킹된 함수 구현 (예외 발생)
    (dreamhackUtils.getUserId as jest.Mock).mockRejectedValueOnce(new Error('테스트 에러'));

    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        username: 'testuser',
      },
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Internal Server Error' });
  });
}); 