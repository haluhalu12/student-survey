// 학생용 설문: 한 화면에 한 문항.
// - 단일 선택·척도는 고르면 자동으로 다음 문항 ("기타" 선택 시 제외)
// - 답변은 이 브라우저에 자동 저장 → 다시 열면 "이어서 하기"
// - 휴대폰 뒤로 가기 = 이전 문항 (history API)
(function () {
  const S = window.SURVEY;
  const Store = window.SurveyStore;
  const $ = (sel) => document.querySelector(sel);
  const steps = S.sections.flatMap((sec, si) => sec.questions.map(q => ({ q, sec, si })));
  const total = steps.length;
  const DRAFT_KEY = "survey_draft_v2";
  const DRAFT_DAYS = 14;
  const AUTO_ADVANCE_MS = 300;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // 모션(js/fx.js) 호출 — 라이브러리가 없거나 실패해도 설문은 그대로 동작
  const fx = (name, ...args) => { try { if (window.FX && window.FX[name]) window.FX[name](...args); } catch (e) {} };
  const fxReady = () => !!(window.FX && window.FX.ready);

  /* ---------- storage (항상 try/catch: 사생활 보호 모드 등) ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  let lang = pickLang();
  let answers = {};
  let step = 0;
  let view = "intro";
  let advanceTimer = null;
  let sending = false;
  function saveDraft() {
    if (!Object.keys(answers).length) return;
    store.set(DRAFT_KEY, JSON.stringify({ answers, step, lang, ts: Date.now() }));
  }
  function loadDraft() {
    try {
      const d = JSON.parse(store.get(DRAFT_KEY) || "null");
      if (!d || !d.answers || !Object.keys(d.answers).length) return null;
      if (Date.now() - (d.ts || 0) > DRAFT_DAYS * 864e5) { store.del(DRAFT_KEY); return null; }
      return d;
    } catch (e) { return null; }
  }

  /* ---------- i18n ---------- */
  function pickLang() {
    const codes = S.languages.map(l => l.code);
    const saved = store.get("survey_lang");
    if (codes.includes(saved)) return saved;
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]);
    for (const p of prefs) { const c = String(p).slice(0, 2).toLowerCase(); if (codes.includes(c)) return c; }
    return "en";
  }
  const t = (o) => o == null ? "" : (typeof o === "string" ? o : (o[lang] || o.en));
  const ui = (k, vars) => {
    let s = t(S.ui[k]);
    if (vars) Object.keys(vars).forEach(v => { s = s.split("{" + v + "}").join(vars[v]); });
    return s;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function applyUi() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.title = ui("title");
    $("#brandTitle").textContent = ui("eyebrow");
    document.querySelectorAll("[data-ui]").forEach(el => { el.textContent = ui(el.dataset.ui, { n: total }); });
    $("#langSelect").value = lang;
    $("#langPick").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    $("#backBtn").setAttribute("aria-label", ui("back"));
    const d = loadDraft();
    if (d) $("#resumeText").textContent = ui("resumeText", { a: answeredCount(d.answers), b: total });
  }
  function setLang(code) {
    lang = code;
    store.set("survey_lang", code);
    applyUi();
    if (view === "survey") renderStep(null);
  }
  function buildLangControls() {
    $("#langSelect").innerHTML = S.languages.map(l => `<option value="${l.code}">${esc(l.name)}</option>`).join("");
    $("#langSelect").addEventListener("change", e => setLang(e.target.value));
    $("#langPick").innerHTML = S.languages.map(l => `<button type="button" data-lang="${l.code}">${esc(l.name)}</button>`).join("");
    $("#langPick").addEventListener("click", e => { const b = e.target.closest("button"); if (b) setLang(b.dataset.lang); });
  }

  /* ---------- answers ---------- */
  function isAnswered(q, a) {
    const v = (a || answers)[q.id];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
  }
  const answeredCount = (a) => steps.filter(s => s.q.type !== "contact" && isAnswered(s.q, a)).length;

  function readStep(q) {
    const host = $("#stepHost");
    delete answers[q.id];
    delete answers[q.id + "_other"];
    if (q.type === "single" || q.type === "scale") {
      const el = host.querySelector(`input[name="${q.id}"]:checked`);
      if (el) answers[q.id] = q.type === "scale" ? Number(el.value) : el.value;
    } else if (q.type === "multi") {
      const vals = [...host.querySelectorAll(`input[name="${q.id}"]:checked`)].map(el => el.value);
      if (vals.length) answers[q.id] = vals;
    } else if (q.type === "text" || q.type === "contact") {
      const v = (host.querySelector(`[name="${q.id}"]`) || {}).value;
      if (v && v.trim()) answers[q.id] = v.trim();
    }
    const other = host.querySelector(`[name="${q.id}_other"]`);
    if (other && !other.hidden && other.value.trim()) answers[q.id + "_other"] = other.value.trim();
    if (q.type === "contact") {
      const c = host.querySelector("#q_consent");
      if (c && c.checked) answers.consent = "yes"; else delete answers.consent;
    }
  }

  /* ---------- rendering ---------- */
  function renderBody(q) {
    const id = "q_" + q.id;
    if (q.type === "single" || q.type === "multi") {
      const kind = q.type === "single" ? "radio" : "checkbox";
      const cur = answers[q.id];
      const labels = q.options.map(op => t(op.label));
      const two = q.options.length > 5 && Math.max(...labels.map(l => l.length)) <= 12 ? " two" : (q.options.length > 6 ? " many" : "");
      let html = `<div class="opts${two}">` + q.options.map((op, i) => {
        const checked = q.type === "single" ? cur === op.value : (cur || []).includes(op.value);
        return `<label class="opt${kind === "checkbox" ? " check" : ""}">
          <input type="${kind}" id="${id}_${i}" name="${q.id}" value="${esc(op.value)}"${checked ? " checked" : ""}>
          <span>${esc(labels[i])}</span></label>`;
      }).join("") + `</div>`;
      const otherOpt = q.options.find(op => op.other);
      if (otherOpt) {
        const show = q.type === "single" ? cur === otherOpt.value : (cur || []).includes(otherOpt.value);
        html += `<input class="field" id="${id}_other" name="${q.id}_other" maxlength="200" autocomplete="off" aria-label="${esc(t(otherOpt.label) + " – " + ui("other"))}" placeholder="${esc(ui("other"))}" value="${esc(answers[q.id + "_other"] || "")}"${show ? "" : " hidden"}>`;
      }
      return html;
    }
    if (q.type === "scale") {
      return `<div class="scale">` + [1, 2, 3, 4, 5].map(v =>
        `<label class="opt"><input type="radio" id="${id}_${v}" name="${q.id}" value="${v}"${answers[q.id] === v ? " checked" : ""}
          aria-label="${v}${v === 1 ? " – " + esc(t(q.low)) : v === 5 ? " – " + esc(t(q.high)) : ""}"><span aria-hidden="true">${v}</span></label>`
      ).join("") + `</div><div class="scale-ends" aria-hidden="true"><span>1 · ${esc(t(q.low))}</span><span>5 · ${esc(t(q.high))}</span></div>`;
    }
    if (q.type === "text") {
      return `<textarea class="field" id="${id}" name="${q.id}" maxlength="1000" autocomplete="off" aria-labelledby="qt" placeholder="${esc(ui("textPh"))}">${esc(answers[q.id] || "")}</textarea>`;
    }
    if (q.type === "contact") {
      return `<label class="field-label" for="${id}">${esc(ui("emailLabel"))}</label>
        <input class="field" type="email" id="${id}" name="${q.id}" maxlength="120" autocomplete="email" inputmode="email" spellcheck="false" autocapitalize="off" placeholder="${esc(ui("emailPh"))}" value="${esc(answers[q.id] || "")}">
        <label class="consent" for="q_consent"><input type="checkbox" id="q_consent" name="consent" value="yes"${answers.consent === "yes" ? " checked" : ""}><span>${esc(ui("consent"))}</span></label>`;
    }
    return "";
  }

  function renderStep(dir) {
    clearTimeout(advanceTimer);
    const { q, sec, si } = steps[step];
    const hint = q.type === "multi" ? (q.max ? ui("upTo", { n: q.max }) : ui("multi")) : (!q.required && q.type !== "contact" ? ui("optional") : "");
    const isChoice = ["single", "multi", "scale"].includes(q.type);
    const head = `<h1 class="q-title" id="qt" tabindex="-1">${esc(t(q.label))}</h1>${hint ? `<div class="q-hint" id="qh">${esc(hint)}</div>` : ""}`;
    const body = renderBody(q);
    const useFx = fxReady();
    const anim = dir && !reduceMotion && !useFx ? ` enter${dir === "back" ? " back" : ""}` : "";
    $("#stepHost").innerHTML = `<div class="step${anim}">
      <div class="step-section">${esc(t(sec.title))} · ${si + 1}/${S.sections.length}</div>
      ${isChoice
        ? `<fieldset class="q" aria-labelledby="qt"${hint ? ' aria-describedby="qh"' : ""}>${head}${body}</fieldset>`
        : `<div class="q">${head}${body}</div>`}
    </div>`;

    $("#formMsg").hidden = true;
    $("#nextBtn").textContent = step === total - 1 ? ui("submit") : ui("next");
    $("#stepCount").textContent = ui("stepOf", { a: step + 1, b: total });
    const pct = Math.round(step / total * 100);
    $("#progressBar").firstElementChild.style.transform = `scaleX(${step / total})`;
    $("#progressBar").setAttribute("aria-valuenow", String(pct));
    enforceMax(q);
    if (dir) {
      window.scrollTo({ top: 0 });
      $("#qt").focus({ preventScroll: true });
      if (useFx) fx("stepIn", $("#stepHost").firstElementChild, dir);
    }
  }

  function enforceMax(q) {
    if (q.type !== "multi" || !q.max) return;
    const boxes = [...$("#stepHost").querySelectorAll(`input[name="${q.id}"]`)];
    const full = boxes.filter(b => b.checked).length >= q.max;
    boxes.forEach(b => { b.disabled = full && !b.checked; });
  }

  /* ---------- navigation ---------- */
  function go(to, dir, push) {
    step = Math.max(0, Math.min(total - 1, to));
    if (push) history.pushState({ step }, "", "#q" + (step + 1));
    renderStep(dir);
    saveDraft();
  }

  function validate() {
    const { q } = steps[step];
    if (q.required && !isAnswered(q)) {
      $("#formMsg").textContent = ui("missing");
      $("#formMsg").hidden = false;
      const first = $("#stepHost").querySelector("input, textarea");
      if (first) first.focus();
      return false;
    }
    return true;
  }

  function next() {
    clearTimeout(advanceTimer);
    if (sending) return;
    readStep(steps[step].q);
    if (!validate()) return;
    if (step === total - 1) submit();
    else {
      const prev = steps[step];
      go(step + 1, "fwd", true);
      if (steps[step].si !== prev.si) {
        fx("sectionDone", $("#secToast"), ui("sectionDone", { s: t(prev.sec.title) }));
        fx("glow", $("#progressBar"));
      }
    }
  }

  function back() {
    clearTimeout(advanceTimer);
    if (history.state && typeof history.state.step === "number") history.back();
    else if (step > 0) go(step - 1, "back", false);
    else showIntro();
  }

  function onChange(e) {
    const { q } = steps[step];
    if (!e.target.name || (e.target.name !== q.id && e.target.name !== q.id + "_other" && e.target.name !== "consent")) return;
    const otherOpt = (q.options || []).find(op => op.other);
    let otherOn = false;
    if (otherOpt) {
      const box = document.getElementById("q_" + q.id + "_other");
      otherOn = [...$("#stepHost").querySelectorAll(`input[name="${q.id}"]:checked`)].some(el => el.value === otherOpt.value);
      box.hidden = !otherOn;
      if (otherOn && e.type === "change" && e.target.name === q.id) box.focus();
    }
    const was = isAnswered(q);
    readStep(q);
    enforceMax(q);
    if (isAnswered(q)) $("#formMsg").hidden = true;
    saveDraft();
    if (e.type === "change" && e.target.name === q.id && e.target.checked) fx("press", e.target.nextElementSibling);
    if (!was && isAnswered(q) && !(q.type === "scale" || (q.type === "single" && !otherOn))) fx("nudge", $("#nextBtn"));

    // 단일 선택·척도는 고르면 자동으로 다음 문항
    if (e.type === "change" && e.target.name === q.id && (q.type === "scale" || (q.type === "single" && !otherOn))) {
      clearTimeout(advanceTimer);
      const at = step;
      advanceTimer = setTimeout(() => { if (step === at && view === "survey") next(); }, AUTO_ADVANCE_MS);
    }
  }

  function onKeydown(e) {
    if (e.key !== "Enter" || e.isComposing || e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
    e.preventDefault();
    next();
  }

  /* ---------- submit ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  async function submit() {
    if ($("#website").value) { finish(); return; } // 스팸 봇
    const btn = $("#nextBtn");
    sending = true;
    btn.disabled = true;
    btn.innerHTML = `<span class="spin" aria-hidden="true"></span>${esc(ui("sending"))}`;
    $("#formMsg").hidden = true;
    try {
      await Store.submit({
        id: uuid(),
        lang,
        device: window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop",
        answers
      });
      finish();
    } catch (err) {
      $("#formMsg").textContent = ui("error");
      $("#formMsg").hidden = false;
      btn.textContent = ui("submit");
    } finally {
      sending = false;
      btn.disabled = false;
    }
  }
  function finish() {
    store.del(DRAFT_KEY);
    answers = {};
    step = 0;
    history.replaceState(null, "", location.pathname + location.search);
    showDone();
  }

  /* ---------- views ---------- */
  function setChrome(mode) {
    const inSurvey = mode === "survey";
    $("#brand").hidden = inSurvey;
    $("#backBtn").hidden = !inSurvey;
    $("#stepCount").hidden = !inSurvey;
    $("#progressBar").hidden = !inSurvey;
    $("#actionbar").hidden = !inSurvey;
  }
  function showIntro() {
    view = "intro";
    $("#intro").hidden = false; $("#survey").hidden = true; $("#done").hidden = true;
    setChrome("intro");
    const d = loadDraft();
    $("#resumeBox").hidden = !d;
    $("#startRow").hidden = !!d;
    applyUi();
    window.scrollTo({ top: 0 });
    fx("intro", [...$("#intro").children].filter(el => !el.hidden));
  }
  function showSurvey(startStep) {
    view = "survey";
    $("#intro").hidden = true; $("#done").hidden = true; $("#survey").hidden = false;
    setChrome("survey");
    history.pushState({ step: startStep }, "", "#q" + (startStep + 1));
    step = startStep;
    renderStep("fwd");
  }
  function showDone() {
    view = "done";
    $("#intro").hidden = true; $("#survey").hidden = true; $("#done").hidden = false;
    setChrome("done");
    $("#toast").textContent = "";
    $("#secToast").hidden = true;
    window.scrollTo({ top: 0 });
    $("#doneTitle").focus({ preventScroll: true });
    fx("celebrate", $("#done .stamp"));
    fx("intro", [...$("#done").children].filter(el => !el.classList.contains("stamp") && !el.hidden));
  }

  async function share() {
    const url = location.origin + location.pathname;
    const data = { title: ui("title"), text: ui("shareText"), url };
    if (navigator.share) {
      try { await navigator.share(data); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    try { await navigator.clipboard.writeText(ui("shareText") + "\n" + url); $("#toast").textContent = ui("copied"); }
    catch (e) { window.prompt(ui("share"), url); }
  }

  /* ---------- wire up ---------- */
  buildLangControls();
  $("#demoNote").hidden = !Store.isDemo();
  $("#startBtn").addEventListener("click", () => { answers = {}; showSurvey(0); });
  $("#resumeBtn").addEventListener("click", () => {
    const d = loadDraft();
    answers = d ? d.answers : {};
    if (d && d.lang && d.lang !== lang) setLang(d.lang);
    showSurvey(d ? Math.min(d.step || 0, total - 1) : 0);
  });
  $("#restartBtn").addEventListener("click", () => { store.del(DRAFT_KEY); answers = {}; showSurvey(0); });
  $("#againBtn").addEventListener("click", () => { answers = {}; showSurvey(0); });
  $("#shareBtn").addEventListener("click", share);
  $("#nextBtn").addEventListener("click", next);
  $("#backBtn").addEventListener("click", back);
  $("#survey").addEventListener("change", onChange);
  $("#survey").addEventListener("input", onChange);
  $("#survey").addEventListener("keydown", onKeydown);
  $("#survey").addEventListener("submit", e => { e.preventDefault(); next(); });
  window.addEventListener("popstate", e => {
    if (view === "done") return;
    clearTimeout(advanceTimer);
    const s = e.state && typeof e.state.step === "number" ? e.state.step : null;
    if (s === null) { if (view === "survey") { readStep(steps[step].q); saveDraft(); } showIntro(); return; }
    if (view !== "survey") {
      view = "survey";
      $("#intro").hidden = true; $("#done").hidden = true; $("#survey").hidden = false;
      setChrome("survey");
    } else {
      readStep(steps[step].q);
    }
    const dir = s < step ? "back" : "fwd";
    step = Math.max(0, Math.min(total - 1, s));
    renderStep(dir);
    saveDraft();
  });

  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  showIntro();
})();
