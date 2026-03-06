import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/providers/UserProvider";
import { SocketProvider } from "@/providers/SocketProvider";
import { CallProvider } from "@/providers/CallProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyLark - Connect and Collaborate",
  description: "Next-gen communication platform for seamless collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <SocketProvider>
            <CallProvider>{children}</CallProvider>
          </SocketProvider>
        </UserProvider>
      </body>
    </html>
  );
}
