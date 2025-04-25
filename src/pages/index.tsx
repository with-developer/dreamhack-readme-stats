import React from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('코드가 클립보드에 복사되었습니다!');
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
    });
  };

  return (
    <>
      <Head>
        <title>Dreamhack Readme Stats - GitHub 프로필에 Dreamhack 통계 표시하기</title>
        <meta name="description" content="GitHub README 프로필에 Dreamhack 워게임 통계를 표시하는 SVG 생성기입니다. 사용자의 해결한 문제 수, 랭킹, 점수 등을 자동으로 업데이트하여 표시합니다." />
        <meta name="keywords" content="dreamhack, github, readme, stats, wargame, ctf, security, programming" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Dreamhack Readme Stats" />
        <meta property="og:title" content="Dreamhack Readme Stats" />
        <meta property="og:description" content="GitHub README 프로필에 Dreamhack 워게임 통계를 표시하는 SVG 생성기" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dreamhack-readme-stats.vercel.app" />
        <meta property="og:image" content="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Dreamhack Readme Stats" />
        <meta name="twitter:description" content="GitHub README 프로필에 Dreamhack 워게임 통계를 표시하는 SVG 생성기" />
        <meta name="twitter:image" content="https://dreamhack-readme-stats.vercel.app/api/stats?username=weakness" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0099ff" />
        <link rel="canonical" href="https://dreamhack-readme-stats.vercel.app" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Dreamhack Readme Stats</h1>
        <p className={styles.description}>
          사용자 이름을 입력하여 Dreamhack 워게임 통계를 확인하세요.
        </p>
        <div className={styles.exampleCard}>
          <h2>사용 방법:</h2>
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>Markdown:</h3>
              <button 
                className={styles.copyButton}
                onClick={() => copyToClipboard('![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)')}
              >
                COPY
              </button>
            </div>
            <code className={styles.code}>
              ![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
            </code>
          </div>
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>HTML:</h3>
              <button 
                className={styles.copyButton}
                onClick={() => copyToClipboard(`<a href="https://dreamhack.io/users/사용자명" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명" alt="Dreamhack Stats" />
</a>`)}
              >
                COPY
              </button>
            </div>
            <code className={styles.code}>
              {`<a href="https://dreamhack.io/users/사용자명" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명" alt="Dreamhack Stats" />
</a>`}
            </code>
          </div>
        </div>

        <div className={styles.example}>
          <h3>예시:</h3>
          <a 
            href="https://dreamhack.io/users/weakness" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.exampleLink}
          >
            <img 
              src="/api/stats?username=weakness" 
              alt="Dreamhack stats example" 
              width={350} 
              height={170} 
            />
          </a>
          <a 
            href="https://dreamhack.io/users/weakness" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.exampleLink}
          >
            <img 
              src="/api/most-solved?username=4rmi0s" 
              alt="Dreamhack category chart example" 
              width={350} 
              height={170} 
            />
          </a>
        </div>

        <div className={styles.exampleCard}>
          <h2>카테고리 차트:</h2>
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>Markdown:</h3>
              <button 
                className={styles.copyButton}
                onClick={() => copyToClipboard('![Dreamhack Category Chart](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명)')}
              >
                COPY
              </button>
            </div>
            <code className={styles.code}>
              ![Dreamhack Category Chart](https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명)
            </code>
          </div>
          <div className={styles.codeSection}>
            <div className={styles.codeHeader}>
              <h3>HTML:</h3>
              <button 
                className={styles.copyButton}
                onClick={() => copyToClipboard(`<a href="https://dreamhack.io/users/사용자명" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명" alt="Dreamhack Category Chart" />
</a>`)}
              >
                COPY
              </button>
            </div>
            <code className={styles.code}>
              {`<a href="https://dreamhack.io/users/사용자명" target="_blank" rel="noopener noreferrer">
  <img src="https://dreamhack-readme-stats.vercel.app/api/most-solved?username=사용자명" alt="Dreamhack Category Chart" />
</a>`}
            </code>
          </div>
        </div>

        <div className={styles.example}>
          <h3>카테고리 차트 예시:</h3>
          <a 
            href="https://dreamhack.io/users/weakness" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.exampleLink}
          >
            <img 
              src="/api/most-solved?username=4rmi0s" 
              alt="Dreamhack category chart example" 
              width={350} 
              height={170} 
            />
          </a>
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