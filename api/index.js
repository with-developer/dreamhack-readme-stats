import express from 'express';
import fetch from 'node-fetch';

const app = express();

app.get('/api/stats', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const response = await fetch(`https://dreamhack.io/api/v1/user/profile/${username}/`);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail });
    }

    const {
      nickname,
      // level,
      contributions,
      exp,
      // rank,
      wargame,
      ctf,
      profile_image,
      // additional_profile: { introduction, github, twitter, facebook, linkedin },
    } = data;

    const stats = {
      nickname, // 필요
      level: contributions.level, // 필요
      exp,
      rank: contributions.rank, // 필요
      wargame_solved: wargame.solved, //필요
      wargame_rank: wargame.rank, //필요
      wargame_score: wargame.score, //필요
      ctf_rank: ctf.rank, //필요
      ctf_tier: ctf.tier, //필요
      ctf_rating: ctf.rating, //필요
      profile_image, //불필요
      // introduction, //불필요
      // github, //불필요
      // twitter, //불필요
      // facebook, //불필요
      // linkedin, //불필요
    };

    // res.setHeader('Content-Type', 'image/svg+xml');
    // res.setHeader('Cache-Control', 'public, max-age=1800');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195" fill="none">
        <style>
          .header {
            font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
            fill: #2f80ed;
          }
          .stat {
            font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif;
            fill: #333;
          }
          .rank {
            font: 600 14px 'Segoe UI', Ubuntu, Sans-Serif;
            fill: #585858;
          }
          .info {
            font: 400 11px 'Segoe UI', Ubuntu, Sans-Serif;
            fill: #585858;
          }
        </style>
        <rect x="0.5" y="0.5" width="494" height="194" rx="4.5" fill="#FFFEFE" stroke="#E4E2E2"/>
        <image href="${stats.profile_image}" x="20" y="25" height="80" width="80"/>
        <text x="115" y="50" class="header">${stats.nickname} (Level ${stats.level})</text>
        <text x="115" y="75" class="rank">Rank: ${stats.rank}</text>
        <text x="20" y="140" class="stat">Wargame Solved: ${stats.wargame_solved}</text>
        <text x="20" y="160" class="stat">Wargame Rank: ${stats.wargame_rank}</text>
        <text x="20" y="180" class="stat">Wargame Score: ${stats.wargame_score}</text>
        <text x="250" y="140" class="stat">CTF Rank: ${stats.ctf_rank}</text>
        <text x="250" y="160" class="stat">CTF Tier: ${stats.ctf_tier}</text>
        <text x="250" y="180" class="stat">CTF Rating: ${stats.ctf_rating}</text>
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

app.get('/', (req, res) => {
  res.send('Server is running');
});

export default app;