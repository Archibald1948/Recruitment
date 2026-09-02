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
  title: {
    default: "Build It, Ship It Together",
    template: "%s · 같이 개발해요.",
  },
  description:
    "기획부터 개발, 배포, 그리고 실제 사용자를 만나는 운영까지. 하나의 서비스를 끝까지 완성할 팀원을 모집합니다. 기획/PM · 프론트엔드 · 백엔드 · UI/UX 디자이너.",
  keywords: [
    "팀원 모집",
    "사이드 프로젝트",
    "개발 프로젝트",
    "프론트엔드",
    "백엔드",
    "UI/UX 디자이너",
    "기획",
    "PM",
  ],
  applicationName: "Build It, Ship It Together",
  openGraph: {
    title: "Build It, Ship It Together",
    description:
      "끝까지 만들어 보고, 배포하고, 사람들이 쓰는 서비스를 운영해 봅니다. 함께할 팀원을 모집합니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Build It, Ship It Together",
  },
  twitter: {
    card: "summary_large_image",
    title: "Build It, Ship It Together",
    description: "하나의 서비스를 끝까지 완성할 팀원을 모집합니다.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  colorScheme: "dark",
  /*
   * 모바일 키보드가 올라올 때 레이아웃 뷰포트까지 같이 줄인다.
   *
   * 기본값(resizes-visual)에서는 보이는 영역만 줄고 레이아웃 뷰포트는 그대로다.
   * sticky/fixed는 레이아웃 뷰포트를 기준으로 붙으므로, 지원 폼에서 입력창을
   * 누르면 진행률 바가 화면 위쪽 밖에 붙어 사라진다.
   */
  interactiveWidget: "resizes-content",
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
