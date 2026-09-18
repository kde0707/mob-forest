export interface Comment {
  id: string;
  post_id: string;
  parent_comment_id: string | null;
  content: string;
  mob_nickname: string;
  report_count: number;
  created_at: string;
}

// comments 테이블 select 시 항상 이 컬럼만 지정한다.
// password_hash는 절대 클라이언트로 내려가면 안 되기 때문에 select("*")를 쓰지 않는다.
export const COMMENT_COLUMNS =
  "id, post_id, parent_comment_id, content, mob_nickname, report_count, created_at";
