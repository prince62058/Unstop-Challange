import Sidebar from "@/components/dashboard/sidebar";

export default function PageLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-80 modern-sidebar border-r">
        <Sidebar />
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}