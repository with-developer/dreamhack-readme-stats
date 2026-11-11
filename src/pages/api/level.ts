import { NextApiRequest, NextApiResponse } from 'next';
import { generateLevelSvg } from '../../utils/generateLevelSvg';
import { generateErrorSvg, errorCards } from '../../utils/generateErrorSvg';
import { parseTheme, sendSvg } from '../../utils/svg';
import { getLastRank, calculateTopPercentage, getUserId, getUserData } from '../../utils/dreamhack';

// 처음 조회하는 닉네임은 Dreamhack 검색이 여러 번 필요해 기본 10초를 넘을 수 있음
// (요청당 타임아웃 10초 × 최대 5단계 + 여유, Hobby 플랜 최대값)
export const config = { maxDuration: 60 };

const CARD_TITLE = 'Dreamhack Level';

// 기여도 레벨 배지 (/api/level?username=)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, theme: themeParam } = req.query;
  const theme = parseTheme(themeParam);

  if (!username || typeof username !== 'string') {
    return sendSvg(res, generateErrorSvg(errorCards.missingUsername(CARD_TITLE), theme));
  }

  try {
    const userId = await getUserId(username);
    if (!userId) {
      return sendSvg(res, generateErrorSvg(errorCards.userNotFound(CARD_TITLE, username), theme));
    }

    // 워게임 상위 %는 보조 정보라, 마지막 순위 조회가 실패해도 배지는 보여줌
    const [userData, lastRank] = await Promise.all([getUserData(userId, username), getLastRank()]);
    if (!userData) {
      return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(CARD_TITLE), theme));
    }

    const { contributions, wargame, representative } = userData;
    const topPercentage = wargame?.rank ? calculateTopPercentage(wargame.rank, lastRank) : 'N/A';

    const svg = generateLevelSvg(
      {
        nickname: userData.nickname,
        level: contributions?.level ?? 0,
        exp: contributions?.exp ?? 0,
        expNeeded: contributions?.exp_needed ?? 0,
        contributionRank: contributions?.rank || null,
        wargameTopPercentage: topPercentage === 'N/A' ? null : topPercentage,
        achievement: representative?.title || null,
      },
      theme
    );
    return sendSvg(res, svg);
  } catch (error) {
    console.error(error);
    return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(CARD_TITLE), theme));
  }
}
