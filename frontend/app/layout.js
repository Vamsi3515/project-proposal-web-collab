import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeClientProvider from "@/app/theme-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Create Next App",
  description: "Created by Purna and Vamsi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <ThemeClientProvider> {children} </ThemeClientProvider>
      </body>
    </html>
  );
}
