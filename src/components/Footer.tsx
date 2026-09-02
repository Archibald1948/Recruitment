import { site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--line)] px-5 py-10 sm:px-8 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display tracking-widest uppercase">{site.name}</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <p className="transition-colors hover:text-white">운영진 이메일:know.warehouse02@gmail.com</p>
          <a href="/qna" className="transition-colors hover:text-white">
            Q&amp;A 문의
          </a>
          <a href="/privacy" className="transition-colors hover:text-white">
            개인정보 수집·이용 안내
          </a>
        </div>
      </div>
    </footer>
  );
}
