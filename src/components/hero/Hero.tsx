import { daysLeft, positions, site } from "@/config/site";
import DotMatrixHeadline from "./DotMatrixHeadline";
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
        <h1 className="w-full max-w-[1020px]">
          <DotMatrixHeadline lines={[...site.headline]} />
        </h1>

        <p
          className="anim-reveal mt-5 max-w-[min(560px,92%)] whitespace-pre-line text-[clamp(0.95rem,1.7vw,1.1rem)] leading-[1.7] font-medium text-white"
          style={{
            ["--d" as string]: "0.28s",
            textShadow: "0 1px 14px rgba(12,8,10,0.55)",
          }}
        >
          {site.subhead}
        </p>

        <a
          href="#apply"
          className="anim-reveal btn-cta btn-pulse mt-8 inline-block px-8 py-3.5 text-xs sm:px-10 sm:text-sm"
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
