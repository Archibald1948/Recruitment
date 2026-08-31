import type { Metadata } from "next";

/** 실험용 화면. 검색에 노출되지 않게 한다. */
export const metadata: Metadata = {
  title: "Hero Lab",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: LayoutProps<"/lab">) {
  return children;
}
