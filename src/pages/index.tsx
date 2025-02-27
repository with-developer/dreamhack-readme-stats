import React from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
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
          <code className={styles.code}>
            ![Dreamhack Stats](https://dreamhack-readme-stats.vercel.app/api/stats?username=사용자명)
          </code>
        </div>
        <div className={styles.example}>
          <h3>예시:</h3>
          <img 
            src="/api/stats?username=weakness" 
            alt="Dreamhack stats example" 
            width={350} 
            height={170} 
          />
        </div>
      </main>
    </>
  );
} 