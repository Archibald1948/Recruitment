import About from "@/components/About";
import SiteLightRays from "@/components/SiteLightRays";
import Apply from "@/components/Apply";
import Footer from "@/components/Footer";
import Hero from "@/components/hero/Hero";
import Marquee from "@/components/Marquee";
import Positions from "@/components/Positions";
import Process from "@/components/Process";
import { site } from "@/config/site";

// Q&A 맛보기가 노션을 읽는다. 답변이 달리면 이 주기 안에 랜딩에도 반영된다.
export const revalidate = 300;

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <SiteLightRays />

      <Hero />
      <Marquee top={[...site.marquee.top]} bottom={[...site.marquee.bottom]} />
      <About />
      <Positions />
      <Process />
      <Apply />
      <Footer />
    </main>
  );
}
