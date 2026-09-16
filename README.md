# 모브숲 (mob-forest)

치이카와 세계관에서 이름 없는 배경 캐릭터를 부르는 "모브"에서 따온, 로그인 없는 익명 팬 커뮤니티입니다.
**비공식 팬 프로젝트**이며 공식 로고·서체·콘텐츠와는 무관합니다.

## 기술 스택

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + RLS, Anonymous Sign-In)

## 시작하기

```bash
npm install
npm run dev
```

### Supabase 연결

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. **Authentication > Sign In / Providers > Anonymous Sign-Ins** 활성화
   (로그인 없이도 "본인 글만 삭제 가능"한 익명 세션을 만드는 핵심 기능이에요)
3. **SQL Editor**에서 [`supabase/schema.sql`](./supabase/schema.sql) 실행
4. `.env.local.example`을 `.env.local`로 복사하고 프로젝트 URL/anon key 입력

Supabase를 연결하지 않아도 UI는 그대로 볼 수 있지만, 글쓰기/공감/신고는 비활성화됩니다.

## MVP 범위 (1단계)

- 익명 글쓰기 (목격담 / 잡담 / 짤·밈)
- 공감 버튼
- 신고 버튼 (최소 모더레이션 장치)

댓글, 익명 쪽지, 검색/인기글 정렬은 2~3단계로 미뤄둔 범위예요. 자세한 기획 배경은 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

## 모브 닉네임

글을 남기면 "형용사 + 모브 + 숫자 3자리" 닉네임이 자동으로 붙어요 (예: `몰래 모브 #482`).
같은 IP는 하루 동안 같은 닉네임을 받고 자정에 로테이션되며, 원본 IP는 저장하지 않고 해시로만 사용합니다.
형용사 목록은 [`lib/mobNames.ts`](./lib/mobNames.ts)에서 계속 추가할 수 있어요.

## 디자인

`design.md`에 정리된 구조적 원칙(타일 교차 레이아웃, 스페이싱 스케일, 필 버튼 문법, 카드 컴포넌트 체계)은
그대로 가져오되, 색상·타이포·형태는 치이카와 팬 굿즈 느낌으로 재해석했습니다.

- 크림/민트/핑크/라벤더 파스텔 팔레트, 순검정 대신 따뜻한 브라운 잉크(`--ink`)
- 헤드라인은 `Jua`(둥글고 통통한 손글씨체), 본문은 `Gowun Dodum`
- 카드에 굵은 2.5px 테두리 + 오프셋 그림자를 줘서 스티커/굿즈 같은 질감 연출
- 카테고리별 컬러 코딩(목격담=민트, 잡담=핑크, 짤·밈=옐로우)
