// README에 보여줄 예시 카드를 목업 데이터로 만들어 public/examples/에 저장
// 실행: npm run examples (카드 디자인을 바꾼 뒤 다시 실행해 예시 이미지를 갱신)
import fs from 'fs';
import path from 'path';
import { CARD_TYPES } from '../../src/utils/cardCode';
import { THEME_NAMES } from '../../src/utils/svg';
import { renderExampleCard } from '../../src/utils/exampleCards';

const outDir = path.join(process.cwd(), 'public', 'examples');
fs.mkdirSync(outDir, { recursive: true });

const files: Record<string, string> = {};
// 카드 종류별 light 예시 (파일 이름 = 카드 종류)
for (const card of CARD_TYPES) {
  files[`${card}.svg`] = renderExampleCard(card, 'light');
}
// 테마별 워게임 카드 (light는 stats.svg)
for (const theme of THEME_NAMES) {
  if (theme !== 'light') files[`stats-${theme}.svg`] = renderExampleCard('stats', theme);
}

for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), `${svg.trim()}\n`);
}
console.log(`${Object.keys(files).length} example cards written to ${path.relative(process.cwd(), outDir)}/`);
