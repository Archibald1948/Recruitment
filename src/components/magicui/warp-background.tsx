// Magic UI · Warp Background (https://magicui.design/docs/components/warp-background)
// 레지스트리 원본에 두 가지를 손봤다.
//  1) 빔 색을 팔레트에서 고를 수 있게 했다. 원본은 hue를 완전 무작위로 뽑아
//     무지개색 빔이 나오는데, 이 사이트의 절제된 색과 맞지 않는다.
//  2) 무작위 값 생성을 마운트 후로 미뤘다. 원본은 렌더 중에 Math.random()을
//     불러 서버와 클라이언트 결과가 어긋난다(하이드레이션 불일치).
"use client"

import React, { useCallback, useEffect, useState, type HTMLAttributes } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
  /** 빔 색 목록. 비우면 원본처럼 무작위 색을 쓴다. */
  beamColors?: string[]
}

interface BeamSpec {
  x: number
  delay: number
  color: string
  aspectRatio: number
}

const Beam = ({
  width,
  x,
  delay,
  duration,
  color,
  aspectRatio,
}: {
  width: string | number
  x: string | number
  delay: number
  duration: number
  color: string
  aspectRatio: number
}) => {
  return (
    <motion.div
      style={
        {
          "--x": `${x}`,
          "--width": `${width}`,
          "--aspect-ratio": `${aspectRatio}`,
          "--background": `linear-gradient(${color}, transparent)`,
        } as React.CSSProperties
      }
      className={`absolute top-0 left-(--x) aspect-[1/var(--aspect-ratio)] w-(--width) [background:var(--background)]`}
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  )
}

export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "var(--border)",
  beamColors,
  ...props
}) => {
  const generateBeams = useCallback((): BeamSpec[] => {
    const beams: BeamSpec[] = []
    const cellsPerSide = Math.floor(100 / beamSize)
    const step = cellsPerSide / beamsPerSide

    for (let i = 0; i < beamsPerSide; i++) {
      beams.push({
        x: Math.floor(i * step),
        delay: Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin,
        color: beamColors?.length
          ? beamColors[Math.floor(Math.random() * beamColors.length)]
          : `hsl(${Math.floor(Math.random() * 360)} 80% 60%)`,
        aspectRatio: Math.floor(Math.random() * 10) + 1,
      })
    }
    return beams
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin, beamColors])

  const [sides, setSides] = useState<BeamSpec[][]>([[], [], [], []])

  useEffect(() => {
    // 서버에서 만들면 난수가 어긋나므로 마운트 후에 생성한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSides([generateBeams(), generateBeams(), generateBeams(), generateBeams()])
  }, [generateBeams])

  const [topBeams, rightBeams, bottomBeams, leftBeams] = sides

  return (
    <div className={cn("relative rounded border p-20", className)} {...props}>
      <div
        style={
          {
            "--perspective": `${perspective}px`,
            "--grid-color": gridColor,
            "--beam-size": `${beamSize}%`,
          } as React.CSSProperties
        }
        className={
          "@container-[size] pointer-events-none absolute top-0 left-0 size-full overflow-hidden [clipPath:inset(0)] perspective-(--perspective) transform-3d"
        }
      >
        {/* top side */}
        <div className="@container absolute z-20 h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {topBeams.map((beam, index) => (
            <Beam
              key={`top-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              color={beam.color}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* bottom side */}
        <div className="@container absolute top-full h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {bottomBeams.map((beam, index) => (
            <Beam
              key={`bottom-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              color={beam.color}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* left side */}
        <div className="@container absolute top-0 left-0 h-[100cqmax] w-[100cqh] origin-[0%_0%] transform-[rotate(90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {leftBeams.map((beam, index) => (
            <Beam
              key={`left-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              color={beam.color}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
        {/* right side */}
        <div className="@container absolute top-0 right-0 h-[100cqmax] w-[100cqh] origin-[100%_0%] transform-[rotate(-90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {rightBeams.map((beam, index) => (
            <Beam
              key={`right-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
              color={beam.color}
              aspectRatio={beam.aspectRatio}
            />
          ))}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  )
}
