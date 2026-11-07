(function () {
  const S = window.SURVEY;
  const C = window.SURVEY_CONFIG || {};
  const Store = window.SurveyStore;
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const allQ = S.sections.flatMap(s => s.questions);
  const qById = Object.fromEntries(allQ.map(q => [q.id, q]));
  const LANG = Object.fromEntries(S.languages.map(l => [l.code, l.name]));
  const KEY_STORE = "survey_admin_key";
  const REFRESH = Math.max(5, Number(C.REFRESH_SECONDS) || 15);

  let key = "";
  let rows = [];
  let timer = null;
  const charts = {};

  /* ---------- helpers ---------- */
  const ko = (o) => o == null ? "" : (typeof o === "string" ? o : (o.ko || o.en));
  const splitMulti = (v) => v == null || v === "" ? [] : String(v).split(" | ").map(s => s.trim()).filter(Boolean);
  function labelOf(q, code) {
    const op = (q.options || []).find(o => String(o.value) === String(code));
    return op ? ko(op.label) : String(code);
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function fmtTime(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return String(iso || "");
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function setStatus(kind, text) {
    const pill = $("#statusPill");
    pill.className = "pill " + kind;
    pill.textContent = text;
  }

  /* ---------- data ---------- */
  async function load() {
    try {
      rows = await Store.fetchRows(key);
      rows.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      $("#dashMsg").hidden = true;
      setStatus(Store.isDemo() ? "demo" : "live", Store.isDemo() ? "데모 모드" : "실시간 연결");
      render();
      $("#updated").textContent = "마지막 갱신 " + new Date().toLocaleTimeString("ko-KR") + ` · ${REFRESH}초마다 자동 갱신`;
      return true;
    } catch (err) {
      if (String(err.message).includes("unauthorized")) {
        stopTimer();
        try { localStorage.removeItem(KEY_STORE); } catch (e) {}
        showKey("관리자 키가 맞지 않아요. Apps Script의 ADMIN_KEY 값을 확인해 주세요.");
        return false;
      }
      setStatus("err", "연결 오류");
      $("#dashMsg").textContent = "결과를 불러오지 못했어요. config.js의 ENDPOINT 주소와 Apps Script 배포 설정(액세스: 모든 사용자)을 확인해 주세요. 잠시 후 자동으로 다시 시도합니다.";
      $("#dashMsg").hidden = false;
      return false;
    }
  }

  function startTimer() { stopTimer(); timer = setInterval(() => { if (!document.hidden) load(); }, REFRESH * 1000); }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }

  /* ---------- render ---------- */
  function render() {
    renderKpis();
    $("#emptyState").hidden = rows.length > 0;
    renderCharts();
    renderQuotes();
    renderRecent();
  }

  function renderKpis() {
    const n = rows.length;
    const today = new Date().toDateString();
    const todayN = rows.filter(r => new Date(r.timestamp).toDateString() === today).length;
    const mobile = rows.filter(r => r.device === "mobile").length;
    const consent = rows.filter(r => r.consent === "yes" && r.email).length;
    $("#kTotal").textContent = n.toLocaleString("ko-KR");
    $("#kTotalS").textContent = n ? "첫 응답 " + fmtTime(rows[0].timestamp) : " ";
    $("#kToday").textContent = todayN.toLocaleString("ko-KR");
    $("#kTodayS").textContent = new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
    $("#kMobile").textContent = n ? Math.round(mobile / n * 100) + "%" : "–";
    $("#kMobileS").textContent = n ? `모바일 ${mobile} · PC ${n - mobile}` : " ";
    $("#kConsent").textContent = consent.toLocaleString("ko-KR");

    const byLang = {};
    rows.forEach(r => { byLang[r.lang] = (byLang[r.lang] || 0) + 1; });
    $("#headNote").textContent = n
      ? "응답 언어: " + Object.entries(byLang).sort((a, b) => b[1] - a[1]).map(([l, c]) => `${LANG[l] || l} ${c}`).join(" · ")
      : "응답이 들어오면 문항별 결과가 자동으로 표시됩니다.";
  }

  function countFor(q) {
    const counts = Object.fromEntries((q.options || []).map(o => [o.value, 0]));
    let answered = 0;
    rows.forEach(r => {
      const vals = q.type === "multi" ? splitMulti(r[q.id]) : (r[q.id] == null || r[q.id] === "" ? [] : [String(r[q.id])]);
      if (vals.length) answered++;
      vals.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    });
    return { counts, answered };
  }

  function ensureLayout() {
    if ($("#charts").dataset.built) return;
    $("#charts").dataset.built = "1";
    $("#charts").innerHTML = S.sections.map(sec => {
      const qs = sec.questions.filter(q => ["single", "multi", "scale"].includes(q.type));
      if (!qs.length) return "";
      return `<div class="section-label">${esc(ko(sec.title))}</div><div class="grid">` + qs.map(q => {
        const n = q.type === "scale" ? 5 : q.options.length;
        const h = n * 30 + 24;
        const extra = q.type === "scale" ? `<div class="scale-avg"><b id="avg_${q.id}">–</b><span>/ 5 평균 · 1 ${esc(ko(q.low))} ↔ 5 ${esc(ko(q.high))}</span></div>` : "";
        return `<div class="card"><h3>${esc(ko(q.label))}</h3><div class="sub" id="sub_${q.id}"></div>${extra}
          <div class="chart-box" style="height:${h}px"><canvas id="c_${q.id}" role="img" aria-label="${esc(ko(q.label))}"></canvas></div></div>`;
      }).join("") + `</div>`;
    }).join("");
  }

  function renderCharts() {
    ensureLayout();
    const accent = cssVar("--accent"), ink = cssVar("--ink"), muted = cssVar("--muted"), line = cssVar("--line");
    allQ.filter(q => ["single", "multi", "scale"].includes(q.type)).forEach(q => {
      let labels, data, answered;
      if (q.type === "scale") {
        const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let sum = 0; answered = 0;
        rows.forEach(r => { const v = Number(r[q.id]); if (v >= 1 && v <= 5) { c[v]++; sum += v; answered++; } });
        labels = ["1", "2", "3", "4", "5"];
        data = labels.map(l => c[l]);
        $("#avg_" + q.id).textContent = answered ? (sum / answered).toFixed(2) : "–";
      } else {
        const res = countFor(q);
        answered = res.answered;
        const pairs = Object.entries(res.counts).map(([v, n]) => [labelOf(q, v), n]);
        if (q.type === "multi") pairs.sort((a, b) => b[1] - a[1]);
        labels = pairs.map(p => p[0]);
        data = pairs.map(p => p[1]);
      }
      $("#sub_" + q.id).textContent = `${answered}명 응답` + (q.type === "multi" ? ` · 복수 선택${q.max ? " (최대 " + q.max + "개)" : ""}, 비율은 응답자 대비` : "");
      const pct = data.map(n => answered ? Math.round(n / answered * 100) : 0);

      const existing = charts[q.id];
      if (existing) {
        existing.data.labels = labels;
        existing.data.datasets[0].data = data;
        existing.$pct = pct;
        existing.update("none");
        return;
      }
      const ctx = document.getElementById("c_" + q.id);
      const chart = new Chart(ctx, {
        type: "bar",
        data: { labels, datasets: [{ data, backgroundColor: accent, borderRadius: 4, barThickness: 16, maxBarThickness: 18 }] },
        options: {
          indexAxis: q.type === "scale" ? "x" : "y",
          responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
          layout: { padding: q.type === "scale" ? { top: 18 } : { right: 64 } },
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => ` ${c.raw}명 (${(c.chart.$pct || [])[c.dataIndex] || 0}%)` } }
          },
          scales: {
            x: { beginAtZero: true, ticks: { color: muted, precision: 0, font: { size: 11 } }, grid: { color: line } },
            y: { beginAtZero: true, ticks: { color: ink, precision: 0, font: { size: 12 }, autoSkip: false }, grid: { display: false } }
          }
        },
        plugins: [{
          id: "valueLabels",
          afterDatasetsDraw(c) {
            const { ctx: g } = c;
            const meta = c.getDatasetMeta(0);
            g.save();
            g.fillStyle = muted;
            g.font = "600 11px 'IBM Plex Mono', monospace";
            meta.data.forEach((bar, i) => {
              const v = c.data.datasets[0].data[i];
              if (!v) return;
              const txt = `${v} · ${(c.$pct || [])[i] || 0}%`;
              if (c.options.indexAxis === "y") { g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(txt, bar.x + 6, bar.y); }
              else { g.textAlign = "center"; g.textBaseline = "bottom"; g.fillText(txt, bar.x, bar.y - 4); }
            });
            g.restore();
          }
        }]
      });
      chart.$pct = pct;
      chart.update("none");
      charts[q.id] = chart;
    });
  }

  function renderQuotes() {
    const items = [];
    rows.slice().reverse().forEach(r => {
      if (r.story) items.push({ text: r.story, meta: `${labelOf(qById.country, r.country)} · ${labelOf(qById.degree, r.degree)} · ${fmtTime(r.timestamp)}` });
      allQ.forEach(q => {
        const o = r[q.id + "_other"];
        if (o) items.push({ text: o, meta: `기타 입력 — ${ko(q.label)} · ${fmtTime(r.timestamp)}` });
      });
    });
    $("#quotes").innerHTML = items.length
      ? items.map(i => `<div class="quote">${esc(i.text)}<small>${esc(i.meta)}</small></div>`).join("")
      : `<div class="empty" style="padding:24px">아직 자유 의견이 없어요.</div>`;
  }

  function renderRecent() {
    const cols = [
      ["시간", r => fmtTime(r.timestamp)],
      ["언어", r => LANG[r.lang] || r.lang],
      ["기기", r => r.device === "mobile" ? "모바일" : "PC"],
      ["국적", r => labelOf(qById.country, r.country)],
      ["과정", r => labelOf(qById.degree, r.degree)],
      ["지역", r => labelOf(qById.region, r.region)],
      ["주거", r => labelOf(qById.housing, r.housing)],
      ["만족도", r => r.satisfaction || ""],
      ["지불 의향", r => labelOf(qById.pay, r.pay)],
      ["인터뷰", r => r.consent === "yes" && r.email ? "동의" : ""]
    ];
    const recent = rows.slice(-20).reverse();
    $("#recent").innerHTML = `<thead><tr>${cols.map(c => `<th>${c[0]}</th>`).join("")}</tr></thead><tbody>` +
      (recent.length ? recent.map(r => `<tr>${cols.map(c => `<td>${esc(c[1](r))}</td>`).join("")}</tr>`).join("")
        : `<tr><td colspan="${cols.length}" style="text-align:center;color:var(--muted)">응답 없음</td></tr>`) + `</tbody>`;
  }

  /* ---------- CSV ---------- */
  function exportCsv() {
    const base = ["timestamp", "id", "lang", "device"];
    const keys = [...base];
    allQ.forEach(q => { keys.push(q.id); if ((q.options || []).some(o => o.other)) keys.push(q.id + "_other"); if (q.type === "contact") keys.push("consent"); });
    rows.forEach(r => Object.keys(r).forEach(k => { if (!keys.includes(k)) keys.push(k); }));
    const head = keys.map(k => qById[k] ? ko(qById[k].label) : k);
    const cell = (k, r) => {
      const q = qById[k];
      let v = r[k];
      if (q && (q.type === "single" || q.type === "multi")) v = splitMulti(v).map(c => labelOf(q, c)).join(" | ");
      v = v == null ? "" : String(v);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    };
    const csv = "﻿" + [head.map(h => `"${h.replace(/"/g, '""')}"`).join(","), ...rows.map(r => keys.map(k => cell(k, r)).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- views ---------- */
  function showKey(errText) {
    $("#dash").hidden = true;
    $("#keyView").hidden = false;
    $("#keyMsg").hidden = !errText;
    $("#keyMsg").textContent = errText || "";
    setStatus("", "로그인 필요");
    $("#keyInput").focus();
  }
  async function showDash() {
    $("#keyView").hidden = true;
    $("#dash").hidden = false;
    $("#clearBtn").hidden = !Store.isDemo();
    const ok = await load();
    if (ok || !$("#dash").hidden) startTimer();
  }

  $("#keyBtn").addEventListener("click", () => {
    key = $("#keyInput").value.trim();
    if (!key) { showKey("관리자 키를 입력해 주세요."); return; }
    try { localStorage.setItem(KEY_STORE, key); } catch (e) {}
    showDash();
  });
  $("#keyInput").addEventListener("keydown", e => { if (e.key === "Enter") $("#keyBtn").click(); });
  $("#refreshBtn").addEventListener("click", load);
  $("#csvBtn").addEventListener("click", exportCsv);
  $("#clearBtn").addEventListener("click", () => {
    const btn = $("#clearBtn");
    if (btn.dataset.armed) { Store.clearDemo(); delete btn.dataset.armed; btn.textContent = "데모 데이터 지우기"; load(); }
    else { btn.dataset.armed = "1"; btn.textContent = "한 번 더 누르면 삭제"; setTimeout(() => { delete btn.dataset.armed; btn.textContent = "데모 데이터 지우기"; }, 3000); }
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !$("#dash").hidden) load(); });
  // 같은 브라우저의 다른 탭에서 데모 응답이 들어오면 즉시 반영
  window.addEventListener("storage", e => { if (e.key === "survey_demo_rows") load(); });

  if (Store.isDemo()) { showDash(); }
  else {
    try { key = localStorage.getItem(KEY_STORE) || ""; } catch (e) {}
    key ? showDash() : showKey();
  }
})();
