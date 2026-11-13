import { createMocks } from 'node-mocks-http';
import handler, { parseSeasonParam } from '../../../pages/api/ctf';
import * as dreamhackUtils from '../../../utils/dreamhack';
import * as ctfSvg from '../../../utils/generateCtfSvg';
import { TCtfSeasonResult } from '../../../types';

jest.mock('../../../utils/dreamhack', () => ({
  getUserId: jest.fn(),
  getCtfSeasons: jest.fn(),
  getCtfSeasonResult: jest.fn(),
  getCtfSeasonHistory: jest.fn(),
  getCurrentCtfSeason: jest.requireActual('../../../utils/dreamhack').getCurrentCtfSeason,
}));

jest.mock('../../../utils/generateCtfSvg', () => ({
  CTF_CARD_TITLE: 'Dreamhack CTF',
  generateCtfSeasonSvg: jest.fn(() => '<svg>season</svg>'),
  generateCtfGraphSvg: jest.fn(() => '<svg>graph</svg>'),
  generateCtfHistorySvg: jest.fn(() => '<svg>history</svg>'),
  generateCtfEmptySvg: jest.fn(() => '<svg>empty</svg>'),
}));

const seasons = [
  { number: 6, startsAt: '2024-07-02T00:00:00+09:00', endsAt: '2024-12-31T23:59:59+09:00' },
  { number: 7, startsAt: '2024-12-30T00:00:00+09:00', endsAt: '2025-12-31T23:59:59+09:00' },
  { number: 8, startsAt: '2026-01-01T00:00:00+09:00', endsAt: '2026-12-31T00:00:00+09:00' },
];

const result = (season: number, rating = 1600): TCtfSeasonResult => ({
  season,
  tier: 'Gold II',
  tierClass: 'gold',
  rating,
  rank: 175,
  participants: 4146,
  contests: 5,
  rounds: [{ round: 1, rating, rank: 10 }],
});

const history = [
  { season: 5, tier: 'Gold III', tierClass: 'gold', rating: 1597 },
  { season: 7, tier: 'Gold II', tierClass: 'gold', rating: 1600 },
];

const call = async (query: Record<string, unknown>) => {
  const { req, res } = createMocks({ method: 'GET', query });
  await handler(req, res);
  return res;
};

const mockResults = (bySeason: Record<number, TCtfSeasonResult | null>) => {
  (dreamhackUtils.getCtfSeasonResult as jest.Mock).mockImplementation(async (_id: number, season: number) => bySeason[season] ?? null);
};

describe('parseSeasonParam 함수 테스트', () => {
  it('season 값을 기본·current·숫자·잘못된 값으로 나눠야 함', () => {
    expect(parseSeasonParam(undefined)).toEqual({ kind: 'default' });
    expect(parseSeasonParam('')).toEqual({ kind: 'default' });
    expect(parseSeasonParam('current')).toEqual({ kind: 'current' });
    expect(parseSeasonParam('7')).toEqual({ kind: 'number', season: 7 });
    expect(parseSeasonParam('0')).toEqual({ kind: 'invalid', raw: '0' });
    expect(parseSeasonParam('-1')).toEqual({ kind: 'invalid', raw: '-1' });
    expect(parseSeasonParam('7.5')).toEqual({ kind: 'invalid', raw: '7.5' });
    expect(parseSeasonParam('1000')).toEqual({ kind: 'invalid', raw: '1000' });
    expect(parseSeasonParam(['7', '8'])).toEqual({ kind: 'invalid', raw: '7,8' });
  });
});

