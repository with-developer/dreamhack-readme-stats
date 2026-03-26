<div align="center">

# Dreamhack Readme Stats

**GitHub README에 Dreamhack 워게임 통계를 표시하세요**

[![Used By](https://img.shields.io/endpoint?url=https://dreamhack-readme-stats.vercel.app/api/users-count)](https://github.com/search?q=https%3A%2F%2Fdreamhack-readme-stats.vercel.app%2Fapi%2F&type=code)
![GitHub release](https://img.shields.io/github/v/release/with-developer/dreamhack-readme-stats)
![License](https://img.shields.io/github/license/with-developer/dreamhack-readme-stats)

<br />

![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness)

![Dreamhack Category Chart](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness)

</div>

---

## Quick Start

README에 아래 코드를 추가하고 `사용자명`을 본인의 Dreamhack 닉네임으로 변경하세요.

### Wargame Stats

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
```

### Most Solved Categories

```markdown
![Dreamhack Categories](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명)
```

> 💡 클릭 시 Dreamhack 프로필로 이동하게 하려면 HTML 사용:
> ```html
> <a href="https://dreamhack.io/users/사용자명">
>   <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명" />
> </a>
> ```

---

## Themes

`theme` 파라미터로 테마를 변경할 수 있습니다.

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명&theme=dark)
```

| Theme | Wargame Stats | Most Solved Categories |
|-------|---------------|------------------------|
| `light` | ![Stats Light](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=light) | ![Categories Light](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness&theme=light) |
| `dark` | ![Stats Dark](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness&theme=dark) | ![Categories Dark](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=weakness&theme=dark) |

---

## Features

| Feature | Description |
|---------|-------------|
| **Wargame Stats** | 해결한 문제 수, 랭킹, 점수, TOP % 표시 |
| **Category Chart** | 카테고리별 점수 분포를 파이 차트로 시각화 |
| **Themes** | Light/Dark 테마 지원 |
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
