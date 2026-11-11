import { createMocks } from 'node-mocks-http';
import handler from '../../../pages/api/level';
import * as dreamhackUtils from '../../../utils/dreamhack';
import * as generateLevelSvgUtils from '../../../utils/generateLevelSvg';
import { TuserData } from '../../../types';

jest.mock('../../../utils/dreamhack', () => ({
  getUserId: jest.fn(),
  getUserData: jest.fn(),
  getLastRank: jest.fn(),
  calculateTopPercentage: jest.requireActual('../../../utils/dreamhack').calculateTopPercentage,
}));

jest.mock('../../../utils/generateLevelSvg', () => ({
  generateLevelSvg: jest.fn(() => '<svg>Mock Level</svg>'),
}));

const userData: TuserData = {
  nickname: 'weakness',
  contributions: { level: 17, rank: 602, exp: 545, exp_needed: 1230 },
  representative: { title: 'Cloud 9' },
  exp: 0,
  total_wargame: 150,
  wargame: { solved: 133, rank: 533, score: 4835 },
  ctf: { rank: 0, tier: '', rating: 0 },
  profile_image: '',
};

const call = async (query: Record<string, unknown>) => {
  const { req, res } = createMocks({ method: 'GET', query });
  await handler(req, res);
  return res;
};

describe('level API 엔드포인트 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValue(20691);
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValue(userData);
    (dreamhackUtils.getLastRank as jest.Mock).mockResolvedValue(33309);
  });

  it('프로필 값으로 배지를 만들어 SVG로 응답해야 함', async () => {
    const res = await call({ username: 'weakness', theme: 'dracula' });

    expect(res._getStatusCode()).toBe(200);
    expect(res._getHeaders()).toHaveProperty('content-type', 'image/svg+xml');
    expect(res._getData()).toBe('<svg>Mock Level</svg>');
    expect(dreamhackUtils.getUserData).toHaveBeenCalledWith(20691, 'weakness');
    expect(generateLevelSvgUtils.generateLevelSvg).toHaveBeenCalledWith(
      {
        nickname: 'weakness',
        level: 17,
        exp: 545,
        expNeeded: 1230,
        contributionRank: 602,
        wargameTopPercentage: '1.60',
        achievement: 'Cloud 9',
      },
      'dracula'
    );
  });

  it('마지막 순위 조회가 실패하거나 워게임 순위가 없으면 상위 %만 빼고 배지를 보여줘야 함', async () => {
    (dreamhackUtils.getLastRank as jest.Mock).mockResolvedValueOnce(null);
    await call({ username: 'weakness' });
    expect((generateLevelSvgUtils.generateLevelSvg as jest.Mock).mock.calls[0][0].wargameTopPercentage).toBeNull();

    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce({
      ...userData,
      wargame: { ...userData.wargame, rank: 0 },
      contributions: { level: 1, rank: 0 },
      representative: null,
    });
    await call({ username: 'weakness' });
    expect((generateLevelSvgUtils.generateLevelSvg as jest.Mock).mock.calls[1][0]).toMatchObject({
      wargameTopPercentage: null,
      contributionRank: null,
      achievement: null,
      exp: 0,
      expNeeded: 0,
    });
  });

  it('닉네임이 없거나 사용자를 찾지 못하면 안내 카드를 보여줘야 함', async () => {
    let res = await call({});
    expect(res._getData()).toContain('Missing username');

    (dreamhackUtils.getUserId as jest.Mock).mockResolvedValueOnce(null);
    res = await call({ username: 'nobody' });
    expect(res._getData()).toContain('User not found');
    expect(res._getData()).toContain('Dreamhack Level');
  });

  it('프로필 조회가 실패하거나 예외가 나면 오류 카드를 보여줘야 함', async () => {
    (dreamhackUtils.getUserData as jest.Mock).mockResolvedValueOnce(null);
    let res = await call({ username: 'weakness' });
    expect(res._getData()).toContain('Failed to load stats');

    (dreamhackUtils.getUserId as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    res = await call({ username: 'weakness' });
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain('Failed to load stats');
  });
});
