import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// components
import Header from "@/common/components/header";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayVault",
  description:
    "An all-in-one YouTube downloader that simply works. Effortlessly download videos and entire playlists in any format you need. Fast, reliable, and easy to use—this tool has you covered for all your downloading needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
