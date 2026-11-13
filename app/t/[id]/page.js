import { Tweet } from "react-tweet";

export const dynamic = "force-dynamic";

export default async function TweetPage({ params }) {
  const { id } = await params;
  return (
    <div style={{ background: "#fff", display: "inline-block" }}>
      <div id="tweet" data-theme="light" style={{ width: 550, padding: 16, background: "#fff" }}>
        <Tweet id={id} />
      </div>
    </div>
  );
}
