// 카드 URL의 username 값 인코딩
// &, #, +, 공백, 괄호 등 URL·Markdown을 깨뜨리는 ASCII 문자만 인코딩하고, 한글 등은 README에서 읽기 쉽게 그대로 둠
export function encodeUsername(username: string): string {
  return username.replace(
    /[^A-Za-z0-9\-_.~\u0080-￿]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`
  );
}
