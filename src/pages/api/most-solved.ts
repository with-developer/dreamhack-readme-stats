import { NextApiRequest, NextApiResponse } from 'next';
import { TCategoryData, TCategoryStats } from '../../types';
import { generateCategorySvg } from '../../utils/generateCategorySvg';
import { getUserId, getUserData } from '../../utils/dreamhack';

// 성능 측정을 위한 유틸리티 함수
const measureTime = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  console.time(`⏱️ ${name}`);
  try {
    return await fn();
  } finally {
    console.timeEnd(`⏱️ ${name}`);
  }
};

// 카테고리별 색상 매핑
const categoryColors: Record<string, string> = {
  web: '#ff6b6b',       // 빨간색 계열
  pwnable: '#339af0',   // 파란색 계열
  reversing: '#51cf66', // 초록색 계열
  crypto: '#fcc419',    // 노랑색 계열
  forensic: '#cc5de8',  // 보라색 계열
  misc: '#20c997',      // 청록색 계열
};

// 기본 색상 팔레트 (알 수 없는 카테고리용)
const defaultColors = [
  '#74c0fc', '#a5d8ff', '#66d9e8', '#63e6be', '#8ce99a', 
  '#b2f2bb', '#d8f5a2', '#ffec99', '#ffc078', '#ffa8a8'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.time('⏱️ 전체 API 실행 시간');
  const { username } = req.query;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    // 개별 API 호출 시간 측정
    const userId = await measureTime('getUserId', () => getUserId(username as string));

    if (!userId) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return res.status(400).json({ error: 'User not found' });
    }

    // username을 함께 전달하여 캐시된 ID가 유효하지 않을 경우 재시도할 수 있도록 함
    const userData = await measureTime('getUserData', () => getUserData(userId, username as string));
    if (!userData) {
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return res.status(400).json({ error: 'User information cannot be read.' });
    }

    console.time('⏱️ 데이터 가공 및 SVG 생성');
    const {
      nickname,
      wargame
    } = userData;

    // 카테고리 데이터 추출 및 가공
    const categoryEntries = Object.entries(wargame.category || {});
    
    // 카테고리가 없는 경우 빈 배열로 처리
    if (categoryEntries.length === 0) {
      const emptyStats: TCategoryStats = {
        nickname,
        total_score: wargame.score || 0,
        categories: []
      };
      
      const svg = generateCategorySvg(emptyStats);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      console.timeEnd('⏱️ 전체 API 실행 시간');
      return res.send(svg);
    }
    
    // 카테고리 데이터가 있는 경우 가공
    const categories: TCategoryData[] = categoryEntries.map(([name, data], index) => {
      // 카테고리에 해당하는 색상 선택 (미리 정의된 색상이 없으면 기본 팔레트에서 선택)
      const color = categoryColors[name] || defaultColors[index % defaultColors.length];
      
      return {
        name,
        score: data?.score || 0,
        rank: data?.rank || 0,
        color
      };
    });
    
    // 점수가 높은 순서로 정렬
    categories.sort((a, b) => b.score - a.score);
    
    const categoryStats: TCategoryStats = {
      nickname,
      total_score: wargame.score || 0,
      categories
    };

    const svg = generateCategorySvg(categoryStats);
    console.timeEnd('⏱️ 데이터 가공 및 SVG 생성');

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    console.timeEnd('⏱️ 전체 API 실행 시간');
    return res.send(svg);
  } catch (error) {
    console.error(error);
    console.timeEnd('⏱️ 전체 API 실행 시간');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 