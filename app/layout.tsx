import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrivyHub — Self-hosted Trivy vulnerability dashboard",
  description: "Aggregate Trivy scan results from your CI/CD pipelines into one real-time dashboard. Open source, self-hosted, Docker & Kubernetes ready.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
