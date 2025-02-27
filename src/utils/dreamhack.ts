import { TgetLastRankResponse, TUserRankingResponse, TuserData, TUserRankingResult } from '../types';

// 네트워크 요청 시간 측정을 위한 래퍼 함수
async function measureFetch(url: string, name: string): Promise<Response> {
  console.time(`🌐 ${name} 네트워크 요청`);
  try {
    const response = await fetch(url);
    return response;
  } finally {
    console.timeEnd(`🌐 ${name} 네트워크 요청`);
  }
}

export async function getLastRank(): Promise<number | null> {
  try {
    console.time('⚙️ getLastRank 함수 전체');
    const response = await measureFetch(
      'https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=1&offset=99999',
      'getLastRank'
    );
    
    console.time('⚙️ getLastRank JSON 파싱');
    const data = await response.json() as TgetLastRankResponse;
    console.timeEnd('⚙️ getLastRank JSON 파싱');
    
    console.timeEnd('⚙️ getLastRank 함수 전체');
    return data.count;
  } catch (error) {
    console.error('Error fetching last rank:', error);
    console.timeEnd('⚙️ getLastRank 함수 전체');
    return null;
  }
}

export async function getUserId(username: string): Promise<number | null> {
  try {
    console.time('⚙️ getUserId 함수 전체');
    const response = await measureFetch(
      `https://dreamhack.io/api/v1/ranking/wargame/?filter=global&limit=100&offset=0&search=${username}&scope=all&name=&category=`,
      'getUserId'
    );
    
    console.time('⚙️ getUserId JSON 파싱');
    const data = await response.json() as TUserRankingResponse;
    console.timeEnd('⚙️ getUserId JSON 파싱');
    
    console.time('⚙️ getUserId 사용자 검색');
    const user = data.results.find((user: TUserRankingResult) => user.nickname === username);
    console.timeEnd('⚙️ getUserId 사용자 검색');
    
    console.timeEnd('⚙️ getUserId 함수 전체');
    return user ? user.id : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    console.timeEnd('⚙️ getUserId 함수 전체');
    return null;
  }
}

export async function getUserData(userId: number): Promise<TuserData | null> {
  try {
    console.time('⚙️ getUserData 함수 전체');
    const response = await measureFetch(
      `https://dreamhack.io/api/v1/user/profile/${userId}/`,
      'getUserData'
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    console.time('⚙️ getUserData JSON 파싱');
    const userData = await response.json() as TuserData;
    console.timeEnd('⚙️ getUserData JSON 파싱');
    
    console.timeEnd('⚙️ getUserData 함수 전체');
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    console.timeEnd('⚙️ getUserData 함수 전체');
    return null;
  }
}

export function calculateTopPercentage(rank: number | null, totalRanks: number | null): string {
  if (!rank || !totalRanks) return 'N/A';
  const percentage = (rank / totalRanks) * 100;
  return percentage.toFixed(2);
} 