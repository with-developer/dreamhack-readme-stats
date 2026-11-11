import { TgetLastRankResponse, TSolveRecord, TUserRankingResponse, TuserData, TUserRankingResult } from '../types';
import {
  getUserIdFromCache,
  saveUserIdToCache,
  deleteUserIdFromCache,
  isUserNotFoundCached,
  saveUserNotFoundToCache,
} from './redis';

// Dreamhack이 응답하지 않을 때 요청 하나를 기다리는 최대 시간
const FETCH_TIMEOUT_MS = 10000;
// 랭킹 API는 limit을 100으로 보내도 50개까지만 돌려줌
const SEARCH_PAGE_SIZE = 50;
// 검색 결과는 랭킹 순이라, 흔한 문자열이 들어간 닉네임은 뒤쪽 페이지에 있을 수 있음 (최대 250명 확인)
const SEARCH_MAX_PAGES = 5;
// 실제 닉네임은 이보다 훨씬 짧음
const MAX_USERNAME_LENGTH = 64;

// 네트워크 요청 시간 측정을 위한 래퍼 함수
async function measureFetch(url: string, name: string): Promise<Response> {
  console.time(`🌐 ${name} 네트워크 요청`);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    return response;
  } finally {
    console.timeEnd(`🌐 ${name} 네트워크 요청`);
  }
}

// 랭킹 검색 한 페이지 조회 (닉네임의 &, #, + 등이 쿼리를 깨뜨리지 않도록 인코딩)
async function searchRanking(username: string, offset: number): Promise<TUserRankingResponse> {
  const params = new URLSearchParams({
    filter: 'global',
    limit: String(SEARCH_PAGE_SIZE),
    offset: String(offset),
    search: username,
    scope: 'all',
    name: '',
    category: '',
  });
  const response = await measureFetch(
    `https://dreamhack.io/api/v1/ranking/wargame/?${params}`,
    `getUserId(offset=${offset})`
  );
  if (!response.ok) {
    throw new Error(`Failed to search ranking: ${response.status}`);
  }
  return await response.json() as TUserRankingResponse;
}

function findExactUser(results: TUserRankingResult[], username: string): TUserRankingResult | undefined {
  return results.find((user) => user.nickname === username);
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

// 사용자를 찾지 못하면 null, 검색 자체가 실패하면 예외를 던짐 (오류 카드에서 둘을 구분하기 위함)
export async function getUserId(username: string): Promise<number | null> {
  // 실제 닉네임일 수 없는 긴 값은 Redis 키를 만들거나 Dreamhack을 검색하지 않음
  if (Array.from(username).length > MAX_USERNAME_LENGTH) {
    return null;
  }

  try {
    console.time('⚙️ getUserId 함수 전체');
    
    // 먼저 Redis에서 사용자 ID 조회 시도
    const cachedUserId = await getUserIdFromCache(username);
    if (cachedUserId !== null) {
      console.log(`🚀 Redis 캐시에서 사용자 ID를 찾았습니다: ${username} -> ${cachedUserId}`);
      console.timeEnd('⚙️ getUserId 함수 전체');
      return cachedUserId;
    }
    
    // 최근 검색에서 찾지 못한 닉네임이면 Dreamhack 검색을 반복하지 않음
    if (await isUserNotFoundCached(username)) {
      console.log(`🚫 최근 검색에서 찾지 못한 사용자입니다: ${username}`);
      console.timeEnd('⚙️ getUserId 함수 전체');
      return null;
    }

    console.log(`🔍 Redis 캐시에서 사용자 ID를 찾지 못했습니다. API 호출을 시도합니다: ${username}`);
    const firstPage = await searchRanking(username, 0);
    let user = findExactUser(firstPage.results, username);

    // 첫 페이지에 없고 검색 결과가 더 있으면 다음 페이지들을 동시에 확인
    if (!user && firstPage.count > SEARCH_PAGE_SIZE) {
      const lastOffset = Math.min(firstPage.count, SEARCH_PAGE_SIZE * SEARCH_MAX_PAGES);
      const offsets: number[] = [];
      for (let offset = SEARCH_PAGE_SIZE; offset < lastOffset; offset += SEARCH_PAGE_SIZE) {
        offsets.push(offset);
      }
      // 일부 페이지가 실패해도 성공한 페이지에서 찾으면 사용
      const pages = await Promise.allSettled(offsets.map((offset) => searchRanking(username, offset)));
      const results = pages.flatMap((page) => (page.status === 'fulfilled' ? page.value.results : []));
      user = findExactUser(results, username);

      // 못 찾았는데 실패한 페이지가 있으면 없는 사용자라고 단정할 수 없음
      if (!user && pages.some((page) => page.status === 'rejected')) {
        throw new Error('Failed to search some ranking pages');
      }
    }

    const userId = user ? user.id : null;

    // 찾았으면 ID를, 못 찾았으면 미존재 사실을 Redis에 저장 (검색 자체가 실패한 경우는 저장하지 않음)
    if (userId !== null) {
      await saveUserIdToCache(username, userId);
    } else {
      await saveUserNotFoundToCache(username);
    }

    console.timeEnd('⚙️ getUserId 함수 전체');
    return userId;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    console.timeEnd('⚙️ getUserId 함수 전체');
    throw error;
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
        // 캐시를 지워야 getUserId가 같은 ID를 다시 돌려주지 않고 Dreamhack에서 새로 검색함
        await deleteUserIdFromCache(username);
        const newUserId = await getUserId(username);

        if (newUserId && newUserId !== userId) {
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

export type TSolveSort = 'recent' | 'hardest';

interface TWargameStatsResponse {
  results: {
    solved_at?: string;
    challenge?: { title?: string; tier?: number; tags?: string[]; cnt_solvers?: number };
  }[];
}

// 사용자의 풀이 기록 (최근 순 또는 난이도 높은 순). 조회 실패 시 예외를 던짐
export async function getUserSolves(userId: number, sort: TSolveSort, limit: number): Promise<TSolveRecord[]> {
  const params = new URLSearchParams({
    user_id: String(userId),
    limit: String(limit),
    offset: '0',
    ordering: sort === 'hardest' ? '-challenge__tier' : '-solved_at',
  });
  const response = await measureFetch(`https://dreamhack.io/api/v1/wargame/stats/?${params}`, 'getUserSolves');
  if (!response.ok) {
    throw new Error(`Failed to fetch solves: ${response.status}`);
  }
  const data = await response.json() as TWargameStatsResponse;
  return (data.results || []).slice(0, limit).map((record) => ({
    title: record.challenge?.title ?? '',
    tier: record.challenge?.tier ?? 0,
    tags: record.challenge?.tags ?? [],
    solvedAt: record.solved_at ?? '',
    solvers: record.challenge?.cnt_solvers ?? 0,
  }));
}

export function calculateTopPercentage(rank: number | null, totalRanks: number | null): string {
  if (!rank || !totalRanks) return 'N/A';
  const percentage = (rank / totalRanks) * 100;
  return percentage.toFixed(2);
} 