import { NextRequest, NextResponse } from "next/server";
import { getSupabaseForRequest } from "@/lib/supabase/route";
import { generateMobNickname } from "@/lib/mobNickname";
import { isCategory } from "@/types/post";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return NextResponse.json({ error: "익명 세션이 필요해요." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const category = body?.category;
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const imageUrl = typeof body?.image_url === "string" ? body.image_url.trim() : null;

  if (!category || !isCategory(category)) {
    return NextResponse.json({ error: "카테고리가 올바르지 않아요." }, { status: 400 });
  }

  if (!content || content.length > 2000) {
    return NextResponse.json({ error: "내용은 1~2000자 사이여야 해요." }, { status: 400 });
  }

  const supabase = getSupabaseForRequest(accessToken);
  if (!supabase) {
    return NextResponse.json({ error: "서버 설정이 아직 안 됐어요." }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "익명 세션이 유효하지 않아요." }, { status: 401 });
  }

  // 닉네임은 익명 세션 ID 기준으로 뽑아 같은 세션이면 항상 같은 닉네임이 되게 한다
  const mobNickname = generateMobNickname(user.id);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      category,
      content,
      image_url: imageUrl || null,
      mob_nickname: mobNickname,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post: data }, { status: 201 });
}
