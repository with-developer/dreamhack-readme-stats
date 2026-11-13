import { AppProps } from 'next/app';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';

// 빌드할 때 내려받아 사이트에서 직접 제공 (방문할 때 Google Fonts를 부르지 않음)
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${sans.variable} ${mono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
