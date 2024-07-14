import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

const app = express();

interface UserData {
  nickname: string;
  contributions: {
    level: number;
    rank: number;
  };
  exp: number;
  total_wargame: number;
  wargame: {
    solved: number;
    rank: number;
    score: number;
  };
  ctf: {
    rank: number;
    tier: string;
    rating: number;
  };
  profile_image: string;
}

interface Stats {
  nickname: string;
  level: number;
  exp: number;
  rank: string;
  rankPercentage: string;
  wargame_solved: number;
  wargame_rank: string;
  wargameRankPercentage: string;
  wargame_score: number;
  ctf_rank?: number;
  ctf_tier?: string;
  ctf_rating?: number;
  profile_image: string;
}

async function getLastRank(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=1&offset=99999'
    );
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching last rank:', error);
    return null;
  }
}

function calculateTopPercentage(rank: number | null, totalRanks: number | null): string {
  if (!rank || !totalRanks) return 'N/A';
  const percentage = (rank / totalRanks) * 100;
  return percentage.toFixed(2);
}

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

    const userData: UserData = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(userResponse.status).json({ error: userData.detail });
    }

    console.log('userData', userData);

    const { nickname, contributions, exp, wargame, ctf, profile_image } = userData;

    const overallTopPercentage = calculateTopPercentage(contributions.rank, lastRank);
    const wargameTopPercentage = calculateTopPercentage(wargame.rank, lastRank);

    const stats: Stats = {
      nickname,
      level: contributions.level,
      exp,
      rank: `${contributions.rank}/${lastRank || 'N/A'}`,
      rankPercentage: overallTopPercentage,
      wargame_solved: userData.total_wargame,
      wargame_rank: `${wargame.rank}/${lastRank || 'N/A'}`,
      wargameRankPercentage: wargameTopPercentage,
      wargame_score: wargame.score,
      // ctf_rank: ctf.rank,
      // ctf_tier: ctf.tier,
      // ctf_rating: ctf.rating,
      profile_image,
    };

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" fill="none">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
    .title { font: 700 18px 'Inter', sans-serif; fill: #ffffff; }
    .weakness { font: 600 24px 'Inter', sans-serif; fill: rgba(255, 255, 255, 0.9); }
    .stat-label { font: 400 14px 'Inter', sans-serif; fill: #6c757d; }
    .stat-value { font: 700 20px 'Inter', sans-serif; fill: #6e45e2; }
    .tier-badge { font: 700 16px 'Inter', sans-serif; fill: #ffffff; }
  </style>
  
  <defs>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6e45e2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#88d3ce;stop-opacity:1" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="0" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.1"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="400" height="200" fill="#ffffff" rx="12" ry="12"/>
  <rect width="400" height="120" fill="url(#headerGradient)"/>
  
  <circle cx="55" cy="60" r="35" fill="rgba(255, 255, 255, 0.2)" filter="url(#dropShadow)"/>
  <text x="55" y="55" class="tier-badge" text-anchor="middle">Top</text>
  <text x="55" y="75" class="tier-badge" text-anchor="middle">${stats.rankPercentage}%</text>
  
  <text x="110" y="50" class="title">Dreamhack wargame stats</text>
  <text x="110" y="85" class="weakness">${stats.nickname}</text>

  <rect x="0" y="120" width="400" height="80" fill="#f8f9fa" rx="0" ry="0"/>
  
  <text x="70" y="150" class="stat-label" text-anchor="middle">Solved</text>
  <text x="70" y="180" class="stat-value" text-anchor="middle">${stats.wargame_solved}</text>
  
  <text x="200" y="150" class="stat-label" text-anchor="middle">Score</text>
  <text x="200" y="180" class="stat-value" text-anchor="middle">${stats.wargame_score}</text>
  
  <text x="330" y="150" class="stat-label" text-anchor="middle">Rank</text>
  <text x="330" y="180" class="stat-value" text-anchor="middle">${stats.wargame_rank}</text>
</svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(svg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

export default app;