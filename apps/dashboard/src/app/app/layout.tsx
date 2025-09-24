import PageTransition from "@/components/PageTransition";
import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/auth";
import ChatWidget from "@/components/ChatWidget";
import { ensureLowStockCron } from "@/lib/lowStockCron";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

ensureLowStockCron();

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user ?? null;
  return (
    <div className="relative flex min-h-dvh w-full bg-muted/40">
      <Sidebar user={user} />
      <div className="flex min-h-dvh w-full flex-1 flex-col md:pl-[15rem] lg:pl-[16rem]">
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
        <ChatWidget />
      </div>
    </div>
  );
}
