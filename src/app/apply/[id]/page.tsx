import type { Metadata } from "next";
import Link from "next/link";
import ApplicationView from "@/components/ApplicationView";
import DotMatrixHeadline from "@/components/hero/DotMatrixHeadline";

export const metadata: Metadata = {
  title: "내 지원서 — 확인 및 수정",
  robots: { index: false, follow: false },
};

export default async function ApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 py-16 sm:px-8 md:px-10 md:py-24">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="font-display text-xs tracking-widest text-[var(--muted)] uppercase transition-colors hover:text-white"
        >
          &lt; 모집 공고
        </Link>
        {/*
          긴 단어를 고정 clamp로 키우면 컨테이너를 넘쳐 잘린다.
          도트 헤드라인은 폭에 맞춰 격자를 계산하므로 항상 들어맞는다.
        */}
        <div className="mt-6 mb-12">
          <DotMatrixHeadline lines={["My Application"]} capRows={12} gapRows={3} />
        </div>
        <ApplicationView id={id} token={t ?? ""} />
      </div>
    </main>
  );
}
