export const metadata = { title: "Tweet Shot", manifest: "/manifest.json" };
export const viewport = { themeColor: "#000000" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#111", color: "#fff" }}>
        {children}
      </body>
    </html>
  );
}
