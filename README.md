# Tweet Shot v2

Deploy: push to GitHub, import in Vercel. No env vars needed.

Test after deploy (replace the id with any public tweet id):
  https://YOUR-APP.vercel.app/api/shot?id=1234567890123456789
You should get a PNG back.

Android: open the URL in Chrome > Install app. It then shows in the share sheet.
iOS Shortcut: "Get Contents of URL" -> https://YOUR-APP.vercel.app/api/shot?url=<Shortcut Input> -> Save to Photo Album.
