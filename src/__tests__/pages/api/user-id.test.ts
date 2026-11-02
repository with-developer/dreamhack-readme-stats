import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/user-id';
import * as dreamhackUtils from '../../../utils/dreamhack';

jest.mock('../../../utils/dreamhack', () => ({
  getUserId: jest.fn(),
}));

describe('user-id API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });

  it('사용자 ID와 프로필 주소를 반환해야 함', async () => {
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(20691);

    const { req, res } = createMocks({ method: 'GET', query: { username: 'weakness' } });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ id: 20691, profileUrl: 'https://dreamhack.io/users/20691' });
    expect(dreamhackUtils.getUserId).toHaveBeenCalledWith('weakness');
  });

  it('사용자 이름이 없으면 400을 반환해야 함', async () => {
    const { req, res } = createMocks({ method: 'GET', query: {} });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(dreamhackUtils.getUserId).not.toHaveBeenCalled();
  });

  it('사용자를 찾을 수 없으면 404를 반환해야 함', async () => {
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(null);

    const { req, res } = createMocks({ method: 'GET', query: { username: 'miroo' } });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toEqual({ error: 'User not found' });
  });

  it('예외 발생 시 500을 반환해야 함', async () => {
    (dreamhackUtils.getUserId as jest.Mock).mockRejectedValueOnce(new Error('테스트 에러'));

    const { req, res } = createMocks({ method: 'GET', query: { username: 'weakness' } });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
  });
});
