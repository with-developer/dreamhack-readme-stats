// ioredis 모킹
const mockStorage = new Map<string, string>();

class MockRedis {
  constructor(options?: any) {
    // 생성자 옵션 무시
  }

  // 이벤트 리스너 메서드
  on(event: string, callback: Function): this {
    if (event === 'connect') {
      // 연결 성공 이벤트 즉시 호출
      setTimeout(() => callback(), 0);
    }
    return this;
  }

  // Redis 명령어 구현
  async get(key: string): Promise<string | null> {
    return mockStorage.get(key) || null;
  }

  async set(key: string, value: any): Promise<string> {
    mockStorage.set(key, String(value));
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = mockStorage.has(key);
    mockStorage.delete(key);
    return existed ? 1 : 0;
  }

  // 테스트를 위한 추가 메서드
  _reset(): void {
    mockStorage.clear();
  }

  _getMockStorage(): Map<string, string> {
    return mockStorage;
  }
}

// 모든 인스턴스가 동일한 스토리지를 공유하도록 설정
MockRedis.prototype._reset = function(): void {
  mockStorage.clear();
};

MockRedis.prototype._getMockStorage = function(): Map<string, string> {
  return mockStorage;
};

export default MockRedis; 