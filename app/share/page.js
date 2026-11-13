"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function Shot() {
  const sp = useSearchParams();
  const raw = [sp.get("url"), sp.get("text"), sp.get("title")].filter(Boolean).join(" ");
  const id = raw.match(/status(?:es)?\/(\d+)/)?.[1];
  const [blob, setBlob] = useState(null);
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setError("No tweet link found in what was shared."); return; }
    let objUrl;
    fetch(`/api/shot?id=${id}`)
      .then((r) => { if (!r.ok) throw new Error("Could not render this tweet."); return r.blob(); })
      .then((b) => { setBlob(b); objUrl = URL.createObjectURL(b); setSrc(objUrl); })
      .catch((e) => setError(e.message));
    return () => objUrl && URL.revokeObjectURL(objUrl);
  }, [id]);

  const file = blob && new File([blob], `tweet-${id}.png`, { type: "image/png" });
  const canShare = file && navigator.canShare?.({ files: [file] });

  return (
    <main style={{ padding: 16, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
      {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
      {!src && !error && <p>Generating screenshot…</p>}
      {src && (
        <>
          <img src={src} alt="Tweet screenshot" style={{ width: "100%", borderRadius: 12 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {canShare && (
              <button style={btn} onClick={() => navigator.share({ files: [file] })}>Share / Save</button>
            )}
            <a style={{ ...btn, textDecoration: "none" }} href={src} download={`tweet-${id}.png`}>Download</a>
          </div>
        </>
      )}
    </main>
  );
}

const btn = { flex: 1, padding: 14, fontSize: 16, background: "#1d9bf0", color: "#fff", border: 0, borderRadius: 8 };

export default function Page() {
  return <Suspense fallback={null}><Shot /></Suspense>;
}
