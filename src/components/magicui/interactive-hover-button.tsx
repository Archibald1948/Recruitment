// Magic UI · Interactive Hover Button (https://magicui.design/docs/components/interactive-hover-button)
// 원본은 button 전용이라 href를 받으면 Link로 그리도록만 넓혔다.
// 대상이 링크인데 button으로 바꾸면 새 탭 열기 같은 브라우저 기본 동작을 잃는다.
import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 주면 버튼 대신 링크로 그린다. 원본은 button 전용이다. */
  href?: string
}

export function InteractiveHoverButton({ children, className, href, ...props }: Props) {
  const shell = cn(
    // inline-block은 원본에 없다. button의 기본 display에 기대고 있어서,
    // 링크(<a>, 기본 inline)로 그리면 안쪽 블록 때문에 부모 폭까지 늘어난다.
    "group bg-background relative inline-block w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold",
    className
  )

  const inner = (
    <>
      <div className="flex items-center justify-center gap-2">
        <div className="bg-primary h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]"></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="text-primary-foreground absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <ArrowRight />
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={shell}>
        {inner}
      </Link>
    )
  }

  return (
    <button className={shell} {...props}>
      {inner}
    </button>
  )
}
