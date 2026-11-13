import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/solves';
import * as dreamhackUtils from '../../../utils/dreamhack';

jest.mock('../../../utils/dreamhack', () => ({
  getUserId: jest.fn(),
  getUserSolves: jest.fn(),
}));

const call = async (query: Record<string, unknown>) => {
  const { req, res } = createMocks({ method: 'GET', query });
  await handler(req, res);
  return res;
};

const solves = [{ title: 'Chaining', tier: 14, tags: ['reversing'], solvedAt: '2024-08-13T22:50:06+09:00', solvers: 103 }];

describe('solves API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValue(20691);
    (dreamhackUtils.getUserSolves as jest.Mock).mockResolvedValue(solves);
  });

  it('기본은 최근 풀이 5개를 조회해 카드를 그려야 함', async () => {
    const res = await call({ username: 'weakness' });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(dreamhackUtils.getUserSolves).toHaveBeenCalledWith(20691, 'recent', 5);
    expect(res._getData()).toContain('Recent Solves');
    expect(res._getData()).toContain('Chaining');
  });

  it('sort=hardest면 난이도 순으로 조회하고, 모르는 값은 최근 순이어야 함', async () => {
    let res = await call({ username: 'weakness', sort: 'hardest', theme: 'gruvbox' });
    expect(dreamhackUtils.getUserSolves).toHaveBeenLastCalledWith(20691, 'hardest', 5);
    expect(res._getData()).toContain('Hardest Solves');
    expect(res._getData()).toContain('#282828');

    res = await call({ username: 'weakness', sort: 'oldest' });
    expect(dreamhackUtils.getUserSolves).toHaveBeenLastCalledWith(20691, 'recent', 5);
  });

  it('닉네임이 없거나 사용자를 찾지 못하면 안내 카드를 보여줘야 함', async () => {
    let res = await call({ sort: 'hardest' });
    expect(res._getData()).toContain('Missing username');
    expect(res._getData()).toContain('Hardest Solves');

    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(null);
    res = await call({ username: 'nobody' });
    expect(res._getData()).toContain('User not found');
    expect(dreamhackUtils.getUserSolves).not.toHaveBeenCalled();
  });

  it('풀이 기록 조회가 실패하면 오류 카드를 200으로 보여줘야 함', async () => {
    (dreamhackUtils.getUserSolves as jest.Mock).mockRejectedValueOnce(new Error('503'));
    const res = await call({ username: 'weakness' });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('Failed to load stats');
  });
});
