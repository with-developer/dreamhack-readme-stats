import { getLastRank, getUserId, getUserData, calculateTopPercentage } from '../../utils/dreamhack';
import { TgetLastRankResponse, TUserRankingResponse, TuserData } from '../../types';
import * as redisUtils from '../../utils/redis';

// fetch 모킹
global.fetch = jest.fn();
// Redis 유틸리티 함수 모킹
jest.mock('../../utils/redis');

describe('dreamhack 유틸리티 함수 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });

  describe('getLastRank 함수', () => {
    it('마지막 랭크를 성공적으로 가져와야 함', async () => {
      const mockResponse: TgetLastRankResponse = { count: 1000 };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getLastRank();
      
      expect(fetch).toHaveBeenCalledWith(
        'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=1&offset=99999'
      );
      expect(result).toBe(1000);
    });

    it('API 호출 실패 시 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 호출 실패'));

      const result = await getLastRank();
      
      expect(result).toBeNull();
    });
  });

  describe('getUserId 함수', () => {
    it('Redis 캐시에서 사용자 ID를 가져와야 함', async () => {
      // Redis 캐시에서 사용자 ID를 가져오는 모킹
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(20691);
      
      const result = await getUserId('weakness');
      
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(20691);
    });

    it('Redis 캐시에 사용자 ID가 없을 경우 API를 호출하고 결과를 캐시에 저장해야 함', async () => {
      // Redis 캐시에서 사용자 ID를 가져오지 못하는 모킹
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(null);
      
      const mockResponse: TUserRankingResponse = {
        results: [
          { id: 20691, nickname: 'weakness' }
        ]
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getUserId('weakness');
      
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(fetch).toHaveBeenCalledWith(
        'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=100&offset=0&search=weakness&scope=all&name=&category='
      );
      expect(redisUtils.saveUserIdToCache).toHaveBeenCalledWith('weakness', 20691);
      expect(result).toBe(20691);
    });

    it('사용자를 찾을 수 없을 때 null을 반환해야 함', async () => {
      // Redis 캐시에서 사용자 ID를 가져오지 못하는 모킹
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(null);
      
      const mockResponse: TUserRankingResponse = {
        results: []
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getUserId('nonexistentuser');
      
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('nonexistentuser');
      expect(result).toBeNull();
      expect(redisUtils.saveUserIdToCache).not.toHaveBeenCalled();
    });

    it('API 호출 실패 시 null을 반환해야 함', async () => {
      // Redis 캐시에서 사용자 ID를 가져오지 못하는 모킹
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(null);
      
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 호출 실패'));

      const result = await getUserId('weakness');
      
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(result).toBeNull();
    });
  });

  describe('getUserData 함수', () => {
    it('사용자 데이터를 성공적으로 가져와야 함', async () => {
      const mockUserData: TuserData = {
        nickname: 'weakness',
        contributions: { level: 1, rank: 100 },
        exp: 1000,
        total_wargame: 50,
        wargame: { solved: 50, rank: 200, score: 5000 },
        ctf: { rank: 300, tier: 'Gold', rating: 2000 },
        profile_image: 'image.jpg'
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUserData),
      });

      const result = await getUserData(20691);
      
      expect(fetch).toHaveBeenCalledWith(
        'https://dreamhack.io/api/v1/user/profile/20691/'
      );
      expect(result).toEqual(mockUserData);
    });

    it('API 응답이 404일 때 username이 제공되면 새로운 사용자 ID를 조회해야 함', async () => {
      // 첫 번째 API 호출 실패 (404)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      
      // getUserId 함수 호출 결과 모킹
      const mockNewUserId = 12345;
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(null);
      const mockResponse: TUserRankingResponse = {
        results: [
          { id: mockNewUserId, nickname: 'weakness' }
        ]
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });
      
      // 새로운 사용자 ID로 다시 호출한 결과 모킹
      const mockUserData: TuserData = {
        nickname: 'weakness',
        contributions: { level: 1, rank: 100 },
        exp: 1000,
        total_wargame: 50,
        wargame: { solved: 50, rank: 200, score: 5000 },
        ctf: { rank: 300, tier: 'Gold', rating: 2000 },
        profile_image: 'image.jpg'
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUserData),
      });

      const result = await getUserData(20691, 'weakness');
      
      // 첫 번째 API 호출 확인
      expect(fetch).toHaveBeenNthCalledWith(1,
        'https://dreamhack.io/api/v1/user/profile/20691/'
      );
      
      // 새로운 사용자 ID 조회 확인
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(fetch).toHaveBeenNthCalledWith(2,
        'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=100&offset=0&search=weakness&scope=all&name=&category='
      );
      
      // 새로운 사용자 ID로 다시 API 호출 확인
      expect(fetch).toHaveBeenNthCalledWith(3,
        'https://dreamhack.io/api/v1/user/profile/12345/'
      );
      
      expect(result).toEqual(mockUserData);
    });

    it('API 응답이 404이고 username이 제공되었지만 새로운 사용자 ID를 찾지 못할 경우 null을 반환해야 함', async () => {
      // 첫 번째 API 호출 실패 (404)
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });
      
      // getUserId 함수 호출 결과 모킹 (사용자를 찾지 못함)
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(null);
      const mockResponse: TUserRankingResponse = {
        results: []
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getUserData(20691, 'nonexistentuser');
      
      expect(fetch).toHaveBeenNthCalledWith(1,
        'https://dreamhack.io/api/v1/user/profile/20691/'
      );
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('nonexistentuser');
      expect(result).toBeNull();
    });

    it('API 응답이 404가 아닌 다른 오류일 때 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getUserData(20691, 'weakness');
      
      expect(fetch).toHaveBeenCalledWith(
        'https://dreamhack.io/api/v1/user/profile/20691/'
      );
      expect(result).toBeNull();
    });

    it('API 호출 실패 시 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 호출 실패'));

      const result = await getUserData(20691);
      
      expect(result).toBeNull();
    });
  });

  describe('calculateTopPercentage 함수', () => {
    it('순위 백분율을 올바르게 계산해야 함', () => {
      const result = calculateTopPercentage(200, 1000);
      expect(result).toBe('20.00');
    });

    it('rank가 null일 때 N/A를 반환해야 함', () => {
      const result = calculateTopPercentage(null, 1000);
      expect(result).toBe('N/A');
    });

    it('totalRanks가 null일 때 N/A를 반환해야 함', () => {
      const result = calculateTopPercentage(200, null);
      expect(result).toBe('N/A');
    });
  });
}); 