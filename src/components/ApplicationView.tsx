"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ApplyForm, { type FormValues } from "@/components/ApplyForm";
import { positionById } from "@/config/site";

const FLOW = ["접수됨", "서류 검토", "커피챗", "합류"] as const;

interface Record_ {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  positionId: string;
  status: string;
  oneLiner: string;
  motivation: string;
  experience: string;
  answersRaw: string;
  portfolio: string;
  availability: string;
  createdAt: string;
  updatedAt: string;
  editable: boolean;
}

function StatusTrack({ status }: { status: string }) {
  const held = status === "보류";
  const idx = FLOW.indexOf(status as (typeof FLOW)[number]);

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-white/[0.03] p-6 md:p-8">
      <p className="font-display text-xs tracking-widest text-[var(--muted)] uppercase">Status</p>

      {held ? (
        <p className="mt-4 text-[var(--text-dim)]">
          현재 <strong className="text-white">보류</strong> 상태입니다. 진행 상황이 정해지면
          메일로 안내드리겠습니다.
        </p>
      ) : (
        <ol className="mt-6 flex flex-col gap-0 sm:flex-row sm:items-center">
          {FLOW.map((step, i) => {
            const reached = idx >= i;
            return (
              <li key={step} className="flex flex-1 items-center gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium ${
                      reached ? "bg-white text-[#0c0c0c]" : "border border-[var(--line)] text-[var(--muted)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={`text-sm ${reached ? "text-white" : "text-[var(--muted)]"}`}>
                    {step}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <span
                    className={`mx-2 hidden h-px flex-1 sm:block ${
                      idx > i ? "bg-white/60" : "bg-[var(--line)]"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function ApplicationView({ id, token }: { id: string; token: string }) {
  const [record, setRecord] = useState<Record_ | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/applications/${id}?t=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.error ?? "지원서를 불러오지 못했습니다.");
        return data as Record_;
      })
      .then(setRecord)
      .catch((e: Error) => setError(e.message));
  }, [id, token]);

  const message = token
    ? error
    : "링크가 올바르지 않습니다. 메일로 받으신 링크를 그대로 열어주세요.";

  if (message) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-[28px] border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 px-6 py-12 text-center">
        <AlertCircle className="h-6 w-6 text-[#ffb3b3]" />
        <p className="text-sm text-[#ffb3b3]">{message}</p>
        <Link href="/" className="btn-ghost mt-2 px-6 py-2.5 text-xs">
          모집 공고로
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-[var(--muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        지원 내역을 불러오는 중
      </div>
    );
  }

  const answers: Record<string, string> = {};
  const position = positionById(record.positionId);
  if (position) {
    // 저장된 "[질문]\n답변" 블록을 다시 질문 id로 되돌린다.
    for (const q of position.questions) {
      const marker = `[${q.label}]\n`;
      const at = record.answersRaw.indexOf(marker);
      if (at === -1) continue;
      const rest = record.answersRaw.slice(at + marker.length);
      const end = rest.indexOf("\n\n[");
      answers[q.id] = (end === -1 ? rest : rest.slice(0, end)).trim();
    }
  }

  const initial: Partial<FormValues> = {
    name: record.name,
    email: record.email,
    phone: record.phone,
    position: record.positionId,
    oneLiner: record.oneLiner,
    motivation: record.motivation,
    experience: record.experience,
    portfolio: record.portfolio,
    availability: record.availability,
    agree: true,
    answers,
  };

  return (
    <div className="flex flex-col gap-12">
      <StatusTrack status={record.status} />

      <div>
        <h2 className="font-display text-sm tracking-widest text-[var(--muted)] uppercase">
          지원 내용 수정
        </h2>
        <p className="mt-2 mb-8 text-sm text-[var(--text-dim)]/60">
          {record.editable
            ? "잘못 적었거나 보완하고 싶은 내용이 있으면 지금 수정할 수 있습니다."
            : "모집이 마감되어 수정은 불가능하며, 내용 확인만 가능합니다."}
        </p>
        <ApplyForm
          mode="edit"
          initial={initial}
          token={token}
          applicationId={record.id}
          editable={record.editable}
        />
      </div>
    </div>
  );
}
