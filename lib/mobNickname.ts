import { createHash } from "crypto";
import { MOB_ADJECTIVES } from "./mobNames";

// IP 원본은 저장하지 않고, "IP + 오늘 날짜" 조합을 해시로 즉시 변환해서만 사용한다.
// 같은 IP는 하루 동안 같은 닉네임을 받고, 자정이 지나면 자동으로 로테이션된다.
function todaySalt(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function hashToInt(input: string): number {
  const digest = createHash("sha256").update(input).digest();
  return digest.readUInt32BE(0);
}

export function generateMobNickname(ip: string): string {
  const salt = todaySalt();
  const adjectiveSeed = hashToInt(`${ip}:${salt}:adjective`);
  const numberSeed = hashToInt(`${ip}:${salt}:number`);

  const adjective = MOB_ADJECTIVES[adjectiveSeed % MOB_ADJECTIVES.length];
  const number = 100 + (numberSeed % 900); // 100~999

  return `${adjective} 모브 #${number}`;
}

export function getRequestIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
