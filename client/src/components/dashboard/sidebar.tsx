import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", icon: "fa-home", label: "Dashboard", badge: null },
    { path: "/emails", icon: "fa-envelope-open", label: "Emails", badge: "24" },
    { path: "/responses", icon: "fa-magic", label: "AI Responses", badge: null },
    { path: "/analytics", icon: "fa-chart-line", label: "Analytics", badge: null },
    { path: "/settings", icon: "fa-cog", label: "Settings", badge: null }
  ];

  return (
    <aside className={`modern-sidebar ${isCollapsed ? 'w-20' : 'w-72'} min-h-screen p-6 slide-in transition-all duration-500 bg-gradient-to-b from-white/98 to-blue-50/98 backdrop-blur-3xl`} data-testid="sidebar">
      <div className="mb-10 relative">
        <div className={`transition-all duration-500 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
              <i className="fas fa-brain text-white text-2xl"></i>
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-black gradient-text" data-testid="app-title">
                  AI-Powered Communication Assistant
                </h1>
                <p className="text-xs font-semibold text-muted-foreground">
                  🤖 Smart Email Management
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-green-700">ONLINE</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-4 glass-card p-3 rounded-full hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-110"
        >
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm`}></i>
        </button>
      </div>
      
      <nav className="space-y-4">
        {navItems.map((item, index) => (
          <Link key={item.path} href={item.path}>
            <div 
              className={`group relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 cursor-pointer bounce-in ${
                isActive(item.path) || (item.path === "/" && isActive("/dashboard"))
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl transform scale-105" 
                  : "glass-card hover:shadow-xl hover:scale-[1.02] hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
              }`} 
              style={{animationDelay: `${index * 0.1}s`}}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div className={`relative ${
                isActive(item.path) || (item.path === "/" && isActive("/dashboard"))
                  ? "" : "group-hover:scale-110 transition-transform duration-300"
              }`}>
                <i className={`fas ${item.icon} text-xl ${
                  isCollapsed ? 'mx-auto' : ''
                } ${
                  isActive(item.path) || (item.path === "/" && isActive("/dashboard"))
                    ? "text-white" : "text-gray-600 group-hover:text-blue-600"
                }`}></i>
              </div>
              {!isCollapsed && (
                <>
                  <span className={`font-bold text-lg ${
                    isActive(item.path) || (item.path === "/" && isActive("/dashboard"))
                      ? "text-white" : "text-gray-700 group-hover:text-blue-700"
                  }`}>{item.label}</span>
                  {item.badge && (
                    <div className="ml-auto relative">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse shadow-lg" data-testid="unread-count">
                        {item.badge}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-ping opacity-30"></div>
                    </div>
                  )}
                </>
              )}
              {/* Active indicator */}
              {(isActive(item.path) || (item.path === "/" && isActive("/dashboard"))) && (
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
              )}
            </div>
          </Link>
        ))}
      </nav>
      
      <div className="mt-10">
        <div className="glass-card p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50" data-testid="email-account-info">
          {!isCollapsed && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <i className="fas fa-envelope text-white text-lg"></i>
                </div>
                <h3 className="font-black text-lg gradient-text-static">Connected Account</h3>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-sm font-bold text-gray-700" data-testid="email-address">support@company.com</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <i className="fab fa-google text-red-500 text-lg"></i>
                <span className="text-sm font-semibold text-gray-600">Gmail API</span>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-600">Last sync:</span>
                  <span className="font-bold text-green-600">2 min ago</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="flex flex-col items-center gap-3">
              <i className="fab fa-google text-2xl text-red-500"></i>
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-30"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-8">
          <div className="glass-card p-6 rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="text-center">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-fit mx-auto mb-3">
                <i className="fas fa-crown text-white text-2xl"></i>
              </div>
              <h4 className="font-black text-lg mb-2 gradient-text-static">Pro Plan</h4>
              <p className="text-sm text-gray-600 mb-4 font-medium">Unlock advanced AI features</p>
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-check text-green-500"></i>
                  <span>Unlimited AI responses</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-check text-green-500"></i>
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <i className="fas fa-check text-green-500"></i>
                  <span>Priority support</span>
                </div>
              </div>
              <button className="btn-gradient w-full py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                <i className="fas fa-rocket mr-2"></i>
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
