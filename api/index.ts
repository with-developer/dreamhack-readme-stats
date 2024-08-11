import express, { Request, Response } from 'express';
import { TuserData, Tstats } from './types';
import fetch from 'node-fetch';
import { generateSvg } from './generateSvg.js';
import { getLastRank, calculateTopPercentage } from './utils.js';

const app = express();

app.get('/api/stats', async (req: Request, res: Response) => {
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const [userResponse, lastRank] = await Promise.all([
      fetch(`https://dreamhack.io/api/v1/user/profile/${username}/`),
      getLastRank(),
    ]);

    const userData = await userResponse.json() as TuserData;

    if (!userResponse.ok) {
      return res.status(400).json({ error: 'User information cannot be read.' });
    }

    console.log('userData', userData);

    const { nickname, contributions, exp, wargame, profile_image } = userData;

    const overallTopPercentage = calculateTopPercentage(contributions.rank, lastRank);
    const wargameTopPercentage = calculateTopPercentage(wargame.rank, lastRank);

    const stats: Tstats = {
      nickname,
      level: contributions.level,
      exp,
      rank: `${contributions.rank}/${lastRank || 'N/A'}`,
      rankPercentage: overallTopPercentage,
      wargame_solved: userData.total_wargame,
      wargame_rank: `${wargame.rank}/${lastRank || 'N/A'}`,
      wargameRankPercentage: wargameTopPercentage,
      wargame_score: wargame.score,
      profile_image,
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

export default app;