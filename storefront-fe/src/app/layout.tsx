import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/toast";
import ErrorBoundary from "@/components/common/error-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookingSmart - Your Travel Companion",
  description: "Book flights, hotels, and travel packages with BookingSmart. Find the best deals for your next adventure.",
  keywords: "travel, flights, hotels, booking, vacation, travel packages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <Header />
            <main>{children}</main>
            <Toaster />
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
