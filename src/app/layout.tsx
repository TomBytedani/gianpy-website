import type { Metadata } from 'next';
import { Lato, Playfair_Display } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

// Body font - Lato
const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
});

// Display font - Playfair Display Italic
const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['600'],
  style: 'italic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Antichità Barbaglia | Fine Antique Furniture',
    template: '%s | Antichità Barbaglia',
  },
  description:
    'Discover exceptional antique furniture, carefully selected with a passion for authenticity. Unique heritage pieces for collectors and design enthusiasts.',
  keywords: [
    'antique furniture',
    'Italian antiques',
    'vintage furniture',
    'period furniture',
    'heritage furniture',
    'antique shop',
    'antiquariato',
  ],
  authors: [{ name: 'Barbaglia' }],
  creator: 'Antichità Barbaglia',
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    alternateLocale: 'en_US',
    siteName: 'Antichità Barbaglia',
    title: 'Antichità Barbaglia | Fine Antique Furniture',
    description:
      'Discover exceptional antique furniture, carefully selected with a passion for authenticity.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Antichità Barbaglia',
    description:
      'Discover exceptional antique furniture, carefully selected with a passion for authenticity.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <html lang={locale || 'it'} suppressHydrationWarning>
      <body className={`${lato.variable} ${playfairDisplay.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
