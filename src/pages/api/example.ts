import { NextApiRequest, NextApiResponse } from 'next';
import { CARD_TYPES, CardType } from '../../utils/cardCode';
import { parseTheme } from '../../utils/svg';
import { renderExampleCard } from '../../utils/exampleCards';

// 메인 페이지에서 닉네임을 넣기 전에 보여줄 예시 카드 (목업 데이터, Dreamhack 조회 없음)
// /api/example?card=ctf-graph&theme=dracula
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { card: cardParam, theme: themeParam } = req.query;
  const card: CardType = typeof cardParam === 'string' && (CARD_TYPES as string[]).includes(cardParam)
    ? (cardParam as CardType)
    : 'stats';

  res.setHeader('Content-Type', 'image/svg+xml');
  // 같은 주소는 항상 같은 카드라 하루 동안 캐시
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res.status(200).send(renderExampleCard(card, parseTheme(themeParam)));
}
