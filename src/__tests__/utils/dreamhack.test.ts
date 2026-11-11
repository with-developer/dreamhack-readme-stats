/**
 * @jest-environment node
 */
// 서버 코드 테스트라 Node 환경에서 실행 (jsdom에는 AbortSignal.timeout이 없음)
import { getLastRank, getUserId, getUserData, calculateTopPercentage, getUserSolves } from '../../utils/dreamhack';
import { TgetLastRankResponse, TUserRankingResponse, TuserData } from '../../types';
import * as redisUtils from '../../utils/redis';

// fetch 모킹
global.fetch = jest.fn();
// Redis 유틸리티 함수 모킹
jest.mock('../../utils/redis');

const searchUrl = (search: string, offset = 0) =>
  `https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=50&offset=${offset}&search=${search}&scope=all&name=&category=`;

const mockSearchResponse = (response: TUserRankingResponse) => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: jest.fn().mockResolvedValueOnce(response),
  });
};

// 닉네임이 검색어를 포함하는 다른 사용자 50명으로 채운 검색 결과 한 페이지
const filledPage = (count: number, prefix: string): TUserRankingResponse => ({
  count,
  results: Array.from({ length: 50 }, (_, i) => ({ id: 100000 + i, nickname: `${prefix}${i}` })),
});

const mockUserData: TuserData = {
  nickname: 'weakness',
  contributions: { level: 1, rank: 100 },
  exp: 1000,
  total_wargame: 50,
  wargame: { solved: 50, rank: 200, score: 5000 },
  ctf: { rank: 300, tier: 'Gold', rating: 2000 },
  profile_image: 'image.jpg'
};

