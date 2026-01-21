import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Talk To Your Inner Self',
  description: 'Audio conversation with your past self',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}