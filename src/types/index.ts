// 프로필 API의 분야별 워게임 기록
export interface TCategoryEntry {
  score: number;
  rank: number;
  solved_cnt?: number;
}

export interface TuserData {
  nickname: string;
  contributions: {
    level: number;
    rank: number;
    // 현재 레벨에서 쌓은 경험치와 다음 레벨까지 필요한 경험치
    exp?: number;
    exp_needed?: number;
  };
  // 대표 업적 (설정하지 않았으면 null)
  representative?: { title?: string } | null;
  exp: number;
  total_wargame: number;
  wargame: {
    solved: number;
    rank: number;
    score: number;
    category?: {
      pwnable?: TCategoryEntry;
      reversing?: TCategoryEntry;
      web?: TCategoryEntry;
      crypto?: TCategoryEntry;
      [key: string]: TCategoryEntry | undefined;
    };
  };
  ctf: {
    rank: number;
    tier: string;
    rating: number;
  };
  profile_image: string;
}

export interface Tstats {
  nickname: string;
  wargame_solved: number;
  wargame_rank: string;
  wargameRankPercentage: string;
  wargame_score: number;
}

export interface TgetLastRankResponse {
  count: number;
}

export interface TUserRankingResponse {
  count: number;
  results: TUserRankingResult[];
}

export interface TUserRankingResult {
  id: number;
  nickname: string;
}

export interface TCategoryData {
  name: string;
  score: number;
  rank: number;
  color: string;
  solved_cnt?: number;
}

export interface TCategoryStats {
  nickname: string;
  total_score: number;
  categories: TCategoryData[];
}

// CTF 시즌 (시즌마다 레이팅이 새로 시작함)
export interface TCtfSeason {
  number: number;
  startsAt: string;
  endsAt: string;
}

// 한 시즌의 대회 한 번 (대회 직후 레이팅과 그 대회 등수)
export interface TCtfRound {
  round: number;
  rating: number;
  rank: number | null;
}

// 한 시즌의 공식 결과 (진행 중인 시즌이면 지금까지의 값)
export interface TCtfSeasonResult {
  season: number;
  tier: string;
  tierClass: string;
  rating: number;
  rank: number;
  participants: number;
  contests: number;
  rounds: TCtfRound[];
}

// 시즌별 결과 목록의 한 줄 (끝난 시즌만 Dreamhack이 줌)
export interface TCtfSeasonSummary {
  season: number;
  tier: string;
  tierClass: string;
  rating: number;
}

// 풀이 기록 한 건 (카드에 필요한 값만 추림)
export interface TSolveRecord {
  title: string;
  tier: number;
  tags: string[];
  solvedAt: string;
  solvers: number;
}

export type Theme = 'light' | 'dark' | 'dracula' | 'tokyonight' | 'nord' | 'gruvbox' | 'transparent';

export interface TErrorCard {
  title: string;
  message: string;
  details: string[];
}

export interface ThemeColors {
  background: string;
  cardBackground: string;
  border: string;
  title: string;
  text: string;
  subText: string;
  accent: string;
  // 진행 막대의 빈 부분 (transparent 테마는 테두리가 없어서 border와 따로 둠)
  track: string;
} 