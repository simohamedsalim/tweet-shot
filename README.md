# Tweet Shot

## Deploy
1. `npm install`
2. Push to GitHub, import in Vercel (or run `npx vercel --prod`).
3. In Vercel > Settings > Deployment Protection, make sure the production URL is public
   (the screenshot route calls your own /t/[id] page).

## Android
Open the deployed URL in Chrome > menu > Install app. "Tweet Shot" now appears in the share sheet.

## iOS (Shortcut)
Shortcuts > New > Shortcut details: enable "Show in Share Sheet", accept URLs.
1. Get Contents of URL: https://YOUR-APP.vercel.app/api/shot?url=<Shortcut Input, URL-encoded>
2. Save to Photo Album (or Copy to Clipboard)

## Local dev
Set CHROME_PATH to your local Chrome binary, then `npm run dev`.
