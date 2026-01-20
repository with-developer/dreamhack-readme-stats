import { TCategoryStats } from '../types';

export function generateCategorySvg(stats: TCategoryStats): string {
  // SVG 크기 및 차트 설정
  const width = 390;
  const height = 190;
  const pieCenterX = 295;
  const pieCenterY = 105;
  const radius = 70;

  // 전체 스코어
  const totalScore = stats.total_score;

  // 카테고리 데이터
  const categories = stats.categories;
  const totalCategoryScore = categories.reduce((sum, category) => sum + category.score, 0);

  // 원 차트 및 범례 생성
  let pieChart = '';
  let legends = '';
  let currentAngle = 0;

  const legendStartX = 25;
  const legendStartY = 75;
  const legendItemHeight = 22;
  const maxLegendItems = 5;

  // 카테고리가 없는 경우
  if (categories.length === 0 || totalCategoryScore === 0) {
    pieChart = `<circle cx="${pieCenterX}" cy="${pieCenterY}" r="${radius}" fill="#e2e8f0" />
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
          stroke-width="1"
        />
      `;

      // 퍼센트 라벨
      const midAngle = currentAngle + angleSize / 2;
      const labelRadius = radius * 0.65;
      const labelX = pieCenterX + labelRadius * Math.cos((midAngle - 90) * Math.PI / 180);
      const labelY = pieCenterY + labelRadius * Math.sin((midAngle - 90) * Math.PI / 180);
      const percentLabel = percentage > 0.08 ?
        `<text x="${labelX}" y="${labelY}" fill="white" text-anchor="middle" dominant-baseline="middle" class="percentage-label">${Math.round(percentage * 100)}%</text>` : '';

      pieChart += path + percentLabel;
      currentAngle = endAngle;
    });

    // 범례 생성 (상위 카테고리만)
    topCategories.forEach((category, index) => {
      const legendY = legendStartY + (index * legendItemHeight);
      const percentage = Math.round((category.score / totalCategoryScore) * 100);
      const capitalizedName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
      legends += `
        <rect x="${legendStartX}" y="${legendY}" width="10" height="10" fill="${category.color}" rx="2" ry="2" />
        <text x="${legendStartX + 16}" y="${legendY + 9}" class="legend-text">${capitalizedName}</text>
        <text x="${legendStartX + 135}" y="${legendY + 9}" class="legend-value">${percentage}%</text>
      `;
    });
  }

  // 중앙 총점 표시 (원형 차트 내부에)
  const centerCircle = `
    <circle cx="${pieCenterX}" cy="${pieCenterY}" r="${radius * 0.45}" fill="white" />
    <text x="${pieCenterX}" y="${pieCenterY - 6}" text-anchor="middle" class="total-score-label">Total</text>
    <text x="${pieCenterX}" y="${pieCenterY + 12}" text-anchor="middle" class="total-score-value">${totalScore}</text>
  `;

  // SVG 구조 반환
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&amp;display=swap');
    .title { font: 500 13px 'JetBrains Mono', monospace; fill: #64748b; }
    .legend-text { font: 500 13px 'JetBrains Mono', monospace; fill: #0f172a; }
    .legend-value { font: 700 13px 'JetBrains Mono', monospace; fill: #64748b; }
    .percentage-label { font: 700 10px 'JetBrains Mono', monospace; fill: white; }
    .total-score-label { font: 500 10px 'JetBrains Mono', monospace; fill: #64748b; }
    .total-score-value { font: 700 16px 'JetBrains Mono', monospace; fill: #3b82f6; }
    .no-data { font: 500 12px 'JetBrains Mono', monospace; fill: #94a3b8; }
  </style>

  <!-- 배경 -->
  <rect width="${width}" height="${height}" fill="#ffffff" rx="12" ry="12"/>

  <!-- 타이틀 -->
  <text x="20" y="30" class="title">Most Solved Categories</text>

  <!-- 범례 배경 -->
  <rect x="15" y="55" width="175" height="120" fill="#f8fafc" rx="8" ry="8"/>

  <!-- 범례 -->
  <g transform="translate(0, 0)">
    ${legends}
  </g>

  <!-- 원형 차트 -->
  <g transform="translate(0, 0)">
    ${pieChart}
    ${centerCircle}
  </g>

  <!-- 테두리 -->
  <rect x="0.5" y="0.5" width="${width-1}" height="${height-1}" fill="none" stroke="#e2e8f0" stroke-width="1" rx="12" ry="12"/>
</svg>
  `;
} 