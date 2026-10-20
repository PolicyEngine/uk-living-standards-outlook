// Mirrors PolicyEngine/uk-autumn-budget-dashboard-2026 src/app/layout.tsx:
// ui-kit shell (site nav), design-system tokens and Inter. The footer is the
// compact one the published UK dashboards use (SiteFooter).
import { PolicyEngineShell } from "@policyengine/ui-kit/layout";
import "@policyengine/ui-kit/styles.css";

import SiteFooter from "@/components/SiteFooter";

import "./globals.css";
import "./demo.css";

export const metadata = {
  title: "UK living standards outlook (demo) | PolicyEngine",
  description:
    "Local demo: PolicyEngine baseline projections of UK household incomes and poverty ahead of the Autumn Budget 2026, with the OBR forecast it is built on.",
  robots: { index: false, follow: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/@policyengine/design-system/dist/tokens.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PolicyEngineShell country="uk" showFooter={false}>
          {children}
          <SiteFooter />
        </PolicyEngineShell>
      </body>
    </html>
  );
}
