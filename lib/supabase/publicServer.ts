import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 공개 읽기 전용 조회에 쓰는 서버 클라이언트. 별도 인증 없이 select RLS만 탄다.
export function getSupabasePublicServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
