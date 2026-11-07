// 모션 그래픽 모듈 (Motion + canvas-confetti)
// - 라이브러리 로딩 실패 또는 "동작 줄이기" 설정이면 FX.ready = false → survey.js가 기존 CSS 전환을 사용
// - transform·opacity 위주로만 움직여 저사양 휴대폰에서도 부드럽게
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const M = window.Motion;
  const ok = !!(M && M.animate && M.stagger) && !reduce;
  const EASE = [0.22, 1, 0.36, 1];
  const SPRING = { type: "spring", stiffness: 420, damping: 30 };
  const done = (a) => Promise.resolve(a && (a.finished || a));
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  const FX = { ready: ok };

  // 소개·완료 화면: 요소들이 순서대로 떠오름
  FX.intro = (els) => {
    if (!ok || !els || !els.length) return;
    M.animate(els, { opacity: [0, 1], y: [18, 0] }, { delay: M.stagger(0.06), duration: 0.5, ease: EASE });
  };

  // 문항 전환: 앞으로는 오른쪽에서, 뒤로는 왼쪽에서 들어옴 + 보기 카드 순차 등장
  FX.stepIn = (el, dir) => {
    if (!ok || !el) return;
    const sgn = dir === "back" ? -1 : 1;
    M.animate(el, { opacity: [0, 1], x: [sgn * 40, 0] }, { duration: 0.38, ease: EASE });
    const items = el.querySelectorAll(".opt, textarea.field, input.field[type=email], .consent");
    if (items.length) M.animate(items, { opacity: [0, 1], y: [10, 0] }, { delay: M.stagger(0.028, { startDelay: 0.08 }), duration: 0.3, ease: "easeOut" });
  };

  // 보기 선택: 살짝 눌렸다가 튀어 오름
  FX.press = (span) => {
    if (!ok || !span) return;
    M.animate(span, { scale: [0.95, 1] }, SPRING);
  };

  // 답을 고르면 "다음" 버튼이 한 번 커지며 다음 행동을 안내
  FX.nudge = (btn) => {
    if (!ok || !btn) return;
    M.animate(btn, { scale: [1, 1.04, 1] }, { duration: 0.4, ease: "easeInOut" });
  };

  // 섹션 완료 칩: 위에서 내려왔다가 사라짐
  FX.sectionDone = (chip, text) => {
    if (!chip) return;
    chip.textContent = text;
    chip.hidden = false;
    clearTimeout(chip._t);
    if (!ok) { chip._t = setTimeout(() => { chip.hidden = true; }, 1600); return; }
    M.animate(chip, { opacity: [0, 1], y: [-10, 0], scale: [0.92, 1] }, SPRING);
    chip._t = setTimeout(() => {
      done(M.animate(chip, { opacity: 0, y: -8 }, { duration: 0.25 })).then(() => { chip.hidden = true; });
    }, 1500);
  };

  // 진행 바 반짝임 (섹션이 바뀔 때)
  FX.glow = (bar) => {
    if (!ok || !bar) return;
    M.animate(bar, { opacity: [1, 0.55, 1] }, { duration: 0.6 });
  };

  // 제출 완료: 체크 원이 튀어나오고 → 체크가 그려지고 → 꽃가루
  FX.celebrate = (stamp) => {
    if (!stamp) return;
    const path = stamp.querySelector("path");
    if (ok) {
      M.animate(stamp, { scale: [0, 1.12, 1], rotate: [-25, 0] }, { duration: 0.55, ease: EASE });
      if (path) { path.style.strokeDasharray = "1"; M.animate(path, { strokeDashoffset: [1, 0] }, { duration: 0.45, delay: 0.3, ease: "easeOut" }); }
    }
    if (!reduce && typeof window.confetti === "function") {
      const colors = [cssVar("--accent") || "#d1304f", "#F59E0B", "#10B981", "#3B82F6"];
      setTimeout(() => {
        window.confetti({ particleCount: 80, spread: 70, startVelocity: 38, origin: { x: 0.5, y: 0.3 }, colors, disableForReducedMotion: true, scalar: 0.9 });
        setTimeout(() => window.confetti({ particleCount: 40, spread: 100, origin: { x: 0.5, y: 0.3 }, colors, disableForReducedMotion: true, scalar: 0.8 }), 180);
      }, 320);
    }
  };

  // 대시보드 숫자 카운터: 이전 값 → 새 값으로 올라감
  FX.count = (el, to, fmt) => {
    if (!el) return;
    const f = fmt || String;
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (!ok || from === to) { el.textContent = f(to); return; }
    M.animate(from, to, { duration: 0.8, ease: "easeOut", onUpdate: (v) => { el.textContent = f(Math.round(v)); } });
  };

  // 새로 들어온 항목 강조
  FX.pop = (els) => {
    if (!ok || !els || !els.length) return;
    M.animate(els, { opacity: [0, 1], x: [-12, 0] }, { delay: M.stagger(0.05), duration: 0.35, ease: EASE });
  };

  window.FX = FX;
})();
