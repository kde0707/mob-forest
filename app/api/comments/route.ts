import { NextRequest, NextResponse } from "next/server";
import { getSupabaseForRequest } from "@/lib/supabase/route";
import { generateMobNickname } from "@/lib/mobNickname";
import { COMMENT_COLUMNS } from "@/types/comment";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.replace(/^Bearer\s+/i, "");

  if (!accessToken) {
    return NextResponse.json({ error: "익명 세션이 필요해요." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const postId = typeof body?.post_id === "string" ? body.post_id : "";
  const parentCommentId =
    typeof body?.parent_comment_id === "string" ? body.parent_comment_id : null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!postId) {
    return NextResponse.json({ error: "글 정보가 올바르지 않아요." }, { status: 400 });
  }

  if (!content || content.length > 500) {
    return NextResponse.json(
      { error: "댓글은 1~500자 사이여야 해요." },
      { status: 400 }
    );
  }

  if (password.length < 4 || password.length > 30) {
    return NextResponse.json(
      { error: "삭제 비밀번호는 4~30자여야 해요." },
      { status: 400 }
    );
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

  const mobNickname = generateMobNickname(user.id);

  const { data: passwordHash, error: hashError } = await supabase.rpc(
    "hash_password",
    { password }
  );

  if (hashError || !passwordHash) {
    return NextResponse.json({ error: "비밀번호 처리에 실패했어요." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: postId,
      parent_comment_id: parentCommentId,
      content,
      mob_nickname: mobNickname,
      password_hash: passwordHash,
    })
    .select(COMMENT_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}
