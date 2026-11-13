<div align="center">

# Dreamhack Readme Stats

**GitHub README에 Dreamhack 워게임·CTF 통계 카드를 표시하세요**

[![Used By](https://img.shields.io/endpoint?url=https://dreamhack-readme-stats.vercel.app/api/users-count)](https://github.com/search?q=https%3A%2F%2Fdreamhack-readme-stats.vercel.app%2Fapi%2F&type=code)
![GitHub release](https://img.shields.io/github/v/release/with-developer/dreamhack-readme-stats)
![License](https://img.shields.io/github/license/with-developer/dreamhack-readme-stats)

**[메인 페이지에서 내 카드 코드 만들기 →](https://dreamhack-readme-stats.vercel.app)**

<br />

![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness)
![Dreamhack Category Chart](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness)

![Dreamhack CTF](https://dreamhack-readme-stats.vercel.app/api/ctf?username=weakness)
![Dreamhack Recent Solves](https://dreamhack-readme-stats.vercel.app/api/solves?username=weakness)

![Dreamhack Level](https://dreamhack-readme-stats.vercel.app/api/level?username=weakness)

</div>

---

## Quick Start

[메인 페이지](https://dreamhack-readme-stats.vercel.app)에서 닉네임을 입력하고 카드와 테마를 고르면 README에 넣을 코드를 만들어 줍니다. 닉네임에 `&`, `#`, `+`, 공백 같은 특수문자가 있어도 주소에 맞게 인코딩됩니다.

직접 넣으려면 아래 코드에서 `사용자명`을 본인의 Dreamhack 닉네임으로 바꾸세요.

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
```

다른 카드는 [Cards](#cards), 색과 표시 방식은 [Options](#options)를 참고하세요.

---

## Cards

### Wargame Stats

해결한 문제 수, 랭킹, 점수, 상위 %를 보여줍니다.

![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness)

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
```

### Most Solved Categories

분야별 점수 비율을 원형 차트로 보여줍니다. `layout=bars`를 붙이면 분야별 점수·푼 문제 수·분야 순위를 막대로 보여줍니다.

![Dreamhack Category Chart](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness)
![Dreamhack Category Bars](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness&layout=bars)

```markdown
![Dreamhack Categories](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명)
![Dreamhack Categories](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명&layout=bars)
```

### CTF Season

Dreamhack CTF 티어와 레이팅은 시즌마다 새로 시작하므로, 카드는 시즌 하나의 결과(티어, 레이팅, 시즌 순위, 참가 대회 수)를 보여줍니다. 진행 중인 시즌은 `ONGOING`과 다음 티어까지 남은 점수, 끝난 시즌은 `FINAL`과 시즌 중 최고 레이팅을 표시합니다.

`view=graph`는 그 시즌의 대회별 레이팅 그래프, `view=seasons`는 시즌마다 끝났을 때의 티어를 보여줍니다. 시즌은 `season`으로 고를 수 있습니다.

![Dreamhack CTF](https://dreamhack-readme-stats.vercel.app/api/ctf?username=weakness)
![Dreamhack CTF Seasons](https://dreamhack-readme-stats.vercel.app/api/ctf?username=weakness&view=seasons)

```markdown
![Dreamhack CTF](https://dreamhack-readme-stats.vercel.app/api/ctf?username=사용자명)
![Dreamhack CTF](https://dreamhack-readme-stats.vercel.app/api/ctf?username=사용자명&view=graph)
![Dreamhack CTF Seasons](https://dreamhack-readme-stats.vercel.app/api/ctf?username=사용자명&view=seasons)
```

### Recent Solves

최근 푼 문제 5개를 난이도와 함께 보여줍니다. `sort=hardest`를 붙이면 가장 어려운 문제 5개와 각 문제를 푼 사람 수를 보여줍니다.

![Dreamhack Recent Solves](https://dreamhack-readme-stats.vercel.app/api/solves?username=weakness)

```markdown
![Dreamhack Recent Solves](https://dreamhack-readme-stats.vercel.app/api/solves?username=사용자명)
![Dreamhack Hardest Solves](https://dreamhack-readme-stats.vercel.app/api/solves?username=사용자명&sort=hardest)
```

### Level Badge

기여도 레벨, 다음 레벨까지 경험치, 기여도 순위, 워게임 상위 %, 대표 업적을 작은 배지로 보여줍니다.

![Dreamhack Level](https://dreamhack-readme-stats.vercel.app/api/level?username=weakness)

```markdown
![Dreamhack Level](https://dreamhack-readme-stats.vercel.app/api/level?username=사용자명)
```

---

## Options

카드 주소 뒤에 `&옵션=값` 형식으로 붙입니다. 예: `.../api/ctf?username=사용자명&theme=dark&view=graph`

| 옵션 | 카드 | 값 | 설명 |
|------|------|----|------|
| `theme` | 모든 카드 | `light`(기본), `dark`, `dracula`, `tokyonight`, `nord`, `gruvbox`, `transparent` | 카드 색 ([Themes](#themes)) |
| `layout` | Most Solved Categories | `bars` | 막대형 (기본은 원형 차트) |
| `season` | CTF Season | `7` 같은 시즌 번호, `current`(이번 시즌) | 보여줄 시즌. 없으면 이번 시즌 결과가 있을 때 이번 시즌, 없으면 결과가 있는 가장 최근 시즌 (Dreamhack 프로필과 같은 기준) |
| `view` | CTF Season | `graph`, `seasons` | 대회별 레이팅 그래프 / 시즌별 결과 |
| `sort` | Recent Solves | `hardest` | 가장 어려운 문제 순 (기본은 최근 순) |

---

## Themes

<table>
  <tr>
    <td align="center"><code>light</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness" width="360" alt="light 테마" /></td>
    <td align="center"><code>dark</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=dark" width="360" alt="dark 테마" /></td>
  </tr>
  <tr>
    <td align="center"><code>dracula</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=dracula" width="360" alt="dracula 테마" /></td>
    <td align="center"><code>tokyonight</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=tokyonight" width="360" alt="tokyonight 테마" /></td>
  </tr>
  <tr>
    <td align="center"><code>nord</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=nord" width="360" alt="nord 테마" /></td>
    <td align="center"><code>gruvbox</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=gruvbox" width="360" alt="gruvbox 테마" /></td>
  </tr>
  <tr>
    <td align="center"><code>transparent</code><br /><img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=transparent" width="360" alt="transparent 테마" /></td>
    <td></td>
  </tr>
</table>

`transparent`는 배경과 테두리 없이 그려서 README 배경 어디에나 어울립니다. 글자는 라이트·다크 배경 모두에서 읽히도록 중간 회색입니다.

---

## Tips

### GitHub 테마 따라가기

README를 보는 사람의 GitHub 테마(라이트/다크)에 맞춰 카드를 바꾸려면 `<picture>`를 사용하세요. 메인 페이지에서 테마를 `Auto`로 고르면 이 코드를 만들어 줍니다.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=dark" />
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=light" alt="Dreamhack Stats" />
</picture>
```

### 클릭하면 Dreamhack 프로필로 이동

카드를 `<a>`로 감싸세요. `사용자ID`는 프로필 주소 `https://dreamhack.io/users/12345`의 숫자이며, 메인 페이지에서 미리보기하면 자동으로 채워집니다.

```html
<a href="https://dreamhack.io/users/사용자ID">
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명" />
</a>
```

---

## FAQ

**"User not found"가 나와요.**\
닉네임은 대소문자를 구분합니다. 워게임 랭킹에 오른 사용자만 찾을 수 있습니다.

**닉네임에 특수문자가 있어요.**\
`&`, `#`, `+`, 공백 같은 문자는 주소에 맞게 바꿔야 합니다. [메인 페이지](https://dreamhack-readme-stats.vercel.app)에서 코드를 만들면 자동으로 처리됩니다.

**통계가 바로 바뀌지 않아요.**\
GitHub이 README의 이미지를 몇 분 동안 캐시합니다. 잠시 뒤 새로고침하세요.

**CTF 카드에 지난 시즌이 나와요.**\
이번 시즌 대회에 참가하지 않았으면 결과가 있는 가장 최근 시즌을 보여줍니다. 이번 시즌을 고정하려면 `season=current`를 붙이세요.

---

## Local Development

```bash
# 저장소 클론
git clone https://github.com/with-developer/dreamhack-readme-stats.git
cd dreamhack-readme-stats

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REDIS_URL` | No | Redis 연결 URL (닉네임 → 사용자 ID 캐싱용) |
| `GITHUB_TOKEN` | No | GitHub API 토큰 (Used By 배지의 사용자 수 집계용) |

### Tech Stack

- **Framework**: Next.js 14 (TypeScript)
- **Cache**: Redis (Redis Cloud)
- **Deploy**: Vercel

---

## License

MIT License

단, 카드에 임베드되는 JetBrains Mono 폰트(`src/utils/fonts/`)는 [SIL Open Font License 1.1](src/utils/fonts/OFL.txt)을 따릅니다.
