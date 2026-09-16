import { getSupabaseBrowserClient } from "./client";

// 로그인 없이도 "본인 글"을 구분할 수 있도록 Supabase 익명 인증 세션을 보장한다.
// 브라우저 storage에 세션이 저장되므로, 계정 생성이나 개인정보 입력 없이도
// 같은 브라우저에서는 auth.uid()가 유지된다.
export async function ensureAnonSession(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) return sessionData.session.access_token;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("익명 세션 생성 실패", error.message);
    return null;
  }

  return data.session?.access_token ?? null;
}
