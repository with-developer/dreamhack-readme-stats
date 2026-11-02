import { NextApiRequest, NextApiResponse } from 'next';
import { getUserId } from '../../utils/dreamhack';

// 처음 조회하는 닉네임은 Dreamhack 검색이 여러 번 필요해 기본 10초를 넘을 수 있음
// (요청당 타임아웃 10초 × 최대 5단계 + 여유, Hobby 플랜 최대값)
export const config = { maxDuration: 60 };

// 메인 페이지에서 프로필 링크(숫자 ID 주소)를 만들 때 사용
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const userId = await getUserId(username);
    if (!userId) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      id: userId,
      profileUrl: `https://dreamhack.io/users/${userId}`,
    });
  } catch (error) {
    console.error('Error fetching user id:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
