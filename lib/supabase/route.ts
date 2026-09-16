import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Route Handler 안에서, 요청을 보낸 브라우저의 익명 세션 토큰으로 동작하는 클라이언트를 만든다.
// service role 키를 쓰지 않기 때문에 RLS(auth.uid() = author_id)가 그대로 적용된다.
export function getSupabaseForRequest(accessToken: string): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
    },
  });
}
