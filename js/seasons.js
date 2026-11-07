// 계절 배경 효과 (canvas, 외부 라이브러리 없음)
//   봄(3~5월) 벚꽃잎 · 여름(6~8월) 수국 꽃잎 · 가을(9~11월) 낙엽 · 겨울(12~2월) 눈
// - config.js 의 SEASON_FX: "auto" | "spring" | "summer" | "autumn" | "winter" | "off"
// - 미리 보기: 주소 뒤에 ?season=winter 처럼 붙이면 그 계절로 표시
// - 소개·완료 화면은 풍성하게, 문항 화면은 적고 흐리게 (응답 방해 최소화)
// - 동작 줄이기 설정이면 끔 · 탭이 안 보이면 멈춤 · 클릭을 막지 않음
(function () {
  const SEASONS = ["spring", "summer", "autumn", "winter"];
  const api = { setMode() {}, active: false, season: null };
  window.SeasonFX = api;

  const cfg = (window.SURVEY_CONFIG && window.SURVEY_CONFIG.SEASON_FX) || "auto";
  let preview = null;
  try { preview = new URLSearchParams(location.search).get("season"); } catch (e) {}
  const m = new Date().getMonth() + 1;
  const bySeason = m >= 3 && m <= 5 ? "spring" : m >= 6 && m <= 8 ? "summer" : m >= 9 && m <= 11 ? "autumn" : "winter";
  const season = SEASONS.includes(preview) ? preview : cfg === "auto" ? bySeason : SEASONS.includes(cfg) ? cfg : null;
  if (!season || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "season-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");

  // 다크 모드 여부 (눈 색 결정)
  const isDark = () => {
    const c = getComputedStyle(document.body).backgroundColor.match(/\d+/g) || [255, 255, 255];
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) < 128;
  };

  /* ---------- 계절별 설정 ---------- */
  const PRESET = {
    spring: { colors: ["#F6B3C5", "#F29BB4", "#F8C4D2", "#EE8FAA", "#FAD0DB"], kind: "petal", size: [9, 15], vy: [16, 30], sway: [18, 34], density: 1.3, flip: true },
    summer: { colors: ["#8FB8EC", "#A9A2EA", "#BC94E2", "#EFA3C6", "#86C6DE"], kind: "petal", size: [9, 15], vy: [18, 32], sway: [16, 30], density: 1.15, flip: true },
    autumn: { colors: ["#E2721B", "#C2410C", "#D97706", "#B45309", "#E8A33D", "#9A3412", "#CA8A04"], kind: "leaf", size: [10, 24], vy: [18, 44], sway: [14, 36], density: 1, flip: true },
    winter: { colors: null, kind: "snow", size: [2, 5.2], vy: [14, 36], sway: [6, 16], density: 2.2, flip: false }
  }[season];
  const MODES = { intro: { density: 1, alpha: 0.75 }, done: { density: 1.2, alpha: 0.85 }, survey: { density: 0.45, alpha: 0.38 } };
  if (season === "winter") { MODES.intro.alpha = 0.9; MODES.done.alpha = 0.95; MODES.survey.alpha = 0.55; }

  let mode = "intro", W = 0, H = 0, dpr = 1, items = [], raf = 0, last = 0, wind = 0, windT = 0, snowColors = [];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function target() {
    const base = Math.min(26, Math.max(10, (W * H) / 38000));
    return Math.round(base * PRESET.density * MODES[mode].density);
  }
  function make(top) {
    const size = rnd(PRESET.size[0], PRESET.size[1]);
    const colors = PRESET.kind === "snow" ? snowColors : PRESET.colors;
    return {
      x: Math.random() * W, y: top ? -size * 2 - Math.random() * H * 0.3 : Math.random() * H,
      size, color: colors[(Math.random() * colors.length) | 0],
      shape: PRESET.kind === "leaf" ? (Math.random() < 0.35 ? 1 : 0) : PRESET.kind === "snow" ? (size > 3.8 ? 1 : 0) : 0,
      vy: rnd(PRESET.vy[0], PRESET.vy[1]) * (PRESET.kind === "snow" ? 0.6 + size / 6 : 1),
      sway: rnd(PRESET.sway[0], PRESET.sway[1]), swaySpeed: rnd(0.6, 1.5), phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * (PRESET.kind === "snow" ? 0.6 : 1.6),
      flip: Math.random() * Math.PI * 2, vflip: rnd(1.2, 3.0), fade: 0
    };
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    snowColors = isDark() ? ["#FFFFFF", "#E5EEF9", "#F1F5F9"] : ["#A6BEDF", "#93AFD6", "#B7CBE6", "#8AA8D0"];
    while (items.length < target()) items.push(make(false));
  }

  /* ---------- 그리기 ---------- */
  function petal(s, color) { // 벚꽃·수국 꽃잎: 끝이 살짝 갈라진 물방울 모양
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.bezierCurveTo(s * 0.9, s * 0.35, s * 0.75, -s * 0.75, s * 0.18, -s * 0.9);
    ctx.lineTo(0, -s * 0.62);
    ctx.lineTo(-s * 0.18, -s * 0.9);
    ctx.bezierCurveTo(-s * 0.75, -s * 0.75, -s * 0.9, s * 0.35, 0, s);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath(); ctx.ellipse(-s * 0.18, -s * 0.1, s * 0.16, s * 0.45, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  function leaf(s, color, shape) { // 낙엽: 0 = 둥근 잎, 1 = 단풍잎
    ctx.fillStyle = color;
    ctx.beginPath();
    if (shape === 0) {
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
  }
  function snow(s, color, shape) { // 눈: 작은 것은 동그란 눈, 큰 것은 육각 결정
    if (shape === 0) {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
      return;
    }
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, s * 0.28); ctx.lineCap = "round";
    const r = s * 2.1;
    for (let k = 0; k < 6; k++) {
      ctx.save(); ctx.rotate((Math.PI / 3) * k);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r);
      ctx.moveTo(0, -r * 0.55); ctx.lineTo(r * 0.28, -r * 0.8);
      ctx.moveTo(0, -r * 0.55); ctx.lineTo(-r * 0.28, -r * 0.8);
      ctx.stroke(); ctx.restore();
    }
  }
  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (PRESET.flip) ctx.scale(Math.max(0.18, Math.abs(Math.cos(p.flip))), 1); // 뒤집히며 떨어지는 느낌
    if (PRESET.kind === "petal") petal(p.size, p.color);
    else if (PRESET.kind === "leaf") leaf(p.size, p.color, p.shape);
    else snow(p.size, p.color, p.shape);
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    windT += dt;
    wind = Math.sin(windT * 0.25) * 14 + Math.sin(windT * 0.9) * 5; // 천천히 바뀌는 바람
    ctx.clearRect(0, 0, W, H);
    const want = target(), alpha = MODES[mode].alpha;
    for (let i = items.length - 1; i >= 0; i--) {
      const p = items[i];
      p.phase += p.swaySpeed * dt; p.rot += p.vr * dt; p.flip += p.vflip * dt;
      p.y += p.vy * dt;
      p.x += (Math.sin(p.phase) * p.sway + wind * (PRESET.kind === "snow" ? 0.6 : 1)) * dt;
      p.fade = Math.min(1, p.fade + dt * 1.5);
      if (p.y > H + p.size * 3 || p.x < -60 || p.x > W + 60) {
        if (items.length > want) { items.splice(i, 1); continue; }
        Object.assign(p, make(true));
      }
      ctx.globalAlpha = alpha * p.fade;
      draw(p);
    }
    while (items.length < want) items.push(make(true));
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } }
  function stop() { cancelAnimationFrame(raf); raf = 0; }

  api.active = true;
  api.season = season;
  api.setMode = (md) => { if (MODES[md]) mode = md; };
  window.addEventListener("resize", resize);
  try { // 다크 모드 전환 시 눈 색 갱신 (구형 브라우저는 건너뜀)
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => setTimeout(() => {
      resize();
      if (PRESET.kind === "snow") items.forEach(p => { p.color = snowColors[(Math.random() * snowColors.length) | 0]; });
    }, 50));
  } catch (e) {}
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  resize();
  start();
})();
