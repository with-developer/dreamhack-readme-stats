import { TCategoryStats } from '../types';

export function generateCategorySvg(stats: TCategoryStats): string {
  // SVG 크기 및 차트 설정
  const width = 390;
  const height = 190;
  const pieCenterX = 290;   // 원형 차트 중심 X (왼쪽)
  const pieCenterY = 96;   // 원형 차트 중심 Y
  const radius = 88;       // 원형 차트 반지름
  
  // 전체 스코어
  const totalScore = stats.total_score;
  
  // 카테고리 데이터
  const categories = stats.categories;
  const totalCategoryScore = categories.reduce((sum, category) => sum + category.score, 0);
  
  // 원 차트 및 범례 생성
  let pieChart = '';
  let legends = '';
  let currentAngle = 0;

  const legendStartX = 25; // 범례 시작 X 위치 (오른쪽)
  const legendStartY = 80;  // 범례 시작 Y 위치 (제목 아래)
  const legendItemHeight = 22; // 범례 항목 간 간격
  const maxLegendItems = 5;  // 표시할 최대 범례 항목 수
  
  // 카테고리가 없는 경우
  if (categories.length === 0 || totalCategoryScore === 0) {
    pieChart = `<circle cx="${pieCenterX}" cy="${pieCenterY}" r="${radius}" fill="#ddd" />
    <text x="${pieCenterX}" y="${pieCenterY}" text-anchor="middle" class="no-data">No data</text>`;
    legends = `<text x="${legendStartX}" y="${legendStartY + 10}" class="no-data">No category data</text>`;
  } else {
    // 상위 카테고리만 범례에 표시 (최대 maxLegendItems개)
    const topCategories = categories.slice(0, maxLegendItems);
    
    categories.forEach((category) => {
      const percentage = category.score / totalCategoryScore;
      const angleSize = percentage * 360;
      const endAngle = currentAngle + angleSize;
      
      // 원형 조각 경로
      const startX = pieCenterX + radius * Math.cos((currentAngle - 90) * Math.PI / 180);
      const startY = pieCenterY + radius * Math.sin((currentAngle - 90) * Math.PI / 180);
      const endX = pieCenterX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
      const endY = pieCenterY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
      const largeArcFlag = angleSize > 180 ? 1 : 0;
      
      const path = `
        <path 
          d="M ${pieCenterX} ${pieCenterY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z" 
          fill="${category.color}" 
          stroke="white" 
          stroke-width="0.5"
        />
      `;

      // 퍼센트 라벨
      const midAngle = currentAngle + angleSize / 2;
      const labelRadius = radius * 0.70;
      const labelX = pieCenterX + labelRadius * Math.cos((midAngle - 90) * Math.PI / 180) - 3;
      const labelY = pieCenterY + labelRadius * Math.sin((midAngle - 90) * Math.PI / 180);
      const percentLabel = percentage > 0.05 ? // 5% 이상만 표시
        `<text x="${labelX}" y="${labelY}" fill="white" text-anchor="middle" class="percentage-label">${Math.round(percentage * 100)}%</text>` : '';
      
      pieChart += path + percentLabel;
      currentAngle = endAngle;
    });

    // 범례 생성 (상위 카테고리만)
    topCategories.forEach((category, index) => {
      const legendY = legendStartY + (index * legendItemHeight);
      legends += `
        <rect x="${legendStartX}" y="${legendY}" width="12" height="12" fill="${category.color}" rx="2" ry="2" />
        <text x="${legendStartX + 20}" y="${legendY + 10}" class="legend-text">${category.name}: ${category.score}</text>
      `;
    });
  }
  
  // 중앙 총점 표시 (원형 차트 내부에)
  const centerCircle = `
    <circle cx="${pieCenterX}" cy="${pieCenterY}" r="${radius * 0.4}" fill="white" />
    <text x="${pieCenterX}" y="${pieCenterY - 5}" text-anchor="middle" class="total-score-label">Score</text>
    <text x="${pieCenterX}" y="${pieCenterY + 10}" text-anchor="middle" class="total-score-value">${totalScore}</text>
  `;
  
  // 제목 (오른쪽 상단)
  const header = `
    <text x="${legendStartX-5}" y="35" class="title" text-anchor="start">Dreamhack</text>
    <text x="${legendStartX-5}" y="55" class="title" text-anchor="start">Most solved categories</text>
  `;

  // SVG 구조 반환
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
    .title { font: 700 16px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill:rgb(9, 112, 201); }
    .user-name { font: 800 32px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #333; }
    .legend-text { font: 400 17px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #444; }
    .percentage-label { font: 600 10px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: white; text-shadow: 0 0 2px rgba(0,0,0,0.5); }
    .total-score-label { font: 500 10px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #777; }
    .total-score-value { font: 700 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #6e45e2; }
    .no-data { font: 500 12px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; fill: #888; }
  </style>
  
  <rect x="0.5" y="0.5" width="${width-1}" height="${height-1}" fill="#f8faff" rx="12" ry="12" stroke="#333" stroke-width="0.5" />
  
  <!-- 제목 (오른쪽 상단) -->
  ${header}

  <!-- 원형 차트 (왼쪽) -->
  <g transform="translate(0, 0)">
    ${pieChart}
    ${centerCircle}
  </g>

  <!-- 범례 (오른쪽) -->
  <g transform="translate(0, 0)">
    ${legends}
  </g>

</svg>
  `;
} 