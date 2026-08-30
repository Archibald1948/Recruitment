import type { Metadata, Viewport } from "next";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css";

const pixel = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "함께 만들 팀원을 찾습니다 — 개발 프로젝트 팀원 모집",
  description:
    "기획부터 개발, 배포, 실제 사용자를 만나는 운영까지. 하나의 서비스를 끝까지 완성할 팀원을 모집합니다.",
  openGraph: {
    title: "함께 만들 팀원을 찾습니다",
    description:
      "기획 → 개발 → 배포 → 운영까지 직접 경험하며 하나의 서비스를 완성할 팀원을 모집합니다.",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={pixel.variable}>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
