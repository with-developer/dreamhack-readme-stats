import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { encodeUsername } from '../utils/encodeUsername';
import { Theme } from '../types';
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

interface DropdownOption<T> {
  value: T;
  label: string;
}

interface CustomDropdownProps<T> {
  options: DropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
}

function CustomDropdown<T extends string>({ options, value, onChange, placeholder }: CustomDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        className={`${styles.dropdownTrigger} ${isOpen ? styles.dropdownOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg className={styles.dropdownArrow} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {options.map((option) => (
            <li
              key={option.value}
              className={`${styles.dropdownItem} ${option.value === value ? styles.dropdownItemSelected : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
              {option.value === value && (
                <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [confirmedUsername, setConfirmedUsername] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeChoice>('light');
  const [selectedCard, setSelectedCard] = useState<CardType>('stats');
  // CTF 시즌 카드의 시즌 (비우면 마지막으로 참가한 시즌). 닉네임처럼 미리보기를 누를 때 확정해서, 입력할 때마다 카드를 다시 요청하지 않음
  const [season, setSeason] = useState('');
  const [confirmedSeason, setConfirmedSeason] = useState('');
  const seasonEnabled = !!CARDS[selectedCard].season;
  const seasonInvalid = seasonEnabled && season.trim() !== '' && normalizeSeason(season) === null;
  const [previewKey, setPreviewKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // 닉네임별 프로필 주소 (찾지 못하면 null). 늦게 도착한 다른 닉네임의 응답이 현재 결과를 덮어쓰지 않도록 닉네임별로 보관
  const [profileUrls, setProfileUrls] = useState<Map<string, string | null>>(new Map());
  const profileUrl = profileUrls.get(confirmedUsername) ?? null;

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

  const cardOptions: DropdownOption<CardType>[] = CARD_TYPES.map((value) => ({ value, label: CARDS[value].label }));

  const themeOptions: DropdownOption<ThemeChoice>[] = (Object.keys(THEME_LABELS) as ThemeChoice[]).map((value) => ({
    value,
    label: THEME_LABELS[value],
  }));

  const baseUrl = 'https://dreamhack-readme-stats.vercel.app';

  const codeOptions = { card: selectedCard, theme: selectedTheme, username: confirmedUsername, season: confirmedSeason };

  // 미리보기는 상대 주소 (auto면 light/dark 두 주소를 <picture>로 묶음)
  const getPreviewUrl = (theme: Theme) =>
    buildCardUrl('', { card: selectedCard, theme, username: confirmedUsername, season: confirmedSeason });

  const getMarkdownCode = () => buildMarkdownCode(baseUrl, codeOptions);

  const getHtmlCode = () => buildHtmlCode(baseUrl, codeOptions, profileUrl);

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
    setConfirmedUsername(username.trim());
    setConfirmedSeason(season);
    setIsLoading(true);
    setPreviewKey(prev => prev + 1);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    // 카드 요청이 서버 캐시를 채운 뒤에 조회해야 Dreamhack 검색이 중복되지 않음
    if (!profileUrls.has(confirmedUsername)) {
      loadProfileUrl(confirmedUsername);
    }
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
              <label>카드 종류</label>
              <CustomDropdown
                options={cardOptions}
                value={selectedCard}
                onChange={setSelectedCard}
              />
            </div>

            {seasonEnabled && (
              <div className={styles.inputGroup}>
                <label htmlFor="season">시즌</label>
                <input
                  type="text"
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="비우면 마지막 참가 시즌"
                  className={styles.textInput}
                  aria-invalid={seasonInvalid}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>테마</label>
              <CustomDropdown
                options={themeOptions}
                value={selectedTheme}
                onChange={setSelectedTheme}
              />
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
            {confirmedUsername && previewKey > 0 ? (
              selectedTheme === 'auto' ? (
                // 보는 사람의 시스템 테마(GitHub에서는 GitHub 테마)에 따라 light/dark 카드가 바뀜
                <picture key={previewKey}>
                  <source media="(prefers-color-scheme: dark)" srcSet={getPreviewUrl('dark')} />
                  <img
                    src={getPreviewUrl('light')}
                    alt="Preview"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={styles.previewImage}
                  />
                </picture>
              ) : (
                <img
                  key={previewKey}
                  src={getPreviewUrl(selectedTheme)}
                  alt="Preview"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  className={styles.previewImage}
                />
              )
            ) : (
              <div className={styles.previewPlaceholder}>
                사용자명을 입력하고 미리보기를 클릭하세요
              </div>
            )}
          </div>
          {seasonInvalid && (
            <p className={styles.codeHint}>시즌은 숫자(예: 7)나 current로 입력하세요. 지금 값은 무시하고 마지막 참가 시즌을 보여줍니다.</p>
          )}
          {selectedTheme === 'auto' && (
            <p className={styles.codeHint}>Auto는 README를 보는 사람의 GitHub 테마에 따라 Light/Dark 카드를 바꿔 보여줍니다. 미리보기는 지금 컴퓨터의 테마를 따릅니다.</p>
          )}
        </div>

        {/* 코드 생성 */}
        <div className={styles.codePanel}>
          <h2>{previewKey > 0 ? '생성된 코드' : '예제 코드'}</h2>

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
            {!profileUrl && (
              <p className={styles.codeHint}>
                사용자ID는 Dreamhack 프로필 주소(https://dreamhack.io/users/12345)의 숫자입니다. 미리보기에 성공하면 자동으로 채워집니다.
              </p>
            )}
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
