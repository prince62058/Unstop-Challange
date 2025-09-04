import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", icon: "fa-tachometer-alt", label: "Dashboard", badge: null },
    { path: "/emails", icon: "fa-envelope", label: "Emails", badge: "24" },
    { path: "/responses", icon: "fa-reply", label: "AI Responses", badge: null },
    { path: "/analytics", icon: "fa-chart-bar", label: "Analytics", badge: null },
    { path: "/settings", icon: "fa-cog", label: "Settings", badge: null }
  ];

  return (
    <aside className={`modern-sidebar ${isCollapsed ? 'w-20' : 'w-64'} min-h-screen p-6 slide-in transition-all duration-300`} data-testid="sidebar">
      <div className="mb-8 relative">
        <div className={`transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <h1 className="text-xl font-bold gradient-text flex items-center gap-3 mb-2" data-testid="app-title">
            <i className="fas fa-robot text-2xl"></i>
            {!isCollapsed && "AI Communication Assistant"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {!isCollapsed && "Smart Email Management"}
          </p>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-2 glass-card p-2 rounded-full hover:shadow-lg transition-all"
        >
          <i className={`fas ${isCollapsed ? 'fa-angle-right' : 'fa-angle-left'} text-sm`}></i>
        </button>
      </div>
      
      <nav className="space-y-3">
        {navItems.map((item, index) => (
          <Link key={item.path} href={item.path}>
            <div 
              className={`glass-card flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer bounce-in ${
                isActive(item.path) || (item.path === "/" && isActive("/dashboard"))
                  ? "btn-gradient text-white shadow-lg" 
                  : "hover:shadow-lg hover:scale-105"
              }`} 
              style={{animationDelay: `${index * 0.1}s`}}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <i className={`fas ${item.icon} text-lg ${isCollapsed ? 'mx-auto' : ''}`}></i>
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse" data-testid="unread-count">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="mt-8">
        <div className="glass-card p-4 rounded-xl" data-testid="email-account-info">
          {!isCollapsed && (
            <>
              <h3 className="font-semibold mb-3 text-sm gradient-text">Email Account</h3>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-sm font-medium" data-testid="email-address">support@company.com</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <i className="fab fa-google text-red-500"></i>
                Connected via Gmail API
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last sync:</span>
                <span className="font-medium text-green-500">2 min ago</span>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-2">
              <i className="fab fa-google text-xl text-red-500"></i>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-6">
          <div className="glass-card p-4 rounded-xl border border-pink-200/50 bg-gradient-to-r from-pink-50/60 to-rose-50/60">
            <div className="text-center">
              <i className="fas fa-crown text-2xl text-pink-500 mb-2"></i>
              <h4 className="font-semibold text-sm mb-1 text-gray-800">Professional Plan</h4>
              <p className="text-xs text-gray-600 mb-3">Advanced analytics & features</p>
              <button className="btn-gradient w-full py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-pink-500 to-pink-600">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