describe('dreamhack 유틸리티 함수 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
    (redisUtils.getUserIdFromCache as jest.Mock).mockReset().mockResolvedValue(null);
    (redisUtils.isUserNotFoundCached as jest.Mock).mockReset().mockResolvedValue(false);
    (redisUtils.deleteUserIdFromCache as jest.Mock).mockReset();
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
        'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=1&offset=99999',
        expect.objectContaining({ signal: expect.anything() })
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
      (redisUtils.getUserIdFromCache as jest.Mock).mockResolvedValueOnce(20691);

      const result = await getUserId('weakness');

      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBe(20691);
    });

    it('Redis 캐시에 사용자 ID가 없을 경우 API를 호출하고 결과를 캐시에 저장해야 함', async () => {
      mockSearchResponse({ count: 1, results: [{ id: 20691, nickname: 'weakness' }] });

      const result = await getUserId('weakness');

      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(fetch).toHaveBeenCalledWith(searchUrl('weakness'), expect.objectContaining({ signal: expect.anything() }));
      expect(redisUtils.saveUserIdToCache).toHaveBeenCalledWith('weakness', 20691);
      expect(result).toBe(20691);
    });

    it('닉네임의 특수문자를 인코딩해서 검색해야 함', async () => {
      mockSearchResponse({ count: 1, results: [{ id: 5409, nickname: 'p&p #1+' }] });

      const result = await getUserId('p&p #1+');

      expect(fetch).toHaveBeenCalledWith(searchUrl('p%26p+%231%2B'), expect.anything());
      expect(result).toBe(5409);
    });

    it('첫 페이지에 없으면 다음 페이지들에서 찾아야 함', async () => {
      mockSearchResponse(filledPage(120, 'lee'));
      mockSearchResponse(filledPage(120, 'xlee'));
      mockSearchResponse({ count: 120, results: [{ id: 2742, nickname: 'lee' }] });

      const result = await getUserId('lee');

      expect(fetch).toHaveBeenCalledTimes(3);
      expect(fetch).toHaveBeenCalledWith(searchUrl('lee', 50), expect.anything());
      expect(fetch).toHaveBeenCalledWith(searchUrl('lee', 100), expect.anything());
      expect(redisUtils.saveUserIdToCache).toHaveBeenCalledWith('lee', 2742);
      expect(result).toBe(2742);
    });

    it('검색 결과가 많아도 최대 5페이지까지만 확인해야 함', async () => {
      for (let i = 0; i < 5; i++) mockSearchResponse(filledPage(9000, `a${i}_`));

      const result = await getUserId('a');

      expect(fetch).toHaveBeenCalledTimes(5);
      expect(fetch).toHaveBeenLastCalledWith(searchUrl('a', 200), expect.anything());
      expect(result).toBeNull();
      expect(redisUtils.saveUserNotFoundToCache).toHaveBeenCalledWith('a');
    });

    it('다른 페이지 조회가 실패해도 찾은 사용자는 반환해야 함', async () => {
      mockSearchResponse(filledPage(200, 'lee'));
      mockSearchResponse({ count: 200, results: [{ id: 2742, nickname: 'lee' }] });
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 429 });
      mockSearchResponse(filledPage(200, 'xlee'));

      const result = await getUserId('lee');

      expect(fetch).toHaveBeenCalledTimes(4);
      expect(result).toBe(2742);
    });

    it('못 찾았는데 실패한 페이지가 있으면 예외를 던지고 미존재로 기록하지 않아야 함', async () => {
      mockSearchResponse(filledPage(200, 'lee'));
      mockSearchResponse(filledPage(200, 'xlee'));
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 429 });
      mockSearchResponse(filledPage(200, 'ylee'));

      await expect(getUserId('lee')).rejects.toThrow('Failed to search some ranking pages');
      expect(redisUtils.saveUserNotFoundToCache).not.toHaveBeenCalled();
    });

    it('실제 닉네임일 수 없는 긴 값은 캐시나 검색 없이 null을 반환해야 함', async () => {
      const result = await getUserId('a'.repeat(65));

      expect(result).toBeNull();
      expect(redisUtils.getUserIdFromCache).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
      expect(redisUtils.saveUserNotFoundToCache).not.toHaveBeenCalled();
    });

    it('사용자를 찾을 수 없으면 null을 반환하고 미존재 사실을 캐시에 저장해야 함', async () => {
      mockSearchResponse({ count: 0, results: [] });

      const result = await getUserId('nonexistentuser');

      expect(result).toBeNull();
      expect(redisUtils.saveUserIdToCache).not.toHaveBeenCalled();
      expect(redisUtils.saveUserNotFoundToCache).toHaveBeenCalledWith('nonexistentuser');
    });

    it('최근에 찾지 못한 사용자면 Dreamhack을 다시 검색하지 않아야 함', async () => {
      (redisUtils.isUserNotFoundCached as jest.Mock).mockResolvedValueOnce(true);

      const result = await getUserId('nonexistentuser');

      expect(fetch).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('검색 API가 실패 응답을 주면 예외를 던지고 미존재로 기록하지 않아야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 403 });

      await expect(getUserId('<script>')).rejects.toThrow('Failed to search ranking: 403');
      expect(redisUtils.saveUserNotFoundToCache).not.toHaveBeenCalled();
    });

    it('API 호출 실패 시 예외를 던지고 미존재로 기록하지 않아야 함', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('API 호출 실패'));

      await expect(getUserId('weakness')).rejects.toThrow('API 호출 실패');
      expect(redisUtils.getUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(redisUtils.saveUserNotFoundToCache).not.toHaveBeenCalled();
    });
  });

  describe('getUserData 함수', () => {
    it('사용자 데이터를 성공적으로 가져와야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUserData),
      });

      const result = await getUserData(20691);

      expect(fetch).toHaveBeenCalledWith(
        'https://dreamhack.io/api/v1/user/profile/20691/',
        expect.objectContaining({ signal: expect.anything() })
      );
      expect(result).toEqual(mockUserData);
    });

    it('캐시된 ID가 404이면 캐시를 지우고 다시 검색한 ID로 조회해야 함', async () => {
      const invalidUserId = 9999999; // 더 이상 존재하지 않는 ID
      const validUserId = 20691;     // 다시 검색해서 찾은 ID

      // 실제 Redis처럼 지우기 전까지는 캐시된 ID를 계속 돌려줌
      let cachedUserId: number | null = invalidUserId;
      (redisUtils.getUserIdFromCache as jest.Mock).mockImplementation(async () => cachedUserId);
      (redisUtils.deleteUserIdFromCache as jest.Mock).mockImplementation(async () => {
        cachedUserId = null;
      });

      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      mockSearchResponse({ count: 1, results: [{ id: validUserId, nickname: 'weakness' }] });
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockUserData),
      });

      const result = await getUserData(invalidUserId, 'weakness');

      expect(redisUtils.deleteUserIdFromCache).toHaveBeenCalledWith('weakness');
      expect(fetch).toHaveBeenNthCalledWith(1, `https://dreamhack.io/api/v1/user/profile/${invalidUserId}/`, expect.anything());
      expect(fetch).toHaveBeenNthCalledWith(2, searchUrl('weakness'), expect.anything());
      expect(fetch).toHaveBeenNthCalledWith(3, `https://dreamhack.io/api/v1/user/profile/${validUserId}/`, expect.anything());
      expect(redisUtils.saveUserIdToCache).toHaveBeenCalledWith('weakness', validUserId);
      expect(result).toEqual(mockUserData);
    });

    it('다시 검색해도 같은 ID가 나오면 재조회하지 않고 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      mockSearchResponse({ count: 1, results: [{ id: 20691, nickname: 'weakness' }] });

      const result = await getUserData(20691, 'weakness');

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toBeNull();
    });

    it('API 응답이 404이고 username이 제공되었지만 새로운 사용자 ID를 찾지 못할 경우 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      mockSearchResponse({ count: 0, results: [] });

      const result = await getUserData(20691, 'nonexistentuser');

      expect(fetch).toHaveBeenNthCalledWith(1, 'https://dreamhack.io/api/v1/user/profile/20691/', expect.anything());
      expect(redisUtils.deleteUserIdFromCache).toHaveBeenCalledWith('nonexistentuser');
      expect(result).toBeNull();
    });

    it('404 후 다시 검색하다 실패하면 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('timeout'));

      const result = await getUserData(20691, 'weakness');

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(result).toBeNull();
    });

    it('API 응답이 404가 아닌 다른 오류일 때 null을 반환해야 함', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getUserData(20691, 'weakness');

      expect(fetch).toHaveBeenCalledWith('https://dreamhack.io/api/v1/user/profile/20691/', expect.anything());
      expect(redisUtils.deleteUserIdFromCache).not.toHaveBeenCalled();
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

describe('getUserSolves 함수 테스트', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  const record = {
    solved_at: '2024-08-13T22:50:06.610753+09:00',
    challenge: { title: 'Chaining', tier: 14, tags: ['reversing'], cnt_solvers: 103, author: { nickname: 'x' } },
  };

  it('정렬에 맞는 주소로 조회하고 카드에 필요한 값만 추려야 함', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({ results: [record, {}] }) });

    const recent = await getUserSolves(20691, 'recent', 5);
    expect((fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://dreamhack.io/api/v1/wargame/stats/?user_id=20691&limit=5&offset=0&ordering=-solved_at'
    );
    expect(recent).toEqual([
      { title: 'Chaining', tier: 14, tags: ['reversing'], solvedAt: '2024-08-13T22:50:06.610753+09:00', solvers: 103 },
      { title: '', tier: 0, tags: [], solvedAt: '', solvers: 0 },
    ]);

    await getUserSolves(20691, 'hardest', 5);
    expect((fetch as jest.Mock).mock.calls[1][0]).toContain('ordering=-challenge__tier');
  });

  it('응답이 실패면 예외를 던져야 함', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(getUserSolves(20691, 'recent', 5)).rejects.toThrow('503');
  });
});
