import { daysLeft, positions, site } from "@/config/site";
import GlyphField from "./GlyphField";
import LiveStats from "./LiveStats";
import MeshBackdrop from "./MeshBackdrop";

export default function Hero() {
  const remaining = daysLeft();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      <MeshBackdrop />
      <GlyphField />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        <h1 className="hero-headline font-display font-normal text-white">
          {site.headline.map((line, i) => (
            <span
              key={line}
              className="anim-line block"
              style={{ ["--d" as string]: `${0.12 + i * 0.18}s` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <p
          className="anim-reveal mt-5 max-w-[min(560px,92%)] whitespace-pre-line text-[clamp(0.9rem,1.6vw,1.05rem)] leading-[1.65] text-white/85"
          style={{ ["--d" as string]: "0.28s" }}
        >
          {site.subhead}
        </p>

        <a
          href="#apply"
          className="anim-reveal btn-cta mt-8 inline-block px-8 py-3.5 text-xs sm:px-10 sm:text-sm"
          style={{ ["--d" as string]: "0.4s" }}
        >
          지원하기
        </a>
      </div>

      <div className="relative z-10 w-full shrink-0 px-5 pb-8 md:pb-12">
        <LiveStats remaining={remaining} partCount={positions.length} months={3} />
      </div>
    </section>
  );
}
