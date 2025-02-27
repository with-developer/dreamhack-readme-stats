import { getLastRank, getUserId, getUserData, calculateTopPercentage } from '../../utils/dreamhack';
import { TgetLastRankResponse, TUserRankingResponse, TuserData } from '../../types';

// fetch 모킹
global.fetch = jest.fn();

describe('dreamhack 유틸리티 함수 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
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
    it('사용자 ID를 성공적으로 가져와야 함', async () => {
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
      
      expect(fetch).toHaveBeenCalledWith(
        'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=100&offset=0&search=weakness&scope=all&name=&category='
      );
      expect(result).toBe(20691);
    });

    it('사용자를 찾을 수 없을 때 null을 반환해야 함', async () => {
      const mockResponse: TUserRankingResponse = {
        results: []
      };
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse),
      });

      const result = await getUserId('nonexistentuser');
      
      expect(result).toBeNull();
    });

    it('API 호출 실패 시 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 호출 실패'));

      const result = await getUserId('weakness');
      
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

    it('API 응답이 ok가 아닐 때 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await getUserData(20691);
      
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