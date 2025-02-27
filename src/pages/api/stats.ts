import { NextApiRequest, NextApiResponse } from 'next';
import { Tstats } from '../../types';
import { generateSvg } from '../../utils/generateSvg';
import { 
  getLastRank, 
  calculateTopPercentage, 
  getUserId, 
  getUserData 
} from '../../utils/dreamhack';

// 성능 측정을 위한 유틸리티 함수
const measureTime = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  console.time(`⏱️ ${name}`);
  try {
    return await fn();
  } finally {
    console.timeEnd(`⏱️ ${name}`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.time('⏱️ 전체 API 실행 시간');
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // 개별 API 호출 시간 측정
    const userId = await measureTime('getUserId', () => getUserId(username as string));
    const lastRank = await measureTime('getLastRank', () => getLastRank());

    if (!userId) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return res.status(400).json({ error: 'User not found' });
    }
    if (!lastRank) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return res.status(500).json({ error: 'Failed to fetch last rank' });
    }

    const userData = await measureTime('getUserData', () => getUserData(userId));
    if (!userData) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return res.status(400).json({ error: 'User information cannot be read.' });
    }

    console.time('⏱️ 데이터 가공 및 SVG 생성');
    const {
      nickname,
      wargame,
      total_wargame
    } = userData;

    const wargameTopPercentage = calculateTopPercentage(wargame.rank, lastRank);

    const stats: Tstats = {
      nickname,
      wargame_solved: total_wargame,
      wargame_rank: `${wargame.rank}/${lastRank || 'N/A'}`,
      wargameRankPercentage: wargameTopPercentage,
      wargame_score: wargame.score,
    };

    const svg = generateSvg(stats);
    console.timeEnd('⏱️ 데이터 가공 및 SVG 생성');

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    console.timeEnd('⏱️ 전체 API 실행 시간');
    return res.send(svg);
  } catch (error) {
    console.error(error);
    console.timeEnd('⏱️ 전체 API 실행 시간');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 