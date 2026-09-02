import { takenSlots } from "./notion";
import { slotToIso } from "./meeting-slots";

/**
 * 희망 시간 선점.
 *
 * 노션에는 유일성 제약도 트랜잭션도 없다. 그래서 "쓰기 직전에 확인"이 우리가
 * 할 수 있는 최선이다. 확인과 쓰기 사이의 틈은 같은 인스턴스 안에서는 아래
 * 큐로 막고, 인스턴스가 갈리는 경우까지는 막지 못한다.
 *
 * 지원자가 수십 명 규모라 같은 순간에 같은 칸을 누를 확률은 매우 낮고, 겹치면
 * 운영진이 어드민에서 조정할 수 있다. 여기서 외부 잠금 저장소까지 들이는 것은
 * 과하다고 봤다.
 */

/** 확인·쓰기를 한 줄로 세운다. 앞 작업이 끝나야 다음이 확인을 시작한다. */
let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  // 실패해도 줄이 멈추면 안 된다.
  queue = run.catch(() => {});
  return run;
}

export class SlotTakenError extends Error {
  constructor() {
    super("방금 다른 분이 선택한 시간입니다. 다른 시간을 골라주세요.");
    this.name = "SlotTakenError";
  }
}

/**
 * 슬롯이 비었는지 확인한 뒤 넘겨받은 작업을 실행한다.
 * 확인부터 실행까지가 한 덩어리로 묶인다.
 */
export function withSlot<T>(
  slot: string,
  excludeId: string | undefined,
  write: () => Promise<T>,
): Promise<T> {
  return serialize(async () => {
    const iso = slotToIso(slot);
    const taken = await takenSlots(excludeId);
    // 노션이 초를 붙여 돌려주므로 분 단위까지만 비교한다.
    const key = (v: string) => new Date(v).getTime();
    if (taken.some((t) => key(t) === key(iso))) throw new SlotTakenError();
    return write();
  });
}
