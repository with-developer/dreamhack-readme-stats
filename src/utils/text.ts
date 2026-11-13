// 카드 글꼴(영문·숫자·기호만 넣은 JetBrains Mono)에 없는 한글·한자·전각 문자·이모지는
// 보는 사람 PC의 대체 글꼴로 그려져 폭이 영문 한 글자의 약 두 배가 됨
function isWide(codePoint: number): boolean {
  return (
    (codePoint >= 0x1100 && codePoint <= 0x115f) || // 한글 자모
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf) || // CJK 부수·기호·한자
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) || // 한글 음절
    (codePoint >= 0xf900 && codePoint <= 0xfaff) || // CJK 호환 한자
    (codePoint >= 0xfe30 && codePoint <= 0xfe4f) || // CJK 호환 형태
    (codePoint >= 0xff00 && codePoint <= 0xff60) || // 전각 문자
    (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
    (codePoint >= 0x1f300 && codePoint <= 0x1faff) || // 이모지
    (codePoint >= 0x20000 && codePoint <= 0x3fffd) // CJK 확장 한자
  );
}

function charWidth(char: string, wideWidth: number): number {
  return isWide(char.codePointAt(0) ?? 0) ? wideWidth : 1;
}

// 영문 한 글자를 1로 센 표시 폭 (wideWidth: 한글 등 넓은 글자 한 자의 폭, 기본은 넉넉하게 2)
export function textWidth(value: string, wideWidth = 2): number {
  return Array.from(value).reduce((sum, char) => sum + charWidth(char, wideWidth), 0);
}

// 표시 폭이 maxWidth를 넘으면 끝을 '…'로 줄임 ('…'도 한 칸으로 셈)
export function truncateToWidth(value: string, maxWidth: number, wideWidth = 2): string {
  if (textWidth(value, wideWidth) <= maxWidth) return value;
  let width = 0;
  let result = '';
  for (const char of Array.from(value)) {
    const w = charWidth(char, wideWidth);
    if (width + w > maxWidth - 1) break;
    result += char;
    width += w;
  }
  return `${result}…`;
}
