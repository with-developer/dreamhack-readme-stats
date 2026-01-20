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
      pwnable?: {
        score: number;
        rank: number;
      };
      reversing?: {
        score: number;
        rank: number;
      };
      web?: {
        score: number;
        rank: number;
      };
      crypto?: {
        score: number;
        rank: number;
      };
      [key: string]: {
        score: number;
        rank: number;
      } | undefined;
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
}

export interface TCategoryStats {
  nickname: string;
  total_score: number;
  categories: TCategoryData[];
} 