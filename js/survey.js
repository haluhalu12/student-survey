(function () {
  const S = window.SURVEY;
  const Store = window.SurveyStore;
  const $ = (sel) => document.querySelector(sel);
  const allQ = S.sections.flatMap(s => s.questions);
  const countable = allQ.filter(q => q.type !== "contact");

  let lang = pickLang();
  let answers = {};

  function pickLang() {
    const codes = S.languages.map(l => l.code);
    try { const s = localStorage.getItem("survey_lang"); if (codes.includes(s)) return s; } catch (e) {}
    const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
    return codes.includes(nav) ? nav : "en";
  }
  const t = (o) => o == null ? "" : (typeof o === "string" ? o : (o[lang] || o.en));
  const ui = (k, vars) => {
    let s = t(S.ui[k]);
    if (vars) Object.keys(vars).forEach(v => { s = s.replace("{" + v + "}", vars[v]); });
    return s;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- static text & language ---------- */
  function applyUi() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    document.title = ui("title");
    $("#brandTitle").textContent = ui("eyebrow");
    document.querySelectorAll("[data-ui]").forEach(el => { el.textContent = ui(el.dataset.ui); });
    $("#langSelect").value = lang;
    $("#langPick").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  }

  function setLang(code) {
    lang = code;
    try { localStorage.setItem("survey_lang", code); } catch (e) {}
    applyUi();
    if (!$("#survey").hidden) renderForm();
  }

  function buildLangControls() {
    $("#langSelect").innerHTML = S.languages.map(l => `<option value="${l.code}">${esc(l.name)}</option>`).join("");
    $("#langSelect").addEventListener("change", e => setLang(e.target.value));
    $("#langPick").innerHTML = S.languages.map(l => `<button type="button" data-lang="${l.code}">${esc(l.name)}</button>`).join("");
    $("#langPick").addEventListener("click", e => { const b = e.target.closest("button"); if (b) setLang(b.dataset.lang); });
  }

  /* ---------- form rendering ---------- */
  function renderQuestion(q, n) {
    const id = "q_" + q.id;
    const hint = q.type === "multi" ? (q.max ? ui("upTo", { n: q.max }) : ui("multi")) : "";
    const req = q.required ? "" : ` · ${ui("optional")}`;
    let body = "";

    if (q.type === "single" || q.type === "multi") {
      const kind = q.type === "single" ? "radio" : "checkbox";
      const cur = answers[q.id];
      const two = q.options.length > 5 ? " two" : "";
      body = `<div class="opts${two}">` + q.options.map((op, i) => {
        const checked = q.type === "single" ? cur === op.value : (cur || []).includes(op.value);
        return `<label class="opt${kind === "checkbox" ? " check" : ""}">
          <input type="${kind}" id="${id}_${i}" name="${q.id}" value="${esc(op.value)}"${checked ? " checked" : ""}>
          <span>${esc(t(op.label))}</span></label>`;
      }).join("") + `</div>`;
      const otherOpt = q.options.find(op => op.other);
      if (otherOpt) {
        const show = q.type === "single" ? cur === otherOpt.value : (cur || []).includes(otherOpt.value);
        body += `<input class="field" id="${id}_other" name="${q.id}_other" maxlength="200" placeholder="${esc(ui("other"))}" value="${esc(answers[q.id + "_other"] || "")}"${show ? "" : " hidden"}>`;
      }
    } else if (q.type === "scale") {
      body = `<div class="scale">` + [1, 2, 3, 4, 5].map(v =>
        `<label class="opt"><input type="radio" id="${id}_${v}" name="${q.id}" value="${v}"${answers[q.id] === v ? " checked" : ""}><span>${v}</span></label>`
      ).join("") + `</div><div class="scale-ends"><span>1 · ${esc(t(q.low))}</span><span>5 · ${esc(t(q.high))}</span></div>`;
    } else if (q.type === "text") {
      body = `<textarea class="field" id="${id}" name="${q.id}" maxlength="1000" placeholder="${esc(ui("textPh"))}">${esc(answers[q.id] || "")}</textarea>`;
    } else if (q.type === "contact") {
      body = `<input class="field" type="email" id="${id}" name="${q.id}" maxlength="120" autocomplete="email" inputmode="email" placeholder="${esc(ui("emailPh"))}" value="${esc(answers[q.id] || "")}">
        <label class="consent" for="q_consent"><input type="checkbox" id="q_consent" name="consent" value="yes"${answers.consent === "yes" ? " checked" : ""}><span>${esc(ui("consent"))}</span></label>`;
    }

    return `<div class="q" id="wrap_${q.id}" data-q="${q.id}">
      <div class="q-title"><span class="qn">${String(n).padStart(2, "0")}</span><span>${esc(t(q.label))}</span></div>
      ${hint || req ? `<div class="q-hint">${esc(hint)}${esc(req)}</div>` : ""}
      ${body}
    </div>`;
  }

  function renderForm() {
    let n = 0;
    $("#questions").innerHTML = S.sections.map((s, si) => `
      <section class="section" aria-labelledby="sec_${s.id}">
        <div class="section-head"><span class="num">${si + 1}/${S.sections.length}</span><h2 id="sec_${s.id}">${esc(t(s.title))}</h2></div>
        ${s.questions.map(q => renderQuestion(q, ++n)).join("")}
      </section>`).join("");
    $("#questions").style.display = "grid";
    $("#questions").style.gap = "40px";
    enforceMax();
    updateProgress();
  }

  /* ---------- reading answers ---------- */
  function readForm() {
    const f = $("#survey");
    const a = {};
    allQ.forEach(q => {
      if (q.type === "single") {
        const el = f.querySelector(`input[name="${q.id}"]:checked`);
        if (el) a[q.id] = el.value;
      } else if (q.type === "multi") {
        const vals = [...f.querySelectorAll(`input[name="${q.id}"]:checked`)].map(el => el.value);
        if (vals.length) a[q.id] = vals;
      } else if (q.type === "scale") {
        const el = f.querySelector(`input[name="${q.id}"]:checked`);
        if (el) a[q.id] = Number(el.value);
      } else if (q.type === "text" || q.type === "contact") {
        const v = (f.querySelector(`[name="${q.id}"]`) || {}).value;
        if (v && v.trim()) a[q.id] = v.trim();
      }
      const other = f.querySelector(`[name="${q.id}_other"]`);
      if (other && !other.hidden && other.value.trim()) a[q.id + "_other"] = other.value.trim();
    });
    const consent = f.querySelector("#q_consent");
    if (consent && consent.checked) a.consent = "yes";
    return a;
  }

  function isAnswered(q) {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
  }

  function updateProgress() {
    const done = countable.filter(isAnswered).length;
    $("#progressBar").firstElementChild.style.width = (done / countable.length * 100) + "%";
    $("#progressText").textContent = ui("progress", { a: done, b: countable.length });
  }

  function enforceMax() {
    allQ.filter(q => q.type === "multi" && q.max).forEach(q => {
      const boxes = [...document.querySelectorAll(`input[name="${q.id}"]`)];
      const full = boxes.filter(b => b.checked).length >= q.max;
      boxes.forEach(b => { b.disabled = full && !b.checked; });
    });
  }

  function onChange(e) {
    const name = e.target.name;
    const q = allQ.find(x => x.id === name);
    if (q) {
      const otherOpt = (q.options || []).find(op => op.other);
      if (otherOpt) {
        const box = document.getElementById("q_" + q.id + "_other");
        const on = [...document.querySelectorAll(`input[name="${q.id}"]:checked`)].some(el => el.value === otherOpt.value);
        box.hidden = !on;
        if (on && e.type === "change") box.focus();
      }
      document.getElementById("wrap_" + q.id).classList.remove("invalid");
    }
    answers = readForm();
    enforceMax();
    updateProgress();
  }

  /* ---------- submit ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  async function onSubmit(e) {
    e.preventDefault();
    answers = readForm();
    const msg = $("#formMsg");
    msg.hidden = true;

    const missing = allQ.filter(q => q.required && !isAnswered(q));
    document.querySelectorAll(".q.invalid").forEach(el => el.classList.remove("invalid"));
    if (missing.length) {
      missing.forEach(q => document.getElementById("wrap_" + q.id).classList.add("invalid"));
      msg.textContent = ui("missing");
      msg.hidden = false;
      document.getElementById("wrap_" + missing[0].id).scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if ($("#website").value) { showDone(); return; } // 스팸 봇

    const btn = $("#submitBtn");
    btn.disabled = true;
    btn.textContent = ui("sending");
    try {
      await Store.submit({
        id: uuid(),
        lang,
        device: window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop",
        answers
      });
      showDone();
    } catch (err) {
      msg.textContent = ui("error");
      msg.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = ui("submit");
    }
  }

  /* ---------- views ---------- */
  function showForm() {
    $("#intro").hidden = true;
    $("#done").hidden = true;
    $("#survey").hidden = false;
    $("#progressBar").hidden = false;
    renderForm();
    window.scrollTo({ top: 0 });
  }
  function showDone() {
    $("#survey").hidden = true;
    $("#progressBar").hidden = true;
    $("#done").hidden = false;
    answers = {};
    window.scrollTo({ top: 0 });
  }

  buildLangControls();
  applyUi();
  $("#demoNote").hidden = !Store.isDemo();
  $("#startBtn").addEventListener("click", showForm);
  $("#againBtn").addEventListener("click", showForm);
  $("#survey").addEventListener("change", onChange);
  $("#survey").addEventListener("input", onChange);
  $("#survey").addEventListener("submit", onSubmit);
})();
