import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams, origin } = new URL(req.url);
  // Accept ?id=123 or ?url=https://x.com/user/status/123 (handy for the iOS Shortcut)
  const id =
    searchParams.get("id") ||
    (searchParams.get("url") || "").match(/status(?:es)?\/(\d+)/)?.[1];
  if (!/^\d{5,25}$/.test(id || "")) return new Response("Bad tweet id", { status: 400 });

  const local = process.env.NODE_ENV === "development";
  let browser;
  try {
    browser = await puppeteer.launch(
      local
        ? { executablePath: process.env.CHROME_PATH, headless: true }
        : { args: chromium.args, executablePath: await chromium.executablePath(), headless: true }
    );
    const page = await browser.newPage();
    await page.setViewport({ width: 700, height: 900, deviceScaleFactor: 2 });
    await page.goto(`${origin}/t/${id}`, { waitUntil: "networkidle0", timeout: 30000 });
    const el = await page.$("#tweet");
    if (!el) return new Response("Render failed", { status: 502 });
    const png = await el.screenshot({ type: "png" });
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
