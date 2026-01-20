// Vercel KV 모킹
const mockStorage = new Map<string, any>();

export const kv = {
  get: jest.fn(async (key: string) => {
    return mockStorage.get(key) || null;
  }),
  set: jest.fn(async (key: string, value: any) => {
    mockStorage.set(key, value);
    return 'OK';
  }),
  del: jest.fn(async (key: string) => {
    mockStorage.delete(key);
    return 1;
  }),
  // 테스트를 위한 추가 메서드
  _reset: () => {
    mockStorage.clear();
  },
  _getMockStorage: () => {
    return mockStorage;
  }
}; 