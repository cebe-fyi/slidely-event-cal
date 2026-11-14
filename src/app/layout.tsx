import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slidely Events · Team calendar",
  description:
    "The Slidely team’s shared home for events and conferences. Interactive sample-data preview.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
