
import { Gelasio } from "next/font/google";
import NavBar from './components/navbar/NavBar'
import "./globals.css";

const gelasioSans = Gelasio({
  variable: "--font-gelasio-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Plante",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={gelasioSans.variable}>
      <head />
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
