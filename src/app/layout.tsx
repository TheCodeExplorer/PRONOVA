import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PRONOVA | Minimal Project Management",
  description: "A minimal, beginner-friendly project management tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} bg-[#f8fafc] dark:bg-gray-950 transition-colors duration-300`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 lg:ml-64">
                <Topbar />
                <main className="mt-16 p-4 md:p-8 min-h-[calc(100vh-64px)]">
                  {children}
                </main>
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

