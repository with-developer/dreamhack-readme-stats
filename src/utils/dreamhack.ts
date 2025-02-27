import { TgetLastRankResponse, TUserRankingResponse, TuserData, TUserRankingResult } from '../types';
import { getUserIdFromCache, saveUserIdToCache } from './redis';

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
    
    // 먼저 Redis에서 사용자 ID 조회 시도
    const cachedUserId = await getUserIdFromCache(username);
    if (cachedUserId !== null) {
      console.log(`🚀 Redis 캐시에서 사용자 ID를 찾았습니다: ${username} -> ${cachedUserId}`);
      console.timeEnd('⚙️ getUserId 함수 전체');
      return cachedUserId;
    }
    
    console.log(`🔍 Redis 캐시에서 사용자 ID를 찾지 못했습니다. API 호출을 시도합니다: ${username}`);
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
    
    const userId = user ? user.id : null;
    
    // 사용자 ID를 찾았다면 Redis에 저장
    if (userId !== null) {
      await saveUserIdToCache(username, userId);
    }
    
    console.timeEnd('⚙️ getUserId 함수 전체');
    return userId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    console.timeEnd('⚙️ getUserId 함수 전체');
    return null;
  }
}

export async function getUserData(userId: number, username?: string): Promise<TuserData | null> {
  try {
    console.time('⚙️ getUserData 함수 전체');
    const response = await measureFetch(
      `https://dreamhack.io/api/v1/user/profile/${userId}/`,
      'getUserData'
    );
    
    if (!response.ok) {
      console.log(`⚠️ 사용자 데이터 조회 실패: ${userId}. 상태 코드: ${response.status}`);
      
      // username이 제공되었고, 응답이 404인 경우 (사용자 ID가 유효하지 않음)
      if (username && response.status === 404) {
        console.log(`🔄 캐시된 사용자 ID가 유효하지 않습니다. 새로운 사용자 ID를 조회합니다: ${username}`);
        // Redis 캐시를 무시하고 새로운 사용자 ID 조회
        const newUserId = await getUserId(username);
        
        if (newUserId) {
          console.log(`✅ 새로운 사용자 ID를 찾았습니다: ${username} -> ${newUserId}`);
          // 새로운 사용자 ID로 재귀적으로 다시 호출
          return getUserData(newUserId);
        }
      }
      
      throw new Error(`Failed to fetch user data: ${response.status}`);
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