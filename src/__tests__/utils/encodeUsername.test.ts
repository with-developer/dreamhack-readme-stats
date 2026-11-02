import { encodeUsername } from '../../utils/encodeUsername';

describe('encodeUsername 함수 테스트', () => {
  it('영문, 숫자, 한글은 그대로 두어야 함', () => {
    expect(encodeUsername('weakness')).toBe('weakness');
    expect(encodeUsername('꿈나라역1번출구')).toBe('꿈나라역1번출구');
  });

  it('URL 쿼리를 깨뜨리는 문자를 인코딩해야 함', () => {
    expect(encodeUsername('p&p')).toBe('p%26p');
    expect(encodeUsername('#7851A9')).toBe('%237851A9');
    expect(encodeUsername('+__+')).toBe('%2B__%2B');
    expect(encodeUsername('포카리에2드%')).toBe('포카리에2드%25');
  });

  it('Markdown 링크를 깨뜨리는 공백과 괄호를 인코딩해야 함', () => {
    expect(encodeUsername('teman ahok :)')).toBe('teman%20ahok%20%3A%29');
    expect(encodeUsername('김민욱(me2nuk)')).toBe('김민욱%28me2nuk%29');
  });

  it('HTML 속성을 깨뜨리는 따옴표와 꺾쇠를 인코딩해야 함', () => {
    expect(encodeUsername(`system("/bin/sh")<'>`)).toBe('system%28%22%2Fbin%2Fsh%22%29%3C%27%3E');
  });

  it('인코딩한 값을 디코딩하면 원래 닉네임이 되어야 함', () => {
    for (const nickname of ['p&p', '[ >_+ ] 50G,GEEK', `/2/-\\|)![]/-\\('|'!|/[-`, '로봇 시대의 마지막 희망 [W']) {
      expect(decodeURIComponent(encodeUsername(nickname))).toBe(nickname);
    }
  });
});
