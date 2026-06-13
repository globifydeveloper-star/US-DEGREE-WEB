import type { Metadata } from 'next';
import { Lexend, Poppins } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-lexend',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'US Degrees',
  description: 'Search universities in the US',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en" className={`${lexend.variable} ${poppins.variable}`}>
        <body className={lexend.className}>{children}</body>
      </html>
    </AuthProvider>
  );
}