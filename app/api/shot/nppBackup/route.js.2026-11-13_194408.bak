import path from "node:path";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { fetchTweet } from "../../../lib/tweet.mjs";
import { renderHtml } from "../../../lib/render.mjs";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  // Accepts ?id=123 or ?url=https://x.com/user/status/123 (handy for the iOS Shortcut)
  const id = sp.get("id") || (sp.get("url") || "").match(/status(?:es)?\/(\d+)/)?.[1];
  if (!/^\d{5,25}$/.test(id || "")) return new Response("Bad tweet link", { status: 400 });

  let tweet;
  try {
    tweet = await fetchTweet(id);
  } catch (e) {
    return new Response(e.message, { status: e.status || 502 });
  }

  const local = process.env.NODE_ENV === "development";
  let browser;
  try {
	chromium.setGraphicsMode = false;
    if (!local) await chromium.font(path.join(process.cwd(), "fonts", "NotoSansArabic-Regular.ttf"));
    browser = await puppeteer.launch(
      local
        ? { executablePath: process.env.CHROME_PATH, headless: true }
        : { args: chromium.args, executablePath: await chromium.executablePath(), headless: true }
    );
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 900, deviceScaleFactor: 2 });
    await page.setContent(renderHtml(tweet), { waitUntil: "networkidle0", timeout: 20000 });
    const png = await (await page.$("#card")).screenshot({ type: "png" });
    return new Response(png, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (e) {
    return new Response("Render error: " + e.message, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
