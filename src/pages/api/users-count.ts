import { NextApiRequest, NextApiResponse } from 'next';

interface SearchItem {
  repository: {
    owner: {
      login: string;
    };
  };
}

interface SearchResponse {
  total_count: number;
  items: SearchItem[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  try {
    const query = encodeURIComponent('"dreamhack-readme-stats.vercel.app/api/" in:file filename:README.md');
    const response = await fetch(
      `https://api.github.com/search/code?q=${query}&per_page=100`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);
      return res.status(response.status).json({ error: 'GitHub API error' });
    }

    const data: SearchResponse = await response.json();

    // 고유 사용자 수 계산
    const uniqueUsers = new Set(
      data.items.map(item => item.repository.owner.login)
    );
    const count = uniqueUsers.size;

    // shields.io endpoint format
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).json({
      schemaVersion: 1,
      label: 'users',
      message: String(count),
      color: 'blue'
    });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
