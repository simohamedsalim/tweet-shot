// Fetches a tweet from up to three independent sources and normalizes the result.
const UA = "Mozilla/5.0 (compatible; TweetShot/2.0)";

async function getJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

function fromFx(t) {
  const photos = (t.media?.photos || []).map((p) => p.url);
  const vids = (t.media?.videos || []).map((v) => v.thumbnail_url).filter(Boolean);
  return {
    text: t.text || "",
    created_at: t.created_at,
    name: t.author?.name,
    handle: t.author?.screen_name,
    avatar: (t.author?.avatar_url || "").replace("_normal", "_200x200"),
    replies: t.replies, retweets: t.retweets, likes: t.likes,
    images: [...photos, ...vids].slice(0, 4),
    quote: t.quote ? fromFx(t.quote) : null,
  };
}

async function viaFx(id) {
  const j = await getJson(`https://api.fxtwitter.com/status/${id}`);
  if (!j.tweet) throw new Error("no tweet");
  return fromFx(j.tweet);
}

async function viaVx(id) {
  const j = await getJson(`https://api.vxtwitter.com/Twitter/status/${id}`);
  if (!j.text && !j.user_name) throw new Error("no tweet");
  const media = (j.media_extended || []).map((m) => (m.type === "image" ? m.url : m.thumbnail_url)).filter(Boolean);
  return {
    text: j.text || "",
    created_at: j.date,
    name: j.user_name,
    handle: j.user_screen_name,
    avatar: (j.user_profile_image_url || "").replace("_normal", "_200x200"),
    replies: j.replies, retweets: j.retweets, likes: j.likes,
    images: media.slice(0, 4),
    quote: null,
  };
}

async function viaSyndication(id) {
  const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
  const j = await getJson(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}&lang=en`);
  if (!j.text) throw new Error("no tweet");
  return {
    text: j.text,
    created_at: j.created_at,
    name: j.user?.name,
    handle: j.user?.screen_name,
    avatar: (j.user?.profile_image_url_https || "").replace("_normal", "_200x200"),
    replies: j.conversation_count, retweets: undefined, likes: j.favorite_count,
    images: (j.photos || []).map((p) => p.url).slice(0, 4),
    quote: null,
  };
}

export async function fetchTweet(id) {
  const errors = [];
  for (const [name, fn] of [["fxtwitter", viaFx], ["vxtwitter", viaVx], ["syndication", viaSyndication]]) {
    try {
      return await fn(id);
    } catch (e) {
      errors.push(`${name}: ${e.message}`);
    }
  }
  const err = new Error("Tweet not available (" + errors.join("; ") + ")");
  err.status = 404;
  throw err;
}
