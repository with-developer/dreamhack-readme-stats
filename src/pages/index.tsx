import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { encodeUsername } from '../utils/encodeUsername';
import { Theme } from '../types';
import { themes } from '../utils/svg';
import {
  buildCardUrl,
  buildHtmlCode,
  buildMarkdownCode,
  CARDS,
  CARD_TYPES,
  CardType,
  normalizeSeason,
  THEME_LABELS,
  ThemeChoice,
} from '../utils/cardCode';

const BASE_URL = 'https://dreamhack-readme-stats.vercel.app';
const GITHUB_URL = 'https://github.com/with-developer/dreamhack-readme-stats';

// 카드 고르기 칸에 보일 이름
const CARD_NAMES: Record<CardType, string> = {
  stats: '워게임 통계',
  'most-solved': '분야 · 원형',
  'most-solved-bars': '분야 · 막대',
  ctf: 'CTF 시즌',
  'ctf-graph': 'CTF 그래프',
  'ctf-seasons': 'CTF 시즌별',
  solves: '최근 풀이',
  'solves-hardest': '어려운 풀이',
  level: '레벨 배지',
};

const THEME_CHOICES = Object.keys(THEME_LABELS) as ThemeChoice[];

type ReadmeBackground = 'light' | 'dark';
type CodeTab = 'markdown' | 'html';
type PreviewState = 'loading' | 'ready' | 'error';

// 닉네임을 넣기 전에 보여줄 예시 카드 (light는 저장된 파일, 그 밖의 테마는 목업 카드 API)
function exampleSrc(card: CardType, theme: Theme): string {
  return theme === 'light' ? `/examples/${card}.svg` : `/api/example?card=${card}&theme=${theme}`;
}

