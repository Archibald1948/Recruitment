import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { positions, site } from "@/config/site";

/**
 * 커뮤니티에 링크를 뿌릴 때 뜨는 카드.
 *
 * 모집 글은 첫인상이 클릭을 가른다. 썸네일이 비면 글자만 있는 밋밋한 링크가
 * 되므로, 히어로의 색과 서체를 그대로 옮겨 사이트와 같은 얼굴을 만든다.
 *
 * 폰트는 저장소에 넣어 둔 파일을 읽는다. 빌드할 때 외부에서 받아오면 그쪽이
 * 잠깐 흔들려도 배포가 깨진다. 한글은 이 카드에 쓰는 글자만 남겨 서브셋했다
 * (5.9MB → 12KB).
 */

export const alt = `${site.name} — 팀원 모집`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (name: string) => readFile(join(process.cwd(), "assets", name));

export default async function Image() {
  const [pixel, korean] = await Promise.all([
    font("PixelifySans.ttf"),
    font("KoreanSubset.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0c0c",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        {/*
          히어로의 모브~로즈 톤.
          satori는 radial-gradient를 그리지 못해(출력이 검정 그대로였다)
          linear-gradient 두 겹으로 비슷한 번짐을 만든다.
        */}
        <div
          style={{
            position: "absolute",
            // satori는 inset 단축 속성을 보지 않는다. 이걸 쓰면 레이어가
            // 크기 0으로 렌더돼 배경이 통째로 사라진다.
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(115deg, #4a4468 0%, #0c0c0c 40%, #5a3238 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            // satori는 inset 단축 속성을 보지 않는다. 이걸 쓰면 레이어가
            // 크기 0으로 렌더돼 배경이 통째로 사라진다.
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.8,
            background: "linear-gradient(210deg, transparent 25%, #db898b 100%)",
          }}
        />
        {/* 글자가 배경 위에서도 또렷하도록 한 겹 덮는다 */}
        <div
          style={{
            position: "absolute",
            // satori는 inset 단축 속성을 보지 않는다. 이걸 쓰면 레이어가
            // 크기 0으로 렌더돼 배경이 통째로 사라진다.
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, rgba(12,12,12,0.88) 0%, rgba(12,12,12,0.12) 100%)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div
            style={{
              fontFamily: "Pixel",
              fontSize: 26,
              letterSpacing: 6,
              color: "rgba(215,226,234,0.65)",
            }}
          >
            BUILDITSHIP.KRO.KR
          </div>
          <div
            style={{
              fontFamily: "Pixel",
              fontSize: 104,
              lineHeight: 1.08,
              color: "#ffffff",
              marginTop: 26,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Build It,</span>
            <span>Ship It Together</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative", gap: 22 }}>
          <div style={{ fontFamily: "Korean", fontSize: 30, color: "rgba(215,226,234,0.85)" }}>
            기획부터 개발, 배포, 운영까지 하나의 서비스를 끝까지 완성할 팀원을 모집합니다
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {positions.map((p) => (
              <div
                key={p.id}
                style={{
                  fontFamily: "Korean",
                  fontSize: 24,
                  color: "#0c0c0c",
                  background: "#ffffff",
                  borderRadius: 999,
                  padding: "10px 22px",
                }}
              >
                {p.label}
              </div>
            ))}
            <div
              style={{
                fontFamily: "Korean",
                fontSize: 24,
                color: "rgba(215,226,234,0.75)",
                marginLeft: 8,
              }}
            >
              마감 9월 11일
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pixel", data: pixel, style: "normal", weight: 400 },
        { name: "Korean", data: korean, style: "normal", weight: 600 },
      ],
    },
  );
}
