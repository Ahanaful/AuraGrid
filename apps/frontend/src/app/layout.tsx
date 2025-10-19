import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { KeylessToastElevator } from "@/components/common/KeylessToastElevator";
import { ToastProvider } from "@/components/ui/ToastProvider";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AuraGrid',
  description: 'Carbon-aware scheduling for every AI cluster.',
  icons: {
    icon: '/cursor-lightning.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ToastProvider>
            <KeylessToastElevator />
            {children}
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
