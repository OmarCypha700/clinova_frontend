import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
// import { Suspense } from "react";

export const metadata = {
  title: "ClinOva",
  description: "Nursing practicals assessment and tracking",
  manifest: "/manifest.json",
  // themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClinOva",
  },
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  // }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="image"
          href="/ClinOva.webp"
          imageSrcSet="/_next/image?url=%2FClinOva.webp&w=640&q=75 640w, /_next/image?url=%2FClinOva.webp&w=1080&q=75 1080w"
          imageSizes="(max-width: 768px) 100vw, 75vw"
        />
      </head>
      <body>
        <AuthProvider>
          <main>
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
