/**
 * @jest-environment node
 */
// 서버 코드 테스트라 Node 환경에서 실행 (jsdom에는 AbortSignal.timeout이 없음)
import {
  getCtfSeasons,
  getCurrentCtfSeason,
  getCtfSeasonResult,
  getCtfSeasonHistory,
  resetCtfSeasonsCacheForTest,
} from '../../utils/dreamhack';

global.fetch = jest.fn();
jest.mock('../../utils/redis');

const okJson = (body: unknown) => ({ ok: true, json: jest.fn().mockResolvedValue(body) });

// 실제 /api/v1/ctf/seasons/ 응답의 기간 (일부)
const seasonsResponse = [
  { id: 5, number: 5, starts_at: '2023-12-29T00:00:00+09:00', ends_at: '2024-06-30T23:59:59+09:00' },
  { id: 4, number: 4, starts_at: '2023-07-01T00:00:00+09:00', ends_at: '2023-12-31T23:59:59+09:00' },
  { id: 7, number: 7, starts_at: '2024-12-30T00:00:00+09:00', ends_at: '2025-12-31T23:59:59+09:00' },
  { id: 8, number: 8, starts_at: '2026-01-01T00:00:00+09:00', ends_at: '2026-12-31T00:00:00+09:00' },
];

describe('CTF 시즌 조회 함수 테스트', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    resetCtfSeasonsCacheForTest();
    jest.spyOn(console, 'time').mockImplementation();
    jest.spyOn(console, 'timeEnd').mockImplementation();
  });

  it('시즌 목록을 번호 순으로 정리하고 1시간 동안 다시 조회하지 않아야 함', async () => {
    (fetch as jest.Mock).mockResolvedValue(okJson(seasonsResponse));
    const seasons = await getCtfSeasons();
    expect(seasons.map((s) => s.number)).toEqual([4, 5, 7, 8]);
    expect(seasons[0]).toEqual({ number: 4, startsAt: '2023-07-01T00:00:00+09:00', endsAt: '2023-12-31T23:59:59+09:00' });

    await getCtfSeasons();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('시즌 목록 조회가 실패하면 예외를 던지고 캐시하지 않아야 함', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 502 });
    await expect(getCtfSeasons()).rejects.toThrow('502');
    (fetch as jest.Mock).mockResolvedValueOnce(okJson(seasonsResponse));
    await expect(getCtfSeasons()).resolves.toHaveLength(4);
  });

  it('캐시 시간이 지난 뒤 시즌 목록 조회가 실패하면 전에 받아 둔 목록을 써야 함', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    const now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    (fetch as jest.Mock).mockResolvedValueOnce(okJson(seasonsResponse));
    await getCtfSeasons();

    now.mockReturnValue(1_000_000 + 2 * 60 * 60 * 1000);
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 502 });
    await expect(getCtfSeasons()).resolves.toHaveLength(4);
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('timeout'));
    await expect(getCtfSeasons()).resolves.toHaveLength(4);
    expect(fetch).toHaveBeenCalledTimes(3);
    now.mockRestore();
  });

  it('지금 진행 중인 시즌을 골라야 함 (겹치면 나중 시즌, 공백이면 마지막으로 시작한 시즌)', async () => {
    (fetch as jest.Mock).mockResolvedValue(okJson(seasonsResponse));
    const seasons = await getCtfSeasons();
    expect(getCurrentCtfSeason(seasons, new Date('2026-11-12T00:00:00+09:00'))).toBe(8);
    // 시즌 4와 5가 겹치는 기간
    expect(getCurrentCtfSeason(seasons, new Date('2023-12-30T12:00:00+09:00'))).toBe(5);
    // 시즌 5가 끝나고 7이 시작하기 전 (시즌 6이 목록에 없다고 가정)
    expect(getCurrentCtfSeason(seasons, new Date('2024-09-01T00:00:00+09:00'))).toBe(5);
    // 시즌 8 종료 시각(12-31 00:00) 이후에도 다음 시즌이 없으면 8
    expect(getCurrentCtfSeason(seasons, new Date('2026-12-31T12:00:00+09:00'))).toBe(8);
    expect(getCurrentCtfSeason(seasons, new Date('2020-01-01T00:00:00+09:00'))).toBeNull();
    expect(getCurrentCtfSeason([], new Date())).toBeNull();
  });

  it('시즌 결과를 카드용 값으로 바꾸고, 결과가 없으면 null이어야 함', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(okJson({
      graph_data: [
        { rating: 1588, round: 1, rank: 8, tier: { tier: 'Gold III' } },
        { rating: 1702, round: 2, rank: 3, tier: { tier: 'Gold I' } },
      ],
      season_result: {
        tier: { tier: 'Platinum II', tier_class: 'platinum', tier_position: 2 },
        season_participants: 4146,
        rating: 1964,
        rank: 29,
      },
      cnt_participated: 10,
    }));
    const result = await getCtfSeasonResult(35607, 7);
    expect(fetch).toHaveBeenCalledWith(
      'https://dreamhack.io/api/v1/ctf/seasons/7/highlight/?user_id=35607',
      expect.anything()
    );
    expect(result).toEqual({
      season: 7,
      tier: 'Platinum II',
      tierClass: 'platinum',
      rating: 1964,
      rank: 29,
      participants: 4146,
      contests: 10,
      rounds: [
        { round: 1, rating: 1588, rank: 8 },
        { round: 2, rating: 1702, rank: 3 },
      ],
    });

    (fetch as jest.Mock).mockResolvedValueOnce(okJson({ graph_data: [], season_result: null, cnt_participated: 0 }));
    await expect(getCtfSeasonResult(20691, 8)).resolves.toBeNull();

    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getCtfSeasonResult(1, 99)).rejects.toThrow('404');
  });

  it('시즌별 결과 목록을 시즌 순으로 돌려줘야 함', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce(okJson({
      graph_data: [
        { number: 5, rank: 79, rating: 1635, tier: { tier: 'Gold II', tier_class: 'gold' } },
        { number: 1, rank: 977, rating: 1250, tier: { tier: 'Silver III', tier_class: 'silver' } },
        { number: 2 },
      ],
    }));
    const history = await getCtfSeasonHistory(20691);
    expect(fetch).toHaveBeenCalledWith('https://dreamhack.io/api/v1/ctf/seasons/highlights/?user_id=20691', expect.anything());
    expect(history).toEqual([
      { season: 1, tier: 'Silver III', tierClass: 'silver', rating: 1250, rank: 977 },
      { season: 5, tier: 'Gold II', tierClass: 'gold', rating: 1635, rank: 79 },
    ]);
  });
});
