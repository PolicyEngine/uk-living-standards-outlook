import { PolicyEngineShell } from "@policyengine/ui-kit/layout";
import "@policyengine/ui-kit/styles.css";

import "./globals.css";

export const metadata = {
  title: "UK living standards outlook (demo) | PolicyEngine",
  description:
    "Local demo: PolicyEngine baseline projections of UK household incomes and poverty ahead of the Autumn Budget 2026, with the OBR forecast it is built on.",
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: "#2C7A7B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PolicyEngineShell country="uk">{children}</PolicyEngineShell>
      </body>
    </html>
  );
}
