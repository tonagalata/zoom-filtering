import type { Metadata } from "next";
import { Providers } from './providers';

export const metadata: Metadata = {
  title: "Zoom Message Filter",
  description: "Filter and analyze Zoom chat messages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
