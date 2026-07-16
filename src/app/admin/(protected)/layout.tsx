import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/session";
import { adminLogout } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/content-slots", label: "Content Slots" },
  { href: "/admin/content-assets", label: "Content Assets" },
  { href: "/admin/jobs", label: "Jobs" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  return (
    <div className="w-full bg-[#1b1b1b] text-[#e8e8e8] min-h-[70vh]">
      <div className="flex flex-col md:flex-row">
        <aside className="md:w-56 border-b md:border-b-0 md:border-r border-[#3a3a3a] shrink-0">
          <div className="px-5 py-5 border-b border-[#3a3a3a]">
            <p className="text-[0.65rem] tracking-widest uppercase text-[#9c7a3c]">Saks OFF 5TH</p>
            <p className="font-display text-lg">Business Manager</p>
          </div>
          <nav className="flex md:flex-col overflow-x-auto md:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-5 py-3 text-sm whitespace-nowrap hover:bg-[#242424] border-b md:border-b border-[#2a2a2a]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={adminLogout} className="px-5 py-4">
            <button type="submit" className="text-xs uppercase tracking-wide text-[#9a9a9a] hover:text-[#e8e8e8]">
              Log Out
            </button>
          </form>
        </aside>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
