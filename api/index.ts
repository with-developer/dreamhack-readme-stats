import express, { Request, Response } from 'express';
import { Tstats } from './types';
import { generateSvg } from './generateSvg.js';
import { getLastRank, calculateTopPercentage, getUserId, getUserData } from './utils.js';

const app = express();

app.get('/api/stats', async (req: Request, res: Response) => {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const [userId, lastRank] = await Promise.all([
      getUserId(username),
      getLastRank()
    ]);

    if (!userId) {
      return res.status(400).json({ error: 'User not found' });
    }
    if (!lastRank) {
      return res.status(500).json({ error: 'Failed to fetch last rank' });
    }

    const userData = await getUserData(userId);
    if (!userData) {
      return res.status(400).json({ error: 'User information cannot be read.' });
    }

    console.log('userData', userData);

    const {
      nickname,
      wargame,
      // contributions,
      // exp,
      // profile_image
    } = userData;

    // const overallTopPercentage = calculateTopPercentage(contributions.rank, lastRank);
    const wargameTopPercentage = calculateTopPercentage(wargame.rank, lastRank);

    const stats: Tstats = {
      nickname,
      wargame_solved: userData.total_wargame,
      wargame_rank: `${wargame.rank}/${lastRank || 'N/A'}`,
      wargameRankPercentage: wargameTopPercentage,
      wargame_score: wargame.score,
      // level: contributions.level,
      // exp,
      // rank: `${contributions.rank}/${lastRank || 'N/A'}`,
      // rankPercentage: overallTopPercentage,
      // profile_image,
    };

    const svg = generateSvg(stats);

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(svg);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (_req: Request, res: Response) => {
  return res.send('Server is running');
});

// vercel 서버 웜업을 위한 라우트
app.get('/api/warmup', async (_req: Request, res: Response) => {
  try {
    const lastRank = await getLastRank();
    
    if (!lastRank) {
      return res.status(500).json({ error: 'Failed to fetch last rank' });
    }

    return res.status(200).json({ message: 'Warmup successful', lastRank });
  } catch (error) {
    console.error('Warmup error:', error);
    return res.status(500).json({ error: 'Warmup failed' });
  }
});

export default app;