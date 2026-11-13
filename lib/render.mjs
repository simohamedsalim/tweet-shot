// Builds a self-contained HTML card that looks like a tweet. Pure function, no dependencies.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const EMOJI = /[\u{1F1E6}-\u{1F1FF}]{2}|\p{Extended_Pictographic}(?:\uFE0F|\p{Emoji_Modifier}|\u200D\p{Extended_Pictographic}\uFE0F?)*/gu;

function emojify(escaped) {
  return escaped.replace(EMOJI, (m) => {
    let cps = [...m].map((c) => c.codePointAt(0));
    if (!cps.includes(0x200d)) cps = cps.filter((c) => c !== 0xfe0f);
    const code = cps.map((c) => c.toString(16)).join("-");
    return `<img class="emoji" alt="${m}" onerror="this.replaceWith(document.createTextNode(this.alt))" src="https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/72x72/${code}.png">`;
  });
}

function richText(text) {
  let h = esc(text);
  h = h.replace(/(https?:\/\/[^\s<]+)/g, '<span class="lnk">$1</span>');
  h = h.replace(/(^|[\s(>])([@#][\p{L}\p{N}_]+)/gu, '$1<span class="lnk">$2</span>');
  return h.split("\n").map((l) => `<div dir="auto" class="ln">${emojify(l) || "&nbsp;"}</div>`).join("");
}

const compact = (n) => (n == null ? null : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n));

function when(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return `${time} · ${day}`;
}

function media(images) {
  if (!images?.length) return "";
  return `<div class="media n${images.length}">${images.map((u) => `<img src="${esc(u)}">`).join("")}</div>`;
}

function quote(q) {
  if (!q) return "";
  return `<div class="quote">
    <div class="qh"><img class="qa" src="${esc(q.avatar)}"><b>${esc(q.name)}</b><span class="mut">@${esc(q.handle)}</span></div>
    <div class="qt">${richText(q.text)}</div>${media(q.images)}</div>`;
}

function stat(label, n) {
  const v = compact(n);
  return v == null ? "" : `<span><b>${v}</b> ${label}</span>`;
}

export function renderHtml(t) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}
  body{margin:0;background:#fff;font-family:"Noto Sans Arabic",-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#0f1419}
  #card{width:550px;padding:20px;background:#fff;display:inline-block}
  .head{display:flex;align-items:center;gap:12px;margin-bottom:12px}
  .av{width:48px;height:48px;border-radius:50%;background:#cfd9de}
  .nm{font-weight:700;font-size:16px;line-height:20px}
  .mut{color:#536471;font-size:15px}
  .txt{font-size:20px;line-height:28px;word-wrap:break-word;overflow-wrap:anywhere}
  .lnk{color:#1d9bf0}
  .emoji{height:1.15em;width:1.15em;vertical-align:-0.2em;margin:0 .05em}
  .media{display:grid;gap:2px;margin-top:12px;border-radius:16px;overflow:hidden;border:1px solid #cfd9de}
  .media img{width:100%;height:100%;object-fit:cover;display:block}
  .media.n1 img{max-height:520px}
  .media.n2{grid-template-columns:1fr 1fr;height:280px}
  .media.n3{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;height:300px}
  .media.n3 img:first-child{grid-row:span 2}
  .media.n4{grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;height:300px}
  .quote{margin-top:12px;border:1px solid #cfd9de;border-radius:16px;padding:12px;overflow:hidden}
  .qh{display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:15px}
  .qa{width:20px;height:20px;border-radius:50%}
  .qt{font-size:15px;line-height:20px;overflow-wrap:anywhere}
  .time{margin-top:14px;color:#536471;font-size:15px;padding-bottom:14px;border-bottom:1px solid #eff3f4}
  .stats{display:flex;gap:20px;padding-top:14px;font-size:15px;color:#536471}
  .stats b{color:#0f1419}
  </style></head><body><div id="card">
  <div class="head">${t.avatar ? `<img class="av" src="${esc(t.avatar)}">` : `<div class="av"></div>`}<div><div class="nm">${emojify(esc(t.name))}</div><div class="mut">@${esc(t.handle)}</div></div></div>
  <div class="txt">${richText(t.text)}</div>
  ${media(t.images)}${quote(t.quote)}
  <div class="time">${esc(when(t.created_at))}</div>
  <div class="stats">${stat("Replies", t.replies)}${stat("Reposts", t.retweets)}${stat("Likes", t.likes)}</div>
  </div></body></html>`;
}
