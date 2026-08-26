import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Fresh Mints',
  description: 'Identify newly minted and licensed professionals across 13 high-value industries, skip trace contact details, and instantly pitch custom turnkey websites with 2-year hosting included.',
  openGraph: {
    title: 'Fresh Mints',
    description: 'Identify newly minted and licensed professionals across 13 high-value industries, skip trace contact details, and instantly pitch custom turnkey websites with 2-year hosting included.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fresh Mints',
    description: 'Identify newly minted and licensed professionals across 13 high-value industries, skip trace contact details, and instantly pitch custom turnkey websites with 2-year hosting included.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