// 테마 칩의 색 견본: 카드 배경과 강조색 (transparent는 체크 무늬, auto는 반반)
function ThemeSwatch({ theme }: { theme: ThemeChoice }) {
  if (theme === 'auto') {
    return (
      <span className={styles.swatch} aria-hidden="true">
        <span className={styles.swatchHalf} style={{ background: themes.light.background }} />
        <span className={styles.swatchHalf} style={{ background: themes.dark.background }} />
      </span>
    );
  }
  const colors = themes[theme];
  return (
    <span
      className={`${styles.swatch} ${theme === 'transparent' ? styles.swatchTransparent : ''}`}
      style={theme === 'transparent' ? undefined : { background: colors.background }}
      aria-hidden="true"
    >
      <span className={styles.swatchDot} style={{ background: colors.accent }} />
    </span>
  );
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [confirmedUsername, setConfirmedUsername] = useState('');
  // CTF 시즌 카드의 시즌. 닉네임처럼 미리보기를 누를 때 확정해서, 입력할 때마다 카드를 다시 요청하지 않음
  const [season, setSeason] = useState('');
  const [confirmedSeason, setConfirmedSeason] = useState('');
  const [card, setCard] = useState<CardType>('stats');
  const [theme, setTheme] = useState<ThemeChoice>('light');
  const [readmeBackground, setReadmeBackground] = useState<ReadmeBackground>('light');
  const [tab, setTab] = useState<CodeTab>('markdown');
  const [previewState, setPreviewState] = useState<PreviewState>('loading');
  const [inputError, setInputError] = useState('');
  const [toast, setToast] = useState('');
  // 닉네임별 프로필 주소 (찾지 못하면 null). 늦게 도착한 다른 닉네임의 응답이 현재 결과를 덮어쓰지 않도록 닉네임별로 보관
  const [profileUrls, setProfileUrls] = useState<Map<string, string | null>>(new Map());
  const usernameRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLImageElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const seasonEnabled = !!CARDS[card].season;
  const seasonInvalid = seasonEnabled && season.trim() !== '' && normalizeSeason(season) === null;
  const profileUrl = profileUrls.get(confirmedUsername) ?? null;

  // README 배경은 처음에 방문자의 운영체제 테마를 따름
  useEffect(() => {
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) setReadmeBackground('dark');
  }, []);

  // Auto 테마는 README 배경에 맞는 카드를 보여줌
  const previewTheme: Theme = theme === 'auto' ? readmeBackground : theme;
  const previewSrc = confirmedUsername
    ? buildCardUrl('', { card, theme: previewTheme, username: confirmedUsername, season: confirmedSeason })
    : exampleSrc(card, previewTheme);

  // 주소가 바뀌면 로딩 표시. 단, 페이지 스크립트가 붙기 전에 이미 다 불러온 이미지는 load 이벤트를 놓치므로 상태를 직접 확인
  useEffect(() => {
    const img = previewRef.current;
    if (img?.complete) {
      setPreviewState(img.naturalWidth > 0 ? 'ready' : 'error');
    } else {
      setPreviewState('loading');
    }
  }, [previewSrc]);

  const codeOptions = { card, theme, username: confirmedUsername, season: confirmedSeason };
  const code = tab === 'markdown'
    ? buildMarkdownCode(BASE_URL, codeOptions)
    : buildHtmlCode(BASE_URL, codeOptions, profileUrl);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('코드를 복사했어요');
    } catch {
      showToast('복사하지 못했어요. 코드를 직접 선택해 복사하세요.');
    }
  };

  // Dreamhack 프로필 주소는 닉네임이 아닌 숫자 ID를 사용하므로 미리보기한 닉네임의 ID를 조회
  const loadProfileUrl = (user: string) => {
    fetch(`/api/user-id?username=${encodeUsername(user)}`)
      .then((response) => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error(`user-id ${response.status}`);
        return response.json();
      })
      .then((data) => setProfileUrls((prev) => new Map(prev).set(user, data?.profileUrl ?? null)))
      .catch(() => {});
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = username.trim();
    if (!name) {
      setInputError('Dreamhack 닉네임을 입력하세요.');
      usernameRef.current?.focus();
      return;
    }
    setInputError('');
    setConfirmedUsername(name);
    setConfirmedSeason(season);
  };

  const handlePreviewLoad = () => {
    setPreviewState('ready');
    // 카드 요청이 서버 캐시를 채운 뒤에 조회해야 Dreamhack 검색이 중복되지 않음
    if (confirmedUsername && !profileUrls.has(confirmedUsername)) {
      loadProfileUrl(confirmedUsername);
    }
  };

  const focusBuilder = () => {
    setTimeout(() => usernameRef.current?.focus({ preventScroll: true }), 450);
  };

  return (
    <>
      <Head>
        <title>Dreamhack Readme Stats - GitHub README에 Dreamhack 카드 표시하기</title>
        <meta
          name="description"
          content="Dreamhack 워게임·CTF 기록을 GitHub README에 넣을 수 있는 SVG 카드로 만들어 줍니다. 이미지 주소 하나로 바로 사용하세요."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f7f8fa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0d12" media="(prefers-color-scheme: dark)" />
        <meta property="og:title" content="Dreamhack Readme Stats" />
        <meta property="og:description" content="Dreamhack 워게임·CTF 기록을 GitHub README 카드로" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </Head>

      <div className={styles.page}>
        <header className={styles.nav}>
          <div className={styles.navInner}>
            <a href="#" className={styles.brand} aria-label="Dreamhack Readme Stats 처음으로">
              <span className={styles.brandMark} aria-hidden="true">&gt;_</span>
              <span className={styles.brandName}>Dreamhack Readme Stats</span>
            </a>
            <nav className={styles.navLinks} aria-label="바로가기">
              <a href="#builder">카드 만들기</a>
              <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noopener noreferrer">사용법</a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.githubButton}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className={styles.githubLabel}>GitHub</span>
              </a>
            </nav>
          </div>
        </header>

        <main>
          <section className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.eyebrow}>for GitHub README</p>
              <h1 className={styles.heroTitle}>
                Dreamhack 기록을
                <br />
                README 카드로
              </h1>
              <p className={styles.heroLead}>
                워게임 통계, CTF 시즌 티어, 최근 풀이, 레벨까지. 닉네임만 넣으면 README에 붙여 넣을 이미지 코드를 만들어 드려요.
              </p>
              <div className={styles.heroActions}>
                <a href="#builder" className={styles.primaryButton} onClick={focusBuilder}>
                  내 카드 만들기
                </a>
                <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noopener noreferrer" className={styles.ghostButton}>
                  사용법 보기
                </a>
              </div>
              <ul className={styles.heroFacts}>
                <li><strong>9</strong>가지 카드</li>
                <li><strong>7</strong>가지 테마 + Auto</li>
                <li>설치 없이 <strong>이미지 주소 하나</strong></li>
              </ul>
            </div>
            <div className={styles.heroCards} aria-hidden="true">
              {(['ctf-graph', 'stats', 'solves'] as CardType[]).map((name, index) => (
                <picture key={name} className={`${styles.heroCard} ${styles[`heroCard${index}`]}`}>
                  <source media="(prefers-color-scheme: dark)" srcSet={exampleSrc(name, 'dark')} />
                  <img src={exampleSrc(name, 'light')} alt="" width={390} height={190} />
                </picture>
              ))}
            </div>
          </section>

          <section id="builder" className={styles.builder} aria-labelledby="builder-title">
            <div className={styles.sectionHead}>
              <h2 id="builder-title">카드 만들기</h2>
              <p>닉네임을 넣고 카드와 테마를 고르면, 미리보기로 바로 확인하고 코드를 복사할 수 있어요.</p>
            </div>

            <div className={styles.builderGrid}>
              <form className={styles.controls} onSubmit={handleSubmit} noValidate>
                <fieldset className={styles.step}>
                  <legend className={styles.stepTitle}>
                    <span className={styles.stepNumber}>1</span>Dreamhack 닉네임
                  </legend>
                  <div className={styles.nicknameRow}>
                    <input
                      ref={usernameRef}
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="예: weakness"
                      autoComplete="off"
                      spellCheck={false}
                      className={styles.input}
                      aria-invalid={!!inputError}
                      aria-describedby="username-help"
                    />
                    <button type="submit" className={styles.primaryButton}>미리보기</button>
                  </div>
                  <p id="username-help" className={inputError ? styles.fieldError : styles.fieldHelp}>
                    {inputError || '닉네임은 대소문자를 구분해요. 특수문자가 있어도 주소에 맞게 바꿔 드려요.'}
                  </p>
                </fieldset>

                <fieldset className={styles.step}>
                  <legend className={styles.stepTitle}>
                    <span className={styles.stepNumber}>2</span>카드
                  </legend>
                  <div className={styles.cardGrid}>
                    {CARD_TYPES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.cardOption} ${card === value ? styles.selected : ''}`}
                        aria-pressed={card === value}
                        onClick={() => setCard(value)}
                      >
                        <img src={`/examples/${value}.svg`} alt="" loading="lazy" className={styles.cardThumb} />
                        <span className={styles.cardName}>{CARD_NAMES[value]}</span>
                      </button>
                    ))}
                  </div>
                  {seasonEnabled && (
                    <div className={styles.seasonRow}>
                      <label htmlFor="season">시즌</label>
                      <input
                        id="season"
                        type="text"
                        inputMode="numeric"
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                        placeholder="비우면 최근 시즌"
                        className={`${styles.input} ${styles.seasonInput}`}
                        aria-invalid={seasonInvalid}
                        aria-describedby="season-help"
                      />
                      <p id="season-help" className={seasonInvalid ? styles.fieldError : styles.fieldHelp}>
                        {seasonInvalid
                          ? '숫자(예: 7)나 current로 입력하세요.'
                          : '7처럼 시즌 번호나 current(이번 시즌). 미리보기를 누르면 반영돼요.'}
                      </p>
                    </div>
                  )}
                </fieldset>

                <fieldset className={styles.step}>
                  <legend className={styles.stepTitle}>
                    <span className={styles.stepNumber}>3</span>테마
                  </legend>
                  <div className={styles.themeList}>
                    {THEME_CHOICES.map((value) => (
                      <button
                        key={value}
                        type="button"
                        className={`${styles.themeChip} ${theme === value ? styles.selected : ''}`}
                        aria-pressed={theme === value}
                        onClick={() => setTheme(value)}
                      >
                        <ThemeSwatch theme={value} />
                        {value === 'auto' ? 'Auto' : THEME_LABELS[value]}
                      </button>
                    ))}
                  </div>
                  {theme === 'auto' && (
                    <p className={styles.fieldHelp}>
                      README를 보는 사람의 GitHub 테마에 따라 Light / Dark 카드가 바뀌어요.
                    </p>
                  )}
                </fieldset>
              </form>

              <div className={styles.output}>
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <span className={styles.panelTitle}>
                      미리보기
                      {!confirmedUsername && <span className={styles.badge}>예시</span>}
                    </span>
                    <div className={styles.segmented} role="group" aria-label="README 배경">
                      {(['light', 'dark'] as ReadmeBackground[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={readmeBackground === value}
                          onClick={() => setReadmeBackground(value)}
                        >
                          {value === 'light' ? '라이트' : '다크'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={`${styles.stage} ${readmeBackground === 'dark' ? styles.stageDark : ''}`}>
                    {previewState === 'loading' && <div className={styles.skeleton} aria-hidden="true" />}
                    <img
                      key={previewSrc}
                      ref={previewRef}
                      src={previewSrc}
                      alt={confirmedUsername ? `${confirmedUsername}의 ${CARD_NAMES[card]} 카드` : `${CARD_NAMES[card]} 예시 카드`}
                      className={`${styles.previewImage} ${previewState === 'loading' ? styles.hidden : ''}`}
                      onLoad={handlePreviewLoad}
                      onError={() => setPreviewState('error')}
                    />
                    {previewState === 'error' && (
                      <p className={styles.stageMessage}>카드를 불러오지 못했어요. 잠시 뒤 다시 시도하세요.</p>
                    )}
                  </div>
                  <p className={styles.panelNote}>
                    {confirmedUsername
                      ? '라이트 / 다크는 README 배경을 바꿔 보는 기능이에요. 카드 색은 테마에서 고르세요.'
                      : 'example_user의 예시 카드예요. 닉네임을 넣으면 내 카드로 바뀌어요.'}
                  </p>
                </div>

                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <div className={styles.tabs} role="tablist" aria-label="코드 형식">
                      {(['markdown', 'html'] as CodeTab[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          role="tab"
                          aria-selected={tab === value}
                          className={tab === value ? styles.tabActive : ''}
                          onClick={() => setTab(value)}
                        >
                          {value === 'markdown' ? 'Markdown' : (
                            <>
                              HTML<span className={styles.tabExtra}> (프로필 링크)</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                    <button type="button" className={styles.copyButton} onClick={copyCode}>
                      복사
                    </button>
                  </div>
                  <pre className={styles.code}>
                    <code>{code}</code>
                  </pre>
                  {tab === 'html' && !profileUrl && (
                    <p className={styles.panelNote}>
                      사용자ID는 Dreamhack 프로필 주소(dreamhack.io/users/12345)의 숫자예요. 미리보기에 성공하면 자동으로 채워져요.
                    </p>
                  )}
                  {!confirmedUsername && (
                    <p className={styles.panelNote}>닉네임을 넣고 미리보기를 누르면 코드의 <code>사용자명</code>이 바뀌어요.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p>Dreamhack 공식 서비스가 아닌 개인 프로젝트예요 · MIT License</p>
            <div className={styles.footerLinks}>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noopener noreferrer">사용법</a>
              <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer">문제 제보</a>
            </div>
          </div>
        </footer>

        <div className={`${styles.toast} ${toast ? styles.toastShow : ''}`} role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </>
  );
}
