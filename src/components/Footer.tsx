import { site } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[#0c0c0c] px-5 py-10 sm:px-8 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <span className="font-display tracking-widest uppercase">{site.name}</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="/privacy" className="transition-colors hover:text-white">
            개인정보 수집·이용 안내
          </a>
          {site.contactEmail && (
            <a href={`mailto:${site.contactEmail}`} className="transition-colors hover:text-white">
              {site.contactEmail}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
