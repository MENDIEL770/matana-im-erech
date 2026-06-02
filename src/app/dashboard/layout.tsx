import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const customer = await prisma.customer.findFirst({
    where: { userId: session.id },
    select: {
      id: true,
      shaliachName: true,
      chabadHouseName: true,
    },
  });

  return (
    <div className="flex min-h-screen bg-[#FAF8F5]" dir="rtl">
      <DashboardSidebar
        name={customer?.shaliachName ?? session.name ?? session.email}
        chabadHouseName={customer?.chabadHouseName}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
