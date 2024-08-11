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
    level: number;
    exp: number;
    rank: string;
    rankPercentage: string;
    wargame_solved: number;
    wargame_rank: string;
    wargameRankPercentage: string;
    wargame_score: number;
    ctf_rank?: number;
    ctf_tier?: string;
    ctf_rating?: number;
    profile_image: string;
  }

  export interface TgetLastRankResponse {
    count: number;
  }