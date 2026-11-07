// 응답 저장/조회. ENDPOINT가 있으면 Google Apps Script, 없으면 데모(localStorage).
window.SurveyStore = (function () {
  const C = window.SURVEY_CONFIG || {};
  const DEMO_KEY = "survey_demo_rows";
  const isDemo = () => !C.ENDPOINT;

  function readDemo() {
    try { return JSON.parse(localStorage.getItem(DEMO_KEY) || "[]"); } catch (e) { return []; }
  }

  // 시트에 저장되는 것과 같은 모양(배열은 " | "로 합침)
  function flatten(payload) {
    const row = { timestamp: new Date().toISOString(), id: payload.id, lang: payload.lang, device: payload.device };
    Object.keys(payload.answers).forEach(k => {
      const v = payload.answers[k];
      row[k] = Array.isArray(v) ? v.join(" | ") : v;
    });
    return row;
  }

  async function submit(payload) {
    if (isDemo()) {
      const rows = readDemo();
      rows.push(flatten(payload));
      try { localStorage.setItem(DEMO_KEY, JSON.stringify(rows)); } catch (e) { throw new Error("storage"); }
      return { ok: true };
    }
    // text/plain → 브라우저 사전요청(CORS preflight) 없이 Apps Script로 전송
    const res = await fetch(C.ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "rejected");
    return data;
  }

  async function fetchRows(key) {
    if (isDemo()) return readDemo();
    const url = C.ENDPOINT + (C.ENDPOINT.includes("?") ? "&" : "?") + "key=" + encodeURIComponent(key || "") + "&t=" + Date.now();
    const res = await fetch(url);
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "error");
    return data.rows || [];
  }

  function clearDemo() { try { localStorage.removeItem(DEMO_KEY); } catch (e) {} }

  return { isDemo, submit, fetchRows, clearDemo };
})();
