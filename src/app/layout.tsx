import type { Metadata } from "next";
// self-hosted Geist via the official npm package (same --font-geist-* variables) — a build-time fetch
// from Google Fonts is a network dependency that intermittently breaks CI release builds
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { LocaleInitializer } from "@/components/locale-initializer";
import { AppShell } from "@/components/app-shell";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  // Title/description รองรับภาษาไทยและภาษาอังกฤษเป็นหลัก
  title: "ClipForge — เครื่องมือสร้างวิดีโอสั้นขายของด้วย AI | AI Short Video Creator",
  description:
    "เปลี่ยนภาพสินค้าหรือหัวข้อประโยคเดียว ให้เป็นวิดีโอสั้นพร้อมโพสต์สำหรับ TikTok Shop / Reels / Shorts: AI เขียนสคริปต์, จัดหาฟุตเทจฟรี, เสียงพากย์, และคำบรรยายอัตโนมัติ | Turn one sentence or a product photo into a vertical short video — AI script, free stock footage, voiceover & subtitles in one click.",
  keywords: [
    "AI สร้างวิดีโอ",
    "วิดีโอสั้นขายของ",
    "TikTok Shop",
    "Reels",
    "Shorts",
    "AI video generator",
    "text to video",
    "faceless video",
    "AI 短视频",
    "带货短视频",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Site-wide default dark studio theme: pin the dark class on <html>
  return (
    <html
      lang="th"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LocaleInitializer />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
