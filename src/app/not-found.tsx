import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0c0c0c] px-5 text-center">
      <p className="font-display text-[clamp(5rem,22vw,14rem)] leading-none text-white/12">404</p>

      <h1 className="mt-6 text-[clamp(1.25rem,3vw,1.75rem)] font-medium text-white">
        페이지를 찾을 수 없습니다
      </h1>

      <p className="body-copy mt-4 max-w-[420px] text-[var(--text-dim)]/60">
        주소가 바뀌었거나 삭제된 페이지입니다. 지원 내역을 보시려면 접수 확인 메일에 담긴
        링크를 그대로 열어주세요.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-cta px-8 py-3.5 text-xs sm:text-sm">
          모집 공고로
        </Link>
        <Link href="/#apply" className="btn-ghost px-7 py-3 text-xs sm:text-sm">
          지원하기
        </Link>
      </div>
    </main>
  );
}
