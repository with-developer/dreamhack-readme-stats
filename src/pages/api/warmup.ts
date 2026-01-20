import { NextApiRequest, NextApiResponse } from 'next';
import { getLastRank } from '../../utils/dreamhack';

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
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
} 