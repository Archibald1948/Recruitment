import About from "@/components/About";
import Apply from "@/components/Apply";
import Footer from "@/components/Footer";
import Hero from "@/components/hero/Hero";
import Marquee from "@/components/Marquee";
import Positions from "@/components/Positions";
import Process from "@/components/Process";
import { site } from "@/config/site";

export default function Home() {
  return (
    <main className="overflow-x-clip bg-[#0c0c0c]">
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
