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
        <title>Dreamhack Readme Stats</title>
        <meta name="description" content="Dreamhack stats for GitHub readme" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
        </div>
      </main>
    </>
  );
} 