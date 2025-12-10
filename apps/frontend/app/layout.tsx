import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../components/providers/ThemeProvider';
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
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className={`${fonts.body.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
