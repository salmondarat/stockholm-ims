import PageTransition from "@/components/PageTransition";
import Sidebar from "@/components/Sidebar";
import MobileTopbar from "@/components/MobileTopbar";
import { auth } from "@/lib/auth";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user ?? null;
  return (
    <div className="min-h-dvh flex overflow-x-hidden">
      <Sidebar user={user} />
      <div className="flex-1 bg-gray-50 w-full md:pl-60 lg:pl-64">
        <MobileTopbar user={user} />
        <PageTransition>{children}</PageTransition>
        <ChatWidget />
      </div>
    </div>
  );
}
