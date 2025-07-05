import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export const metadata = {
  title: "EWU Helpdesk - Course Planning, Routine Generation & CGPA Calculator",
  description: "Your comprehensive portal for East West University course planning, routine generation, and CGPA calculation. Built for EWU students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen flex flex-col`}
      >
        
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
