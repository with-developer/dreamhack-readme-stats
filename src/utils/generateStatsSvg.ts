import { Tstats } from '../types';

export function generateStatsSvg(stats: Tstats): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="390" height="190" viewBox="0 0 390 190" fill="none">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
    .title { font: 700 18px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #ffffff; }
    .user-name { font: 800 32px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: rgba(255, 255, 255, 0.9); }
    .stat-label { font: 400 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #6c757d; }
    .stat-value { font: 700 20px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #6e45e2; }
    .tier-badge { font: 700 16px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #ffffff; }
  </style>
  
  <defs>
    <linearGradient id="headerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6e45e2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#88d3ce;stop-opacity:1" />
    </linearGradient>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="0" result="offsetblur"/>
      <feFlood flood-color="#000000" flood-opacity="0.1"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- 배경 -->
  <rect width="392" height="191" fill="#ffffff" rx="12" ry="12"/>
  <rect width="390" height="130" fill="url(#headerGradient)" rx="12" ry="12"/>
  
  <!-- 콘텐츠 -->
  <circle cx="55" cy="60" r="35" fill="rgba(255, 255, 255, 0.2)" filter="url(#dropShadow)"/>
  <text x="55" y="55" class="tier-badge" text-anchor="middle">TOP</text>
  <text x="55" y="75" class="tier-badge" text-anchor="middle">${stats.wargameRankPercentage}%</text>
  
  <text x="110" y="40" class="title">Dreamhack wargame stats</text>
  <text x="110" y="82" class="user-name">${stats.nickname}</text>

  <rect x="0" y="120" width="390" height="10" fill="#f8f9fa"/>
  <rect x="0" y="120" width="390" height="70" fill="#f8f9fa" rx="12" ry="12"/>
  
  <text x="63" y="145" class="stat-label" text-anchor="middle">Solved</text>
  <text x="63" y="170" class="stat-value" text-anchor="middle">${stats.wargame_solved}</text>
  
  <text x="193" y="145" class="stat-label" text-anchor="middle">Rank</text>
  <text x="193" y="170" class="stat-value" text-anchor="middle">${stats.wargame_rank}</text>

  <text x="323" y="145" class="stat-label" text-anchor="middle">Score</text>
  <text x="323" y="170" class="stat-value" text-anchor="middle">${stats.wargame_score}</text>
  
  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="389" height="189" fill="none" stroke="#333" stroke-width="0.5" rx="12" ry="12"/>
</svg>
  `;
} 