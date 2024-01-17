import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Azure OpenAI Chatbot with Next.js and Lit',
  description: 'A TypeScript RAG Pattern App',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <Link href="/" title="Home">
            Home
          </Link>{' '}
          |{' '}
          <Link href="/settings" title="Settings">
            Settings
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
