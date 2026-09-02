import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "개인정보 수집·이용 안내",
};

const ITEMS = [
  { k: "수집 항목", v: "이름, 이메일, 연락처(선택), 지원 포지션, 한 줄 소개, 지원 동기, 관련 경험, 포트폴리오 링크(선택), 주간 참여 가능 시간, 포지션별 답변, 유입 경로" },
  { k: "수집 목적", v: `${site.privacyPurpose} 심사 및 결과 안내, 지원자와의 연락. 그 외 목적으로는 사용하지 않습니다.` },
  { k: "보유 및 이용 기간", v: site.privacyRetention },
  { k: "보관 위치", v: "Notion (Notion Labs, Inc.) 데이터베이스" },
  { k: "동의를 거부할 권리", v: "동의를 거부할 수 있으나, 이 경우 지원서 접수가 불가능합니다." },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 py-16 sm:px-8 md:px-10 md:py-24">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="font-display text-xs tracking-widest text-[var(--muted)] uppercase transition-colors hover:text-white"
        >
          &lt; 모집 공고
        </Link>

        <h1 className="mt-6 mb-4 text-2xl font-medium text-white md:text-3xl">
          개인정보 수집·이용 안내
        </h1>
        <p className="body-copy mb-12 text-[var(--text-dim)]/60">
          지원서 접수를 위해 아래와 같이 개인정보를 수집·이용합니다.
          <br />
          <strong className="text-white">{site.privacyNotice}</strong>
        </p>

        <dl className="flex flex-col">
          {ITEMS.map((row) => (
            <div key={row.k} className="border-t border-[var(--line)] py-6">
              <dt className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
                {row.k}
              </dt>
              <dd className="body-copy mt-2 text-[var(--text-dim)]">{row.v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 text-sm leading-relaxed text-[var(--muted)]">
          지원자는 언제든 본인의 개인정보 열람·정정·삭제를 요청할 수 있습니다. 접수 확인 메일에
          담긴 링크에서 직접 수정할 수 있으며, 삭제를 원하시면{" "}
          <Link href="/qna" className="text-white underline underline-offset-4">
            Q&amp;A 게시판
          </Link>
          에 남겨주세요.
        </p>
      </div>
    </main>
  );
}
