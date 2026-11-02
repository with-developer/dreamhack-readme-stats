import Redis from 'ioredis';

// Redis 클라이언트 초기화 (환경 변수가 설정된 경우에만)
let redis: Redis | null = null;

// 테스트 환경인지 확인
const isTestEnvironment = process.env.NODE_ENV === 'test';

try {
  // 테스트 환경이 아니고 Redis URL 또는 호스트가 설정된 경우에만 실제 Redis 클라이언트 생성
  if (!isTestEnvironment && (process.env.REDIS_URL || process.env.REDIS_HOST)) {
    if (process.env.REDIS_URL) {
      // REDIS_URL이 설정된 경우 URL로 연결
      console.log('🔄 REDIS_URL을 사용하여 Redis 서버에 연결합니다.');
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3, // 재시도 횟수 제한
        retryStrategy: (times) => {
          // 3번 이상 재시도하지 않음
          if (times > 3) {
            console.log('❌ Redis 연결 재시도 횟수 초과, 연결 중단');
            return null; // 재시도 중단
          }
          return Math.min(times * 100, 3000); // 지수 백오프 (최대 3초)
        },
        connectTimeout: 5000, // 연결 타임아웃 5초
      });
    } else {
      // 개별 환경 변수로 연결
      console.log('🔄 개별 환경 변수를 사용하여 Redis 서버에 연결합니다.');
      redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USERNAME,
        tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
        maxRetriesPerRequest: 3, // 재시도 횟수 제한
        retryStrategy: (times) => {
          // 3번 이상 재시도하지 않음
          if (times > 3) {
            console.log('❌ Redis 연결 재시도 횟수 초과, 연결 중단');
            return null; // 재시도 중단
          }
          return Math.min(times * 100, 3000); // 지수 백오프 (최대 3초)
        },
        connectTimeout: 5000, // 연결 타임아웃 5초
      });
    }

    // Redis 연결 상태 확인
    redis.on('connect', () => {
      console.log('✅ Redis 서버에 연결되었습니다.');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis 연결 오류:', err);
      // 심각한 오류 발생 시 Redis 클라이언트 비활성화
      if (err instanceof Error && 'code' in err && (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT')) {
        console.log('⚠️ Redis 서버에 연결할 수 없어 캐싱 기능이 비활성화됩니다.');
        redis = null;
      }
    });
  } else if (!isTestEnvironment) {
    console.log('⚠️ Redis 환경 변수(REDIS_URL 또는 REDIS_HOST)가 설정되지 않아 캐싱 기능이 비활성화됩니다.');
  }
} catch (error) {
  console.error('❌ Redis 클라이언트 초기화 오류:', error);
  redis = null;
}

// Redis에 사용자 ID 저장
export async function saveUserIdToCache(username: string, userId: number): Promise<void> {
  // Redis 클라이언트가 없으면 아무 작업도 하지 않음
  if (!redis) return;
  
  try {
    await redis.set(`userId:${username}`, userId);
    // 동시에 실행된 다른 검색이 남긴 미존재 기록이 404 재시도를 막지 않도록 함께 삭제
    await redis.del(`userNotFound:${username}`);
    console.log(`✅ Redis에 사용자 ID 저장 완료: ${username} -> ${userId}`);
  } catch (error) {
    console.error('Redis에 사용자 ID 저장 실패:', error);
  }
}

// Redis에서 사용자 ID 조회
export async function getUserIdFromCache(username: string): Promise<number | null> {
  // Redis 클라이언트가 없으면 null 반환
  if (!redis) return null;
  
  try {
    const userId = await redis.get(`userId:${username}`);
    if (userId) {
      console.log(`✅ Redis에서 사용자 ID 조회 성공: ${username} -> ${userId}`);
      return parseInt(userId);
    } else {
      console.log(`❌ Redis에서 사용자 ID 조회 실패: ${username}`);
      return null;
    }
  } catch (error) {
    console.error('Redis에서 사용자 ID 조회 실패:', error);
    return null;
  }
}

// Redis에서 사용자 ID 삭제 (캐시된 ID가 더 이상 유효하지 않을 때)
export async function deleteUserIdFromCache(username: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(`userId:${username}`);
    console.log(`🗑️ Redis에서 사용자 ID 삭제 완료: ${username}`);
  } catch (error) {
    console.error('Redis에서 사용자 ID 삭제 실패:', error);
  }
}

// 찾지 못한 닉네임을 잠시 기록해, README가 조회될 때마다 느린 Dreamhack 검색을 반복하지 않도록 함
const USER_NOT_FOUND_TTL_SECONDS = 600;

export async function saveUserNotFoundToCache(username: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(`userNotFound:${username}`, '1', 'EX', USER_NOT_FOUND_TTL_SECONDS);
    console.log(`✅ Redis에 미존재 사용자 저장 완료: ${username}`);
  } catch (error) {
    console.error('Redis에 미존재 사용자 저장 실패:', error);
  }
}

export async function isUserNotFoundCached(username: string): Promise<boolean> {
  if (!redis) return false;

  try {
    return (await redis.get(`userNotFound:${username}`)) !== null;
  } catch (error) {
    console.error('Redis에서 미존재 사용자 조회 실패:', error);
    return false;
  }
}

// 테스트를 위한 Redis 클라이언트 설정 함수
export function __setRedisClientForTesting(client: Redis | null): void {
  if (isTestEnvironment) {
    redis = client;
  }
} 