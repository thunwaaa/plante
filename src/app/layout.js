import { Gelasio } from "next/font/google";
import NavBar from './components/navbar/NavBar'
import "./globals.css";

const gelasioSans = Gelasio({
  variable: "--font-gelasio-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Plante",
  description: "Plante helps you take better care of your plants with smart diagnosis, care reminders, and personalized recommendations",
  keywords: "plant care, plant diagnosis, gardening, plant health, plant care app",
  openGraph: {
    title: "Plante",
    description: "Smart plant care app for better gardening",
    type: "website",
  },
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
