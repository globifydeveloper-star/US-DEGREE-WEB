import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'US Degrees',
  description: 'Search universities in the US',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
