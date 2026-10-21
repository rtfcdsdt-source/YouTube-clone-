import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import { getCurrentUser, getSubscribedChannels } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTube",
  description:
    "A full-stack YouTube clone: watch, like, comment, subscribe, upload, Shorts and more.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('yt-theme');if(t==='light'){document.documentElement.classList.add('light');}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  let channels: Awaited<ReturnType<typeof getSubscribedChannels>> = [];
  try {
    channels = await getSubscribedChannels();
  } catch {
    channels = [];
  }
  // Logged-in user for the header (null when logged out).
  let shellUser: { id: number; name: string; handle: string } | null = null;
  try {
    const me = await getCurrentUser();
    shellUser = me.id ? { id: me.id, name: me.name, handle: me.handle } : null;
  } catch {
    shellUser = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-yt text-primary antialiased">
        <Suspense fallback={<div className="min-h-screen bg-yt" />}>
          <AppShell
            channels={channels.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              avatarUrl: c.avatarUrl,
            }))}
            user={shellUser}
          >
            {children}
          </AppShell>
        </Suspense>
      </body>
    </html>
  );
}
