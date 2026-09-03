import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar, MobileHeader, MobileBottomNav } from "@/components/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
