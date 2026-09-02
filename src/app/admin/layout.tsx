import type { Metadata } from "next";

/** 운영자 전용 화면. 검색에 노출되지 않게 한다. */
export const metadata: Metadata = {
  title: "지원자 관리",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
