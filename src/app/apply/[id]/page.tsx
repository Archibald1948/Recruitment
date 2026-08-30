import type { Metadata } from "next";
import Link from "next/link";
import ApplicationView from "@/components/ApplicationView";

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
        <h1 className="section-heading grad-heading font-display mt-6 mb-12 text-[clamp(2.5rem,9vw,5rem)]">
          My Application
        </h1>
        <ApplicationView id={id} token={t ?? ""} />
      </div>
    </main>
  );
}
