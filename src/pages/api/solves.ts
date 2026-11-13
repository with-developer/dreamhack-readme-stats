import { NextApiRequest, NextApiResponse } from 'next';
import { generateSolvesSvg, SOLVES_CARD_ROWS, SOLVES_CARD_TITLES } from '../../utils/generateSolvesSvg';
import { generateErrorSvg, errorCards } from '../../utils/generateErrorSvg';
import { parseTheme, sendSvg } from '../../utils/svg';
import { getUserId, getUserSolves } from '../../utils/dreamhack';

// 처음 조회하는 닉네임은 Dreamhack 검색이 여러 번 필요해 기본 10초를 넘을 수 있음
// (요청당 타임아웃 10초 × 최대 5단계 + 여유, Hobby 플랜 최대값)
export const config = { maxDuration: 60 };

// 최근 풀이 카드 (/api/solves?username=), sort=hardest면 가장 어려운 문제 순
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, theme: themeParam, sort: sortParam } = req.query;
  const theme = parseTheme(themeParam);
  const card = sortParam === 'hardest' ? 'hardest' : 'recent';
  const title = SOLVES_CARD_TITLES[card];

  if (!username || typeof username !== 'string') {
    return sendSvg(res, generateErrorSvg(errorCards.missingUsername(title), theme));
  }

  try {
    const userId = await getUserId(username);
    if (!userId) {
      return sendSvg(res, generateErrorSvg(errorCards.userNotFound(title, username), theme));
    }

    const solves = await getUserSolves(userId, card, SOLVES_CARD_ROWS);
    return sendSvg(res, generateSolvesSvg(card, username, solves, theme));
  } catch (error) {
    console.error(error);
    return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(title), theme));
  }
}
