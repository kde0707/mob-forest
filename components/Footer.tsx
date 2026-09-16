export default function Footer() {
  return (
    <footer className="border-t-[2.5px] border-ink bg-canvas-lavender/60">
      <div className="mx-auto max-w-4xl px-5 py-8 text-center">
        <p className="font-display text-sm text-ink-soft">
          모브숲은 치이카와를 사랑하는 팬이 만든{" "}
          <span className="text-ink">비공식 팬 커뮤니티</span>예요.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          치이카와 및 관련 캐릭터, 로고, 상표의 권리는 원작자와 저작권자에게 있으며
          모브숲은 이와 무관한 개인 팬 프로젝트입니다.
          <br />
          공식 굿즈나 콘텐츠가 아니니 참고해주세요.
        </p>
      </div>
    </footer>
  );
}
