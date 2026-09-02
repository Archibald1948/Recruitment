"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { positions, site } from "@/config/site";

/**
 * 홍보 링크 모음. 운영자만 쓰는 화면이라 어디에도 링크하지 않는다.
 *
 * ?ref= 는 대부분의 경우 없어도 된다 — 커뮤니티에서 링크를 타고 들어오면
 * referrer로 유입처가 자동 기록되기 때문. 다만 카카오톡처럼 referrer가
 * 실리지 않는 경로가 있어서, 그럴 때 손으로 타이핑하지 않도록 여기서 복사한다.
 */

const CHANNELS = [
  { ref: "everytime", label: "에브리타임", auto: true },
  { ref: "campuspick", label: "캠퍼스픽", auto: true },
  { ref: "okky", label: "OKKY", auto: true },
  { ref: "hola", label: "홀라(Hola!)", auto: true },
  { ref: "disquiet", label: "디스콰이엇", auto: true },
  { ref: "linkareer", label: "링커리어", auto: true },
  { ref: "discord", label: "디스코드", auto: true },
  { ref: "instagram", label: "인스타그램", auto: true },
  { ref: "threads", label: "스레드", auto: true },
  { ref: "kakao", label: "카카오톡 / 오픈채팅", auto: false },
  { ref: "dm", label: "개인 DM · 문자", auto: false },
  { ref: "offline", label: "오프라인 · QR", auto: false },
];

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 권한이 없는 환경에서는 선택 영역으로 대체한다.
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(text);
    window.setTimeout(() => setCopied((c) => (c === text ? null : c)), 1600);
  };
  return { copied, copy };
}

function LinkRow({
  label,
  url,
  note,
  copied,
  onCopy,
}: {
  label: string;
  url: string;
  note?: string;
  copied: string | null;
  onCopy: (url: string) => void;
}) {
  const isCopied = copied === url;
  return (
    <li className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] py-3">
      <span className="w-40 shrink-0 text-sm text-white">{label}</span>
      <code className="min-w-0 flex-1 truncate text-xs text-[var(--text-dim)]/60">{url}</code>
      {note && <span className="text-xs text-[var(--muted)]">{note}</span>}
      <button
        type="button"
        onClick={() => onCopy(url)}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
      >
        {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {isCopied ? "복사됨" : "복사"}
      </button>
    </li>
  );
}

export default function LinksPage() {
  const { copied, copy } = useCopy();
  const [custom, setCustom] = useState("");

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const url = (ref: string, position?: string) => {
    const q = new URLSearchParams();
    if (ref) q.set("ref", ref);
    if (position) q.set("position", position);
    return `${base}/?${q.toString()}${position ? "#apply" : ""}`;
  };

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-5 py-16 sm:px-8 md:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-medium text-white">홍보 링크</h1>
        <p className="body-copy mt-3 text-[var(--text-dim)]/60">
          <strong className="text-white">대부분은 그냥 기본 주소만 뿌려도 됩니다.</strong> 커뮤니티에서
          링크를 타고 들어오면 유입처가 자동으로 기록되기 때문입니다. 아래{" "}
          <span className="text-white">자동</span> 표시가 그 경우입니다.
          <br />
          카카오톡·DM처럼 자동 인식이 안 되는 경로에서만 해당 링크를 복사해 쓰세요.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
            기본
          </h2>
          <ul className="mt-3">
            <LinkRow
              label="기본 주소"
              url={base + "/"}
              note="자동 인식"
              copied={copied}
              onCopy={copy}
            />
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
            채널별
          </h2>
          <ul className="mt-3">
            {CHANNELS.map((c) => (
              <LinkRow
                key={c.ref}
                label={c.label}
                url={url(c.ref)}
                note={c.auto ? "자동 인식" : "링크 필요"}
                copied={copied}
                onCopy={copy}
              />
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
            포지션별 (지원 폼이 해당 포지션으로 열립니다)
          </h2>
          <ul className="mt-3">
            {positions
              .filter((p) => p.open)
              .map((p) => (
                <LinkRow
                  key={p.id}
                  label={p.title}
                  url={url("", p.id).replace("/?&", "/?")}
                  copied={copied}
                  onCopy={copy}
                />
              ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">
            직접 만들기
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              className="field max-w-xs"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^a-zA-Z0-9가-힣._-]/g, "-"))}
              placeholder="예: 학교게시판"
            />
            <button
              type="button"
              onClick={() => custom && copy(url(custom))}
              className="btn-ghost px-5 py-2.5 text-xs"
              disabled={!custom}
            >
              복사
            </button>
          </div>
          {custom && (
            <code className="mt-3 block text-xs break-all text-[var(--text-dim)]/60">
              {url(custom)}
            </code>
          )}
        </section>

        <p className="mt-12 text-xs leading-relaxed text-[var(--muted)]">
          기록된 유입 경로는 {site.name} 노션 DB의 <strong>유입 경로</strong> 열에서 볼 수 있습니다.
          첫 방문 시점의 경로를 저장하므로, 중간에 새로고침해도 값이 유지됩니다.
        </p>
      </div>
    </main>
  );
}
