import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner"


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
        {children}
        <Toaster position="top-right" richColors/>
        </AuthProvider>
      </body>
    </html>
  );
}
