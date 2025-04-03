# Dreamhack Readme Stats

GitHub README 프로필에 표시할 수 있는 Dreamhack 워게임 통계 SVG 생성기입니다.

## 사용 방법

### Markdown

```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
```

### HTML

```html
<a href="https://dreamhack.io/users/사용자명" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명" alt="Dreamhack Stats" />
</a>
```

실제 사용 시에는 `사용자명`을 여러분의 Dreamhack 사용자 이름으로 변경하세요.

## 예시

다음은 실제 렌더링된 결과입니다:

![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness)

마크다운 코드:
```markdown
![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness)
```

HTML 코드:
```html
<a href="https://dreamhack.io/users/weakness" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness" alt="Dreamhack Stats" />
</a>
```

## 기술 스택

- Next.js
- TypeScript
- Node.js
- Redis (캐싱)

## 로컬에서 실행하기

1. 저장소 클론
```
git clone https://github.com/yourusername/dreamhack-readme-stats.git
cd dreamhack-readme-stats
```

2. 의존성 설치
```
npm install
```

3. 개발 서버 실행
```
npm run dev
```

4. 브라우저에서 확인
```
http://localhost:3000
```

## Redis 캐싱 설정

성능 향상을 위해 Redis 캐싱을 사용합니다. 사용자 ID 조회 결과를 캐싱하여 API 응답 시간을 크게 단축합니다.

### 로컬 환경에서 Redis 설정하기

1. `.env.local.example` 파일을 `.env.local`로 복사합니다.
```
cp .env.local.example .env.local
```

2. `.env.local` 파일을 편집하여 Redis 연결 정보를 설정합니다.

Redis 연결은 두 가지 방법으로 설정할 수 있습니다:

#### 방법 1: REDIS_URL 사용 (권장)
```
REDIS_URL=redis://username:password@host:port
```

#### 방법 2: 개별 설정 사용
```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your_password
REDIS_TLS=false
```

### Redis 서비스 제공업체

다음과 같은 Redis 서비스를 사용할 수 있습니다:

- [Upstash](https://upstash.com/) - 서버리스 Redis (무료 티어 제공)
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/) - 관리형 Redis 서비스
- 로컬 Redis 서버

### Redis 없이 실행하기

Redis 설정이 없어도 애플리케이션은 정상적으로 작동합니다. 다만, 캐싱 기능이 비활성화되어 모든 요청이 Dreamhack API를 직접 호출하게 됩니다.