import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />
      <div className="flex-1"><PageTransition>{children}</PageTransition></div>
    </div>
  );
}
