import { NextApiRequest, NextApiResponse } from 'next';
import { Tstats, Theme } from '../../types';
import { generateStatsSvg } from '../../utils/generateStatsSvg';
import { generateErrorSvg, errorCards } from '../../utils/generateErrorSvg';
import { sendSvg } from '../../utils/svg';
import {
  getLastRank,
  calculateTopPercentage,
  getUserId,
  getUserData
} from '../../utils/dreamhack';

// 처음 조회하는 닉네임은 Dreamhack 검색이 여러 번 필요해 기본 10초를 넘을 수 있음
// (요청당 타임아웃 10초 × 최대 5단계 + 여유, Hobby 플랜 최대값)
export const config = { maxDuration: 60 };

const CARD_TITLE = 'Dreamhack Wargame Stats';

// 성능 측정을 위한 유틸리티 함수
const measureTime = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  console.time(`⏱️ ${name}`);
  try {
    return await fn();
  } finally {
    console.timeEnd(`⏱️ ${name}`);
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, theme: themeParam } = req.query;

  // 테마 파라미터 검증
  const theme: Theme = themeParam === 'dark' ? 'dark' : 'light';

  if (!username || typeof username !== 'string') {
    return sendSvg(res, generateErrorSvg(errorCards.missingUsername(CARD_TITLE), theme));
  }

  console.time('⏱️ 전체 API 실행 시간');
  try {
    // 개별 API 호출 시간 측정
    const userId = await measureTime('getUserId', () => getUserId(username));
    if (!userId) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return sendSvg(res, generateErrorSvg(errorCards.userNotFound(CARD_TITLE, username), theme));
    }

    const lastRank = await measureTime('getLastRank', () => getLastRank());
    if (!lastRank) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(CARD_TITLE), theme));
    }

    // username을 함께 전달하여 캐시된 ID가 유효하지 않을 경우 재시도할 수 있도록 함
    const userData = await measureTime('getUserData', () => getUserData(userId, username));
    if (!userData) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(CARD_TITLE), theme));
    }

    console.time('⏱️ 데이터 가공 및 SVG 생성');
    const {
      nickname,
      wargame,
      total_wargame
    } = userData;

    const wargameTopPercentage = calculateTopPercentage(wargame.rank, lastRank);

    const stats: Tstats = {
      nickname,
      wargame_solved: total_wargame,
      wargame_rank: `${wargame.rank}/${lastRank || 'N/A'}`,
      wargameRankPercentage: wargameTopPercentage,
      wargame_score: wargame.score,
    };

    const svg = generateStatsSvg(stats, theme);
    console.timeEnd('⏱️ 데이터 가공 및 SVG 생성');

    console.timeEnd('⏱️ 전체 API 실행 시간');
    return sendSvg(res, svg);
  } catch (error) {
    console.error(error);
    console.timeEnd('⏱️ 전체 API 실행 시간');
    return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(CARD_TITLE), theme));
  }
}
