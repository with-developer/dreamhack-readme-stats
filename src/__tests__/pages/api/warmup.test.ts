import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/warmup';
import * as dreamhackUtils from '../../../utils/dreamhack';

// dreamhack 유틸리티 함수 모킹
jest.mock('../../../utils/dreamhack', () => ({
  getLastRank: jest.fn().mockResolvedValue(1000),
}));

// fetch 모킹
global.fetch = jest.fn();

describe('warmup API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('성공적인 응답을 반환해야 함', async () => {
    // HTTP 요청 모킹
    const { req, res } = createMocks({
      method: 'GET',
    });

    // API 핸들러 호출
    await handler(req, res);

    // 응답 검증
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ 
      message: 'Warmup successful', 
      lastRank: 1000 
    });
  });
}); 