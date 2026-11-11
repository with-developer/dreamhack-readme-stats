import { NextApiRequest, NextApiResponse } from 'next';
import { TCtfSeason, TCtfSeasonResult, TCtfSeasonSummary } from '../../types';
import {
  CTF_CARD_TITLE,
  generateCtfEmptySvg,
  generateCtfGraphSvg,
  generateCtfHistorySvg,
  generateCtfSeasonSvg,
} from '../../utils/generateCtfSvg';
import { generateErrorSvg, errorCards } from '../../utils/generateErrorSvg';
import { parseTheme, sendSvg } from '../../utils/svg';
import {
  getCtfSeasonHistory,
  getCtfSeasonResult,
  getCtfSeasons,
  getCurrentCtfSeason,
  getUserId,
} from '../../utils/dreamhack';

// 처음 조회하는 닉네임은 Dreamhack 검색이 여러 번 필요해 기본 10초를 넘을 수 있음
// (요청당 타임아웃 10초 × 최대 5단계 + 여유, Hobby 플랜 최대값)
export const config = { maxDuration: 60 };

type TSeasonParam =
  | { kind: 'default' }
  | { kind: 'current' }
  | { kind: 'number'; season: number }
  | { kind: 'invalid'; raw: string };

// season 값: 없으면 기본(이번 시즌 결과가 있으면 이번 시즌, 없으면 결과가 있는 가장 최근 시즌), current, 숫자
export function parseSeasonParam(value: unknown): TSeasonParam {
  if (value === undefined || value === '') return { kind: 'default' };
  if (typeof value !== 'string') return { kind: 'invalid', raw: String(value) };
  if (value === 'current') return { kind: 'current' };
  if (/^\d{1,3}$/.test(value) && Number(value) > 0) return { kind: 'number', season: Number(value) };
  return { kind: 'invalid', raw: value };
}

function isLive(seasons: TCtfSeason[], season: number, current: number | null, now: Date): boolean {
  const info = seasons.find((item) => item.number === season);
  return season === current && !!info && now.getTime() <= new Date(info.endsAt).getTime();
}

// 시즌별 결과 목록만 있고 시즌 상세 조회가 비어 있을 때 쓰는 값 (순위·대회 수는 모름)
function summaryToResult(summary: TCtfSeasonSummary): TCtfSeasonResult {
  return { ...summary, rank: 0, participants: 0, contests: 0, rounds: [] };
}

// CTF 시즌 카드 (/api/ctf?username=), view=graph면 대회별 레이팅 그래프, view=seasons면 시즌별 결과
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, theme: themeParam, season: seasonParam, view: viewParam } = req.query;
  const theme = parseTheme(themeParam);
  const view = viewParam === 'graph' || viewParam === 'seasons' ? viewParam : 'basic';

  if (!username || typeof username !== 'string') {
    return sendSvg(res, generateErrorSvg(errorCards.missingUsername(CTF_CARD_TITLE), theme));
  }

  const season = parseSeasonParam(seasonParam);
  if (season.kind === 'invalid') {
    return sendSvg(res, generateErrorSvg(errorCards.invalidSeason(CTF_CARD_TITLE, season.raw), theme));
  }

  try {
    const userId = await getUserId(username);
    if (!userId) {
      return sendSvg(res, generateErrorSvg(errorCards.userNotFound(CTF_CARD_TITLE, username), theme));
    }

    const now = new Date();
    const seasons = await getCtfSeasons();
    const current = getCurrentCtfSeason(seasons, now);

    if (view === 'seasons') {
      const [history, currentResult] = await Promise.all([
        getCtfSeasonHistory(userId),
        current ? getCtfSeasonResult(userId, current) : Promise.resolve(null),
      ]);
      const points: (TCtfSeasonSummary & { live?: boolean })[] = history.filter((item) => item.season !== current);
      if (currentResult) {
        points.push({
          season: currentResult.season,
          tier: currentResult.tier,
          tierClass: currentResult.tierClass,
          rating: currentResult.rating,
          live: isLive(seasons, currentResult.season, current, now),
        });
      }
      if (points.length === 0) {
        return sendSvg(res, generateCtfEmptySvg(username, null, false, null, theme));
      }
      return sendSvg(res, generateCtfHistorySvg(username, points, theme));
    }

    let target: number | null;
    if (season.kind === 'number') {
      if (!seasons.some((item) => item.number === season.season)) {
        const latest = seasons.length ? seasons[seasons.length - 1].number : null;
        return sendSvg(res, generateErrorSvg(errorCards.seasonNotFound(CTF_CARD_TITLE, season.season, latest), theme));
      }
      target = season.season;
    } else {
      target = current;
    }

    let result = target ? await getCtfSeasonResult(userId, target) : null;

    if (!result) {
      const history = await getCtfSeasonHistory(userId);
      const lastPlayed = history.filter((item) => item.season !== target).pop() ?? null;

      // 기본 카드는 이번 시즌에 참가하지 않았으면 결과가 있는 가장 최근 시즌을 보여줌 (Dreamhack 프로필과 같은 기준)
      if (season.kind === 'default' && lastPlayed) {
        target = lastPlayed.season;
        result = (await getCtfSeasonResult(userId, target)) ?? summaryToResult(lastPlayed);
      } else {
        const showSeason = season.kind === 'default' ? null : target;
        const live = showSeason !== null && isLive(seasons, showSeason, current, now);
        return sendSvg(res, generateCtfEmptySvg(username, showSeason, live, lastPlayed, theme));
      }
    }

    const live = isLive(seasons, result.season, current, now);
    const svg = view === 'graph'
      ? generateCtfGraphSvg(username, result, live, theme)
      : generateCtfSeasonSvg(username, result, live, theme);
    return sendSvg(res, svg);
  } catch (error) {
    console.error(error);
    return sendSvg(res, generateErrorSvg(errorCards.fetchFailed(CTF_CARD_TITLE), theme));
  }
}
