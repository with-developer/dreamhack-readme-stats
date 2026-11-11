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
  };
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