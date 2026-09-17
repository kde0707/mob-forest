import { createHash } from "crypto";
import { MOB_ADJECTIVES } from "./mobNames";

// 닉네임은 익명 세션 ID(auth.uid)에서 결정론적으로 뽑는다.
// 같은 세션이면 항상 같은 닉네임 → 같은 사람이 쓴 글이 같은 닉네임으로 노출된다.
// 세션 ID 원본은 저장하지 않고 해시로만 사용한다. (IP나 날짜에 의존하지 않으므로
// 네트워크가 바뀌거나 날이 지나도 세션이 살아있는 한 닉네임이 유지된다)
function hashToInt(input: string): number {
  const digest = createHash("sha256").update(input).digest();
  return digest.readUInt32BE(0);
}

export function generateMobNickname(sessionId: string): string {
  const adjectiveSeed = hashToInt(`${sessionId}:adjective`);
  const numberSeed = hashToInt(`${sessionId}:number`);

  const adjective = MOB_ADJECTIVES[adjectiveSeed % MOB_ADJECTIVES.length];
  const number = 100 + (numberSeed % 900); // 100~999

  return `${adjective} 모브 #${number}`;
}
