import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio MVP",
  description: "Personal Investment Accounting System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-slate-50 text-slate-900 light`}
      style={{ colorScheme: 'light' }}
    >
      <body className="min-h-full flex">
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col p-6 relative z-20">
          <div className="font-black text-2xl mb-10 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
            Portfolio<span className="font-light text-slate-400">MVP</span>
          </div>
          <nav className="flex flex-col gap-3">
            <Link href="/" className="px-4 py-3 rounded-xl hover:bg-slate-100 hover:text-blue-700 text-sm font-semibold transition-all">Dashboard</Link>
            <Link href="/assets" className="px-4 py-3 rounded-xl hover:bg-slate-100 hover:text-blue-700 text-sm font-semibold transition-all">Varlıklar</Link>
            <Link href="/cash-ledger" className="px-4 py-3 rounded-xl hover:bg-slate-100 hover:text-blue-700 text-sm font-semibold transition-all">Kasa</Link>
            <Link href="/reference-data" className="px-4 py-3 rounded-xl hover:bg-slate-100 hover:text-blue-700 text-sm font-semibold transition-all">TÜFE Endeksi</Link>
          </nav>
        </aside>
        <main className="flex-1 p-10 overflow-auto relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
