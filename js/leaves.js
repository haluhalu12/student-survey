// 가을 낙엽 배경 (canvas, 외부 라이브러리 없음)
// - config.js 의 LEAVES: "auto"(9~11월만) | "on" | "off"
// - 소개·완료 화면은 풍성하게, 문항 화면은 적고 흐리게 (응답 방해 최소화)
// - 동작 줄이기 설정이면 끔 · 탭이 안 보이면 멈춤 · 클릭을 막지 않음
(function () {
  const cfg = (window.SURVEY_CONFIG && window.SURVEY_CONFIG.LEAVES) || "auto";
  const month = new Date().getMonth() + 1;
  const enabled = cfg === "on" || (cfg === "auto" && month >= 9 && month <= 11);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const api = { setMode() {}, active: false };
  window.Leaves = api;
  if (!enabled || reduce) return;

  const canvas = document.createElement("canvas");
  canvas.className = "leaves-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  const COLORS = ["#E2721B", "#C2410C", "#D97706", "#B45309", "#E8A33D", "#9A3412", "#CA8A04"];
  const MODES = { intro: { density: 1, alpha: 0.75 }, done: { density: 1.2, alpha: 0.85 }, survey: { density: 0.45, alpha: 0.38 } };
  let mode = "intro", W = 0, H = 0, dpr = 1, leaves = [], raf = 0, last = 0, wind = 0, windT = 0;

  function target() {
    const base = Math.round(Math.min(26, Math.max(10, (W * H) / 38000)));
    return Math.round(base * MODES[mode].density);
  }
  function makeLeaf(top) {
    const size = 10 + Math.random() * 14;
    return {
      x: Math.random() * W, y: top ? -size * 2 - Math.random() * H * 0.3 : Math.random() * H,
      size, color: COLORS[(Math.random() * COLORS.length) | 0], shape: Math.random() < 0.35 ? 1 : 0,
      vy: 18 + Math.random() * 26, sway: 14 + Math.random() * 22, swaySpeed: 0.6 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 1.6,
      flip: Math.random() * Math.PI * 2, vflip: 1.2 + Math.random() * 1.8, fade: 0
    };
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    while (leaves.length < target()) leaves.push(makeLeaf(false));
  }
  // 잎 모양: 0 = 둥근 잎(잎맥), 1 = 단풍잎 실루엣
  function drawLeaf(l) {
    const s = l.size;
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.rot);
    ctx.scale(Math.max(0.15, Math.abs(Math.cos(l.flip))), 1); // 뒤집히며 떨어지는 느낌
    ctx.fillStyle = l.color;
    ctx.beginPath();
    if (l.shape === 0) {
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.75, -s * 0.55, s * 0.6, s * 0.5, 0, s);
      ctx.bezierCurveTo(-s * 0.6, s * 0.5, -s * 0.75, -s * 0.55, 0, -s);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.85); ctx.lineTo(0, s * 1.25); ctx.stroke();
    } else {
      const pts = [[0, -1], [0.22, -0.45], [0.62, -0.62], [0.45, -0.15], [0.9, 0.05], [0.4, 0.3], [0.48, 0.7], [0, 0.45], [-0.48, 0.7], [-0.4, 0.3], [-0.9, 0.05], [-0.45, -0.15], [-0.62, -0.62], [-0.22, -0.45]];
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0] * s, p[1] * s) : ctx.moveTo(p[0] * s, p[1] * s)));
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, s * 0.45); ctx.lineTo(0, s * 1.0); ctx.stroke();
    }
    ctx.restore();
  }
  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    windT += dt;
    wind = Math.sin(windT * 0.25) * 14 + Math.sin(windT * 0.9) * 5; // 천천히 바뀌는 바람
    ctx.clearRect(0, 0, W, H);
    const want = target(), alpha = MODES[mode].alpha;
    for (let i = leaves.length - 1; i >= 0; i--) {
      const l = leaves[i];
      l.phase += l.swaySpeed * dt; l.rot += l.vr * dt; l.flip += l.vflip * dt;
      l.y += l.vy * dt;
      l.x += (Math.sin(l.phase) * l.sway + wind) * dt;
      l.fade = Math.min(1, l.fade + dt * 1.5);
      if (l.y > H + l.size * 2 || l.x < -60 || l.x > W + 60) {
        if (leaves.length > want) { leaves.splice(i, 1); continue; }
        Object.assign(l, makeLeaf(true));
      }
      ctx.globalAlpha = alpha * l.fade;
      drawLeaf(l);
    }
    while (leaves.length < want) leaves.push(makeLeaf(true));
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  api.active = true;
  api.setMode = (m) => { if (MODES[m]) mode = m; };
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  resize();
  start();
})();