describe('ctf API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-11-12T00:00:00+09:00'));
    jest.spyOn(console, 'error').mockImplementation();
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValue(35875);
    (dreamhackUtils.getCtfSeasons as jest.Mock).mockResolvedValue(seasons);
    (dreamhackUtils.getCtfSeasonHistory as jest.Mock).mockResolvedValue(history);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('옵션이 없고 이번 시즌 결과가 있으면 이번 시즌(진행 중)을 보여줘야 함', async () => {
    mockResults({ 8: result(8, 2302) });
    const res = await call({ username: 'player', theme: 'dark' });

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getData()).toBe('<svg>season</svg>');
    expect(ctfSvg.generateCtfSeasonSvg).toHaveBeenCalledWith('player', result(8, 2302), true, 'dark');
    expect(dreamhackUtils.getCtfSeasonHistory).not.toHaveBeenCalled();
  });

  it('옵션이 없고 이번 시즌에 참가하지 않았으면 결과가 있는 가장 최근 시즌(종료)을 보여줘야 함', async () => {
    mockResults({ 7: result(7) });
    await call({ username: 'player' });

    expect(dreamhackUtils.getCtfSeasonResult).toHaveBeenNthCalledWith(1, 35875, 8);
    expect(dreamhackUtils.getCtfSeasonResult).toHaveBeenNthCalledWith(2, 35875, 7);
    expect(ctfSvg.generateCtfSeasonSvg).toHaveBeenCalledWith('player', result(7), false, 'light');
  });

  it('시즌 상세가 비어 있으면 시즌별 결과 목록의 값으로라도 보여줘야 함', async () => {
    mockResults({});
    await call({ username: 'player' });
    expect(ctfSvg.generateCtfSeasonSvg).toHaveBeenCalledWith(
      'player',
      { season: 7, tier: 'Gold II', tierClass: 'gold', rating: 1600, rank: 0, participants: 0, contests: null, rounds: [] },
      false,
      'light'
    );
  });

  it('CTF 기록이 아예 없으면 기록 없음 카드를 보여줘야 함', async () => {
    mockResults({});
    (dreamhackUtils.getCtfSeasonHistory as jest.Mock).mockResolvedValueOnce([]);
    const res = await call({ username: 'player' });
    expect(res._getData()).toBe('<svg>empty</svg>');
    expect(ctfSvg.generateCtfEmptySvg).toHaveBeenCalledWith('player', null, 'final', null, 'light');
  });

  it('season=7이면 그 시즌을, season=current면 이번 시즌을 보여줘야 함', async () => {
    mockResults({ 7: result(7), 8: result(8, 2302) });
    await call({ username: 'player', season: '7' });
    expect(ctfSvg.generateCtfSeasonSvg).toHaveBeenLastCalledWith('player', result(7), false, 'light');

    await call({ username: 'player', season: 'current' });
    expect(ctfSvg.generateCtfSeasonSvg).toHaveBeenLastCalledWith('player', result(8, 2302), true, 'light');
  });

  it('고른 시즌에 결과가 없으면 그 시즌의 기록 없음 카드와 마지막 참가 시즌을 보여줘야 함', async () => {
    mockResults({});
    await call({ username: 'player', season: 'current' });
    expect(ctfSvg.generateCtfEmptySvg).toHaveBeenLastCalledWith('player', 8, 'live', history[1], 'light');

    await call({ username: 'player', season: '6' });
    expect(ctfSvg.generateCtfEmptySvg).toHaveBeenLastCalledWith('player', 6, 'final', history[1], 'light');
  });

  it('고른 시즌의 상세가 비어 있어도 시즌별 결과 목록에 있으면 그 값으로 보여줘야 함 (기본 카드와 같은 동작)', async () => {
    mockResults({});
    await call({ username: 'player', season: '7' });
    expect(ctfSvg.generateCtfEmptySvg).not.toHaveBeenCalled();
    expect(ctfSvg.generateCtfSeasonSvg).toHaveBeenCalledWith(
      'player',
      { season: 7, tier: 'Gold II', tierClass: 'gold', rating: 1600, rank: 0, participants: 0, contests: null, rounds: [] },
      false,
      'light'
    );
  });

  it('결과 목록 값으로 대신 보여줄 때 목록에 있는 시즌 순위를 살려야 함', async () => {
    mockResults({});
    (dreamhackUtils.getCtfSeasonHistory as jest.Mock).mockResolvedValueOnce([{ ...history[1], rank: 79 }]);
    await call({ username: 'player', season: '7' });
    expect((ctfSvg.generateCtfSeasonSvg as jest.Mock).mock.calls[0][1]).toMatchObject({ season: 7, rank: 79, participants: 0, contests: null });
  });

  it('아직 시작하지 않은 시즌을 고르면 시작 전 안내를 보여줘야 함', async () => {
    (dreamhackUtils.getCtfSeasons as jest.Mock).mockResolvedValue([
      ...seasons,
      { number: 9, startsAt: '2027-01-01T00:00:00+09:00', endsAt: '2027-12-31T00:00:00+09:00' },
    ]);
    await call({ username: 'player', season: '9' });
    expect(dreamhackUtils.getCtfSeasonResult).not.toHaveBeenCalled();
    expect(ctfSvg.generateCtfEmptySvg).toHaveBeenCalledWith('player', 9, 'upcoming', history[1], 'light');
  });

  it('없는 시즌 번호나 잘못된 값이면 안내 카드를 보여줘야 함', async () => {
    let res = await call({ username: 'player', season: '99' });
    expect(res._getData()).toContain('Season 99 not found');
    expect(res._getData()).toContain('Seasons 1-8 are available.');
    expect(dreamhackUtils.getCtfSeasonResult).not.toHaveBeenCalled();

    res = await call({ username: 'player', season: 'latest' });
    expect(res._getData()).toContain('Invalid season');
    expect(dreamhackUtils.getUserId).toHaveBeenCalledTimes(1);
  });

  it('view=graph면 그래프형으로 그려야 함', async () => {
    mockResults({ 8: result(8, 2302) });
    const res = await call({ username: 'player', view: 'graph' });
    expect(res._getData()).toBe('<svg>graph</svg>');
    expect(ctfSvg.generateCtfGraphSvg).toHaveBeenCalledWith('player', result(8, 2302), true, 'light');
  });

  it('view=seasons면 끝난 시즌 목록에 이번 시즌(진행 중)을 붙여 그려야 함', async () => {
    mockResults({ 8: result(8, 2302) });
    await call({ username: 'player', view: 'seasons' });
    expect(ctfSvg.generateCtfHistorySvg).toHaveBeenCalledWith(
      'player',
      [...history, { season: 8, tier: 'Gold II', tierClass: 'gold', rating: 2302, live: true }],
      'light'
    );
  });

  it('view=seasons에서 이번 시즌 상세가 없으면 결과 목록에 있는 같은 시즌을 빼지 않아야 함', async () => {
    mockResults({});
    (dreamhackUtils.getCtfSeasonHistory as jest.Mock).mockResolvedValueOnce([...history, { season: 8, tier: 'Gold I', tierClass: 'gold', rating: 1700 }]);
    await call({ username: 'player', view: 'seasons' });
    const [, points] = (ctfSvg.generateCtfHistorySvg as jest.Mock).mock.calls[0];
    expect(points.map((p: { season: number }) => p.season)).toEqual([5, 7, 8]);
  });

  it('view=seasons인데 기록이 하나도 없으면 기록 없음 카드를 보여줘야 함', async () => {
    mockResults({});
    (dreamhackUtils.getCtfSeasonHistory as jest.Mock).mockResolvedValueOnce([]);
    const res = await call({ username: 'player', view: 'seasons' });
    expect(res._getData()).toBe('<svg>empty</svg>');
  });

  it('닉네임이 없거나 사용자를 찾지 못하면 안내 카드를 보여줘야 함', async () => {
    let res = await call({});
    expect(res._getData()).toContain('Missing username');

    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(null);
    res = await call({ username: 'nobody' });
    expect(res._getData()).toContain('User not found');
    expect(dreamhackUtils.getCtfSeasonResult).not.toHaveBeenCalled();
  });

  it('Dreamhack 조회가 실패하면 오류 카드를 200으로 보여줘야 함', async () => {
    (dreamhackUtils.getCtfSeasons as jest.Mock).mockRejectedValueOnce(new Error('502'));
    const res = await call({ username: 'player' });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('Failed to load stats');
  });
});
