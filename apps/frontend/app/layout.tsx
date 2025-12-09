import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { fontVariables, fonts } from '../lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tava AI',
  description: 'AI-powered therapy session insights',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className={`${fonts.body.className} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
