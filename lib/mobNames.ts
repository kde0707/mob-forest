// 모브 닉네임에 쓰이는 형용사 풀. 계속 추가 가능하게 배열로만 관리한다.
export const MOB_ADJECTIVES = [
  "지나가던",
  "쭈굴",
  "구석",
  "버티는",
  "몰래",
  "얼떨결",
  "몽글",
  "눈치보는",
  "배고픈",
  "잠온",
  "후드쓴",
  "오늘도",
  "졸린",
  "몽실",
  "소심한",
  "두리번",
  "뭉친",
  "방금",
  "살금살금",
  "낮잠자던",
] as const;

export function pickAdjective(seed: number): string {
  const index = seed % MOB_ADJECTIVES.length;
  return MOB_ADJECTIVES[index];
}

// 목업 모드 등 서버(IP) 없이 즉석에서 닉네임이 필요할 때 쓰는 랜덤 버전
export function randomMobNickname(): string {
  const adjective =
    MOB_ADJECTIVES[Math.floor(Math.random() * MOB_ADJECTIVES.length)];
  const number = 100 + Math.floor(Math.random() * 900);
  return `${adjective} 모브 #${number}`;
}
