import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileHeader from "@/components/admin/AdminMobileHeader";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F4F1] flex">

      {/* Sidebar — desktop */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <AdminMobileHeader />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
