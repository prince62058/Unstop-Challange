import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-64 bg-card border-r border-border p-6" data-testid="sidebar">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2" data-testid="app-title">
          <i className="fas fa-robot"></i>
          AI Communication Assistant
        </h1>
      </div>
      
      <nav className="space-y-2">
        <Link href="/">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
            isActive("/") || isActive("/dashboard")
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`} data-testid="nav-dashboard">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </div>
        </Link>
        
        <Link href="/emails">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
            isActive("/emails")
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`} data-testid="nav-emails">
            <i className="fas fa-envelope"></i>
            <span>Emails</span>
            <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full" data-testid="unread-count">
              24
            </span>
          </div>
        </Link>
        
        <Link href="/responses">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
            isActive("/responses")
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`} data-testid="nav-responses">
            <i className="fas fa-reply"></i>
            <span>AI Responses</span>
          </div>
        </Link>
        
        <Link href="/analytics">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
            isActive("/analytics")
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`} data-testid="nav-analytics">
            <i className="fas fa-chart-bar"></i>
            <span>Analytics</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
            isActive("/settings")
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent hover:text-accent-foreground"
          }`} data-testid="nav-settings">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>
        </Link>
      </nav>
      
      <div className="mt-8 p-4 bg-muted rounded-lg" data-testid="email-account-info">
        <h3 className="font-medium mb-2 text-muted-foreground">Email Account</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" data-testid="connection-status"></div>
          <span className="text-sm" data-testid="email-address">support@company.com</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Connected via Gmail API</p>
      </div>
    </aside>
  );
}
