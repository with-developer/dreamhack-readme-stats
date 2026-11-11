<div align="center">

# Dreamhack Readme Stats

**GitHub README에 Dreamhack 워게임 통계를 표시하세요**

[![Used By](https://img.shields.io/endpoint?url=https://dreamhack-readme-stats.vercel.app/api/users-count)](https://github.com/search?q=https%3A%2F%2Fdreamhack-readme-stats.vercel.app%2Fapi%2F&type=code)
![GitHub release](https://img.shields.io/github/v/release/with-developer/dreamhack-readme-stats)
![License](https://img.shields.io/github/license/with-developer/dreamhack-readme-stats)

<br />

![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness)

![Dreamhack Category Chart](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness)

![Dreamhack CTF](https://dreamhack-readme-stats.vercel.app/api/ctf?username=weakness)
![Dreamhack Recent Solves](https://dreamhack-readme-stats.vercel.app/api/solves?username=weakness)

![Dreamhack Level](https://dreamhack-readme-stats.vercel.app/api/level?username=weakness)

</div>

---

## Quick Start

README에 아래 코드를 추가하고 `사용자명`을 본인의 Dreamhack 닉네임으로 변경하세요.
닉네임에 `&`, `#`, `+`, 공백 같은 특수문자가 있다면 [메인 페이지](https://dreamhack-readme-stats.vercel.app)에서 코드를 생성하세요. URL에 맞게 자동으로 인코딩됩니다.

### Wargame Stats

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
```

### Most Solved Categories

```markdown
![Dreamhack Categories](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명)
```

`&layout=bars`를 붙이면 분야별 점수·푼 문제 수·분야 순위를 막대로 보여줍니다.

### CTF Season

```markdown
![Dreamhack CTF](https://dreamhack-readme-stats.vercel.app/api/ctf?username=사용자명)
```

Dreamhack CTF 티어와 레이팅은 시즌마다 새로 시작하므로, 카드는 시즌 하나의 결과를 보여줍니다.

- 옵션이 없으면 이번 시즌 결과가 있을 때는 이번 시즌, 없으면 결과가 있는 가장 최근 시즌을 보여줍니다 (Dreamhack 프로필과 같은 기준).
- `&season=7`처럼 시즌 번호를, `&season=current`로 이번 시즌을 고를 수 있습니다.
- `&view=graph`는 그 시즌의 대회별 레이팅 그래프, `&view=seasons`는 시즌마다 끝났을 때의 티어를 보여줍니다.

### Recent Solves

```markdown
![Dreamhack Recent Solves](https://dreamhack-readme-stats.vercel.app/api/solves?username=사용자명)
```

최근 푼 문제 5개를 난이도와 함께 보여줍니다. `&sort=hardest`를 붙이면 가장 어려운 문제 5개와 각 문제를 푼 사람 수를 보여줍니다.

### Level Badge

```markdown
![Dreamhack Level](https://dreamhack-readme-stats.vercel.app/api/level?username=사용자명)
```

기여도 레벨, 다음 레벨까지 경험치, 기여도 순위, 워게임 상위 %, 대표 업적을 작은 배지로 보여줍니다.

> 💡 클릭 시 Dreamhack 프로필로 이동하게 하려면 HTML 사용 (`사용자ID`는 프로필 주소 `https://dreamhack.io/users/12345`의 숫자이며, 메인 페이지에서 미리보기하면 자동으로 채워집니다):
> ```html
> <a href="https://dreamhack.io/users/사용자ID">
>   <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명" />
> </a>
> ```

---

## Themes

모든 카드에서 `theme` 파라미터로 테마를 변경할 수 있습니다.

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=dark)
```

| Theme | Wargame Stats | Most Solved Categories |
|-------|---------------|------------------------|
| `light` | ![Stats Light](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=light) | ![Categories Light](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness&theme=light) |
| `dark` | ![Stats Dark](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=dark) | ![Categories Dark](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness&theme=dark) |
| `dracula` | ![Stats Dracula](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=dracula) | |
| `tokyonight` | ![Stats Tokyo Night](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=tokyonight) | |
| `nord` | ![Stats Nord](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=nord) | |
| `gruvbox` | ![Stats Gruvbox](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=gruvbox) | |
| `transparent` | ![Stats Transparent](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=transparent) | |

`transparent`는 배경과 테두리 없이 그려서 README 배경 어디에나 어울립니다. 글자는 라이트·다크 배경 모두에서 읽히도록 중간 회색입니다.

### GitHub 테마 따라가기 (Auto)

README를 보는 사람의 GitHub 테마(라이트/다크)에 맞춰 카드를 바꾸려면 `<picture>`를 사용하세요. [메인 페이지](https://dreamhack-readme-stats.vercel.app)에서 테마를 `Auto`로 고르면 이 코드를 만들어 줍니다.

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=dark" />
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=light" alt="Dreamhack Stats" />
</picture>
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Wargame Stats** | 해결한 문제 수, 랭킹, 점수, TOP % 표시 |
| **Category Chart** | 카테고리별 점수 분포를 파이 차트 또는 막대(`layout=bars`)로 시각화 |
| **CTF Season** | 시즌별 CTF 티어·레이팅·시즌 순위, 대회별 레이팅 그래프, 시즌별 결과 |
| **Recent Solves** | 최근 푼 문제 또는 가장 어려운 문제 5개 |
| **Level Badge** | 기여도 레벨·경험치·순위와 대표 업적 |
| **Themes** | Light/Dark 외 Dracula, Tokyo Night, Nord, Gruvbox, Transparent 테마와 GitHub 테마 자동 전환 |
| **Auto Update** | 실시간으로 최신 통계 반영 |
| **Caching** | Redis 캐싱으로 빠른 응답 속도 |

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
| `REDIS_URL` | No | Redis 연결 URL (캐싱용) |
| `GITHUB_TOKEN` | No | GitHub API 토큰 (사용자 수 집계용) |

---

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Cache**: Redis (Upstash)
- **Deploy**: Vercel

---

## License

MIT License

단, 카드에 임베드되는 JetBrains Mono 폰트(`src/utils/fonts/`)는 [SIL Open Font License 1.1](src/utils/fonts/OFL.txt)을 따릅니다.
