import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Housing Price Prediction Portal",
  description: "AI-powered property valuation and market analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏠</span>
                <span className="font-bold text-xl">Housing Price Portal</span>
              </div>
              <div className="flex space-x-1">
                <Link href="/" className="px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Home
                </Link>
                <Link href="/property-estimator" className="px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Property Estimator
                </Link>
                <Link href="/market-analysis" className="px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Market Analysis
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-gray-800 text-gray-300 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>© 2026 Housing Price Prediction System</p>
          </div>
        </footer>
      </body>
    </html>
  );
}