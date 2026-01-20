import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

type Theme = 'light' | 'dark';
type CardType = 'stats' | 'most-solved';

export default function Home() {
  const [username, setUsername] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<Theme>('light');
  const [selectedCard, setSelectedCard] = useState<CardType>('stats');
  const [previewKey, setPreviewKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const baseUrl = 'https://dreamhack-readme-stats.vercel.app';

  const getApiUrl = (card: CardType, theme: Theme, user: string) => {
    const endpoint = card === 'stats' ? 'stats' : 'most-solved';
    return `${baseUrl}/api/${endpoint}?username=${user || '사용자명'}&theme=${theme}`;
  };

  const getPreviewUrl = (card: CardType, theme: Theme, user: string) => {
    if (!user) return '';
    const endpoint = card === 'stats' ? 'stats' : 'most-solved';
    return `/api/${endpoint}?username=${user}&theme=${theme}`;
  };

  const getMarkdownCode = () => {
    const altText = selectedCard === 'stats' ? 'Dreamhack Stats' : 'Dreamhack Category Chart';
    return `![${altText}](${getApiUrl(selectedCard, selectedTheme, username)})`;
  };

  const getHtmlCode = () => {
    const altText = selectedCard === 'stats' ? 'Dreamhack Stats' : 'Dreamhack Category Chart';
    const user = username || '사용자명';
    return `<a href="https://dreamhack.io/users/${user}" target="_blank" rel="noopener noreferrer">
  <img src="${getApiUrl(selectedCard, selectedTheme, username)}" alt="${altText}" />
</a>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('코드가 클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
    });
  };

  const handlePreview = () => {
    if (!username.trim()) {
      alert('사용자명을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setPreviewKey(prev => prev + 1);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Dreamhack Readme Stats - GitHub 프로필에 Dreamhack 통계 표시하기</title>
        <meta name="description" content="GitHub README 프로필에 Dreamhack 워게임 통계를 표시하는 SVG 생성기입니다." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Dreamhack Readme Stats</h1>
        <p className={styles.description}>
          GitHub README에 Dreamhack 워게임 통계를 표시하세요
        </p>

        {/* 설정 패널 */}
        <div className={styles.configPanel}>
          <div className={styles.configRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">사용자명</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Dreamhack 닉네임 입력"
                className={styles.textInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="cardType">카드 종류</label>
              <select
                id="cardType"
                value={selectedCard}
                onChange={(e) => setSelectedCard(e.target.value as CardType)}
                className={styles.selectInput}
              >
                <option value="stats">Wargame Stats</option>
                <option value="most-solved">Most Solved Categories</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="theme">테마</label>
              <select
                id="theme"
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as Theme)}
                className={styles.selectInput}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <button
              className={styles.previewButton}
              onClick={handlePreview}
              disabled={isLoading}
            >
              {isLoading ? '로딩...' : '미리보기'}
            </button>
          </div>
        </div>

        {/* 미리보기 */}
        <div className={styles.previewSection}>
          <h2>미리보기</h2>
          <div className={styles.previewContainer}>
            {username && previewKey > 0 ? (
              <img
                key={previewKey}
                src={getPreviewUrl(selectedCard, selectedTheme, username)}
                alt="Preview"
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={styles.previewImage}
              />
            ) : (
              <div className={styles.previewPlaceholder}>
                사용자명을 입력하고 미리보기를 클릭하세요
              </div>
            )}
          </div>
        </div>

        {/* 코드 생성 */}
        <div className={styles.codePanel}>
          <h2>생성된 코드</h2>

          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>Markdown</h3>
              <button
                className={styles.copyButton}
                onClick={() => copyToClipboard(getMarkdownCode())}
              >
                COPY
              </button>
            </div>
            <code className={styles.code}>{getMarkdownCode()}</code>
          </div>

          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>HTML</h3>
              <button
                className={styles.copyButton}
                onClick={() => copyToClipboard(getHtmlCode())}
              >
                COPY
              </button>
            </div>
            <code className={styles.code}>{getHtmlCode()}</code>
          </div>
        </div>

        {/* 테마 비교 */}
        <div className={styles.themeComparison}>
          <h2>테마 비교</h2>
          <div className={styles.themeGrid}>
            <div className={styles.themeItem}>
              <span className={styles.themeLabel}>Light</span>
              <img
                src="/api/stats?username=weakness&theme=light"
                alt="Light theme example"
                width={350}
                height={170}
              />
            </div>
            <div className={styles.themeItem}>
              <span className={styles.themeLabel}>Dark</span>
              <img
                src="/api/stats?username=weakness&theme=dark"
                alt="Dark theme example"
                width={350}
                height={170}
              />
            </div>
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.githubLink}>
          <a
            href="https://github.com/with-developer/dreamhack-readme-stats"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub 프로젝트</span>
          </a>
        </div>
      </main>
    </>
  );
}
