// 카드 글꼴(영문·숫자·기호만 넣은 JetBrains Mono, 한 글자 = 글꼴 크기의 0.6배)에 없는 글자는
// 보는 사람 PC의 대체 글꼴로 그려짐. 영문 한 글자를 1로 볼 때 대체 글꼴의 대략적인 폭:
// 한글 1.5 (Apple SD Gothic Neo 약 0.86em, Noto Sans KR 약 0.92em), 한자·가나·전각 1.7 (약 1em), 이모지 2
function charWidth(char: string): number {
  const c = char.codePointAt(0) ?? 0;
  if ((c >= 0x1100 && c <= 0x115f) || (c >= 0x3130 && c <= 0x318f) || (c >= 0xac00 && c <= 0xd7a3)) return 1.5; // 한글
  if ((c >= 0x1f300 && c <= 0x1faff) || (c >= 0x2600 && c <= 0x27bf)) return 2; // 이모지·기호
  if (
    (c >= 0x2e80 && c <= 0xa4cf) || // CJK 부수·기호·한자·가나
    (c >= 0xf900 && c <= 0xfaff) || // CJK 호환 한자
    (c >= 0xfe30 && c <= 0xfe4f) || // CJK 호환 형태
    (c >= 0xff00 && c <= 0xff60) || // 전각 문자
    (c >= 0xffe0 && c <= 0xffe6) ||
    (c >= 0x20000 && c <= 0x3fffd) // CJK 확장 한자
  ) return 1.7;
  return 1;
}

// 영문 한 글자를 1로 센 표시 폭
export function textWidth(value: string): number {
  return Array.from(value).reduce((sum, char) => sum + charWidth(char), 0);
}

// 표시 폭이 maxWidth를 넘으면 끝을 '…'로 줄임 ('…'도 한 칸으로 셈)
export function truncateToWidth(value: string, maxWidth: number): string {
  if (textWidth(value) <= maxWidth) return value;
  let width = 0;
  let result = '';
  for (const char of Array.from(value)) {
    const w = charWidth(char);
    if (width + w > maxWidth - 1) break;
    result += char;
    width += w;
  }
  // 잘린 끝에 남은 공백은 지우고 …를 붙임 ('세계정복이 꿈인 …' → '세계정복이 꿈인…')
  return `${result.replace(/\s+$/, '')}…`;
}
