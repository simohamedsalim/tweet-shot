import path from "node:path";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { fetchTweet } from "../../../lib/tweet.mjs";
import { renderHtml } from "../../../lib/render.mjs";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

chromium.setGraphicsMode = false;

let browserPromise = null;
let fontReady = false;

async function getBrowser() {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    if (b && b.connected) return b;
    browserPromise = null;
  }
  const local = process.env.NODE_ENV === "development";
  browserPromise = (async () => {
    if (!local && !fontReady) {
      await chromium.font(path.join(process.cwd(), "fonts", "NotoSansArabic-Regular.ttf"));
      fontReady = true;
    }
    return puppeteer.launch(
      local
        ? { executablePath: process.env.CHROME_PATH, headless: true }
        : { args: chromium.args, executablePath: await chromium.executablePath(), headless: true }
    );
  })();
  return browserPromise;
}

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const id = sp.get("id") || (sp.get("url") || "").match(/status(?:es)?\/(\d+)/)?.[1];
  if (!/^\d{5,25}$/.test(id || "")) return new Response("Bad tweet link", { status: 400 });

  // start the browser and the tweet fetch at the same time
  const browserP = getBrowser();
  browserP.catch(() => {});

  let tweet;
  try {
    tweet = await fetchTweet(id);
  } catch (e) {
    return new Response(e.message, { status: e.status || 502 });
  }

  let page;
  try {
    const browser = await browserP;
    page = await browser.newPage();
    await page.setViewport({ width: 600, height: 900, deviceScaleFactor: 2 });
    await page.setContent(renderHtml(tweet), { waitUntil: "load", timeout: 15000 });
    const png = await (await page.$("#card")).screenshot({ type: "png" });
    return new Response(png, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch (e) {
    browserPromise = null; // force a fresh browser next time
    return new Response("Render error: " + e.message, { status: 500 });
  } finally {
    if (page) await page.close().catch(() => {});
  }
}