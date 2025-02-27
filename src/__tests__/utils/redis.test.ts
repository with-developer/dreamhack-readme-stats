import { saveUserIdToCache, getUserIdFromCache, __setRedisClientForTesting } from '../../utils/redis';
import Redis from 'ioredis';

// 테스트 환경 설정 (process.env.NODE_ENV는 jest에 의해 'test'로 설정됨)
// NODE_ENV를 직접 설정하지 않고 jest.mock을 사용

// Redis 모킹
jest.mock('ioredis');

// 모킹된 Redis 인스턴스 생성
const mockRedis = new Redis() as jest.Mocked<Redis>;
mockRedis.get = jest.fn();
mockRedis.set = jest.fn();

// 테스트용 Redis 클라이언트 설정
beforeAll(() => {
  __setRedisClientForTesting(mockRedis);
});

describe('Redis 유틸리티 함수 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  describe('saveUserIdToCache 함수', () => {
    it('사용자 ID를 Redis에 성공적으로 저장해야 함', async () => {
      mockRedis.set.mockResolvedValueOnce('OK');

      await saveUserIdToCache('testuser', 12345);
      
      expect(mockRedis.set).toHaveBeenCalledWith('userId:testuser', 12345);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Redis에 사용자 ID 저장 완료'));
    });

    it('예외 발생 시 오류를 기록해야 함', async () => {
      const mockError = new Error('Redis 연결 오류');
      mockRedis.set.mockRejectedValueOnce(mockError);

      await saveUserIdToCache('testuser', 12345);
      
      expect(console.error).toHaveBeenCalledWith('Redis에 사용자 ID 저장 실패:', mockError);
    });
  });

  describe('getUserIdFromCache 함수', () => {
    it('Redis에서 사용자 ID를 성공적으로 가져와야 함', async () => {
      mockRedis.get.mockResolvedValueOnce('12345');

      const result = await getUserIdFromCache('testuser');
      
      expect(mockRedis.get).toHaveBeenCalledWith('userId:testuser');
      expect(result).toBe(12345);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Redis에서 사용자 ID 조회 성공'));
    });

    it('사용자 ID가 없을 경우 null을 반환해야 함', async () => {
      mockRedis.get.mockResolvedValueOnce(null);

      const result = await getUserIdFromCache('nonexistentuser');
      
      expect(mockRedis.get).toHaveBeenCalledWith('userId:nonexistentuser');
      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Redis에서 사용자 ID 조회 실패'));
    });

    it('예외 발생 시 null을 반환하고 오류를 기록해야 함', async () => {
      const mockError = new Error('Redis 연결 오류');
      mockRedis.get.mockRejectedValueOnce(mockError);

      const result = await getUserIdFromCache('testuser');
      
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Redis에서 사용자 ID 조회 실패:', mockError);
    });
  });
}); 