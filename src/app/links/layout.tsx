import type { Metadata } from "next";

/** 운영용 화면. 검색에 노출되지 않게 한다. */
export const metadata: Metadata = {
  title: "홍보 링크",
  robots: { index: false, follow: false },
};

export default function LinksLayout({ children }: LayoutProps<"/links">) {
  return children;
}
