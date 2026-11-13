"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  return (
    <main style={{ padding: 20, maxWidth: 480, margin: "0 auto" }}>
      <h1>Tweet Shot</h1>
      <p>Share a tweet to this app from X, or paste a link:</p>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://x.com/user/status/123..."
        style={{ width: "100%", padding: 12, fontSize: 16, boxSizing: "border-box" }}
      />
      <button
        onClick={() => url && (location.href = `/share?url=${encodeURIComponent(url)}`)}
        style={{ marginTop: 12, padding: "12px 20px", fontSize: 16 }}
      >
        Generate screenshot
      </button>
    </main>
  );
}
