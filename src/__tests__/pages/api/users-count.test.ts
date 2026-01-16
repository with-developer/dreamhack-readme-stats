import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/users-count';

// fetch 모킹
global.fetch = jest.fn();

describe('users-count API 엔드포인트 테스트', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GITHUB_TOKEN: 'test-token' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('고유 사용자 수를 shields.io 형식으로 반환해야 함', async () => {
    const mockResponse = {
      total_count: 3,
      items: [
        { repository: { owner: { login: 'user1' } } },
        { repository: { owner: { login: 'user2' } } },
        { repository: { owner: { login: 'user1' } } }, // 중복 사용자
      ]
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({
      schemaVersion: 1,
      label: 'users',
      message: '2', // 고유 사용자 2명
      color: 'blue'
    });
  });

  it('GITHUB_TOKEN이 없으면 500 에러를 반환해야 함', async () => {
    delete process.env.GITHUB_TOKEN;

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'GitHub token not configured' });
  });

  it('GitHub API 에러 시 해당 상태 코드를 반환해야 함', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Rate limit exceeded'
    });

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({ error: 'GitHub API error' });
  });

  it('fetch 예외 발생 시 500 에러를 반환해야 함', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({ error: 'Internal server error' });
  });
});
