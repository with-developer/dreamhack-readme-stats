import fetch from 'node-fetch';
import { TgetLastRankResponse } from './types';

export async function getLastRank(): Promise<number | null> {
  try {
    const response = await fetch(
      'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=1&offset=99999'
    );
    const data = await response.json() as TgetLastRankResponse;
    return data.count;
  } catch (error) {
    console.error('Error fetching last rank:', error);
    return null;
  }
}

export function calculateTopPercentage(rank: number | null, totalRanks: number | null): string {
  if (!rank || !totalRanks) return 'N/A';
  const percentage = (rank / totalRanks) * 100;
  return percentage.toFixed(2);
}