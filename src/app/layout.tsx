import { AppWrapper } from "@/components/layout/AppWrapper";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Noto_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-newsreader',
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
  variable: '--font-noto-sans',
});

export const metadata: Metadata = {
  title: {
    default: "FU News - Tin tức FPT University",
    template: "%s | FU News"
  },
  description: "Cập nhật tin tức mới nhất từ FPT University. Kết nối cộng đồng sinh viên, giảng viên và cán bộ trong hệ thống giáo dục FPT.",
  keywords: ["FPT University", "tin tức", "sinh viên", "giáo dục", "công nghệ"],
  authors: [{ name: "FU News Team" }],
  creator: "FPT University",
  publisher: "FPT University",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://funews.fpt.edu.vn'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://funews.fpt.edu.vn',
    title: 'FU News - Tin tức FPT University',
    description: 'Cập nhật tin tức mới nhất từ FPT University',
    siteName: 'FU News',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FU News - Tin tức FPT University',
    description: 'Cập nhật tin tức mới nhất từ FPT University',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className={`${inter.variable} ${newsreader.variable} ${notoSans.variable} antialiased`}>
        <AuthProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
