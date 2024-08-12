import fetch from 'node-fetch';
import { TgetLastRankResponse, TUserRankingResponse, TuserData } from './types';

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

export async function getUserId(username: string): Promise<number | null> {
  try {
    const response = await fetch(`https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=100&offset=0&search=${username}&scope=all&name=&category=`);
    const data = await response.json() as TUserRankingResponse;
    
    const user = data.results.find(user => user.nickname === username);
    return user ? user.id : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return null;
  }
}

export async function getUserData(userId: number): Promise<TuserData | null> {
  try {
    const response = await fetch(`https://dreamhack.io/api/v1/user/profile/${userId}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    const userData = await response.json() as TuserData;
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export function calculateTopPercentage(rank: number | null, totalRanks: number | null): string {
  if (!rank || !totalRanks) return 'N/A';
  const percentage = (rank / totalRanks) * 100;
  return percentage.toFixed(2);
}