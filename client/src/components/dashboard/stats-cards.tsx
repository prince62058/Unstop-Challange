import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  stats?: {
    totalEmails: number;
    urgentEmails: number;
    resolvedEmails: number;
    pendingEmails: number;
  };
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card glass-card p-6 loading-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-3">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-16 w-16 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-2 w-12 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Emails", value: "--", icon: "fa-envelope", gradient: "gradient-primary", bgGradient: "from-blue-500/10 to-purple-500/10" },
          { title: "Urgent Emails", value: "--", icon: "fa-exclamation-triangle", gradient: "gradient-danger", bgGradient: "from-red-500/10 to-pink-500/10" },
          { title: "Resolved", value: "--", icon: "fa-check-circle", gradient: "gradient-success", bgGradient: "from-green-500/10 to-emerald-500/10" },
          { title: "Pending", value: "--", icon: "fa-clock", gradient: "gradient-warning", bgGradient: "from-yellow-500/10 to-orange-500/10" }
        ].map((stat, index) => (
          <div key={index} className={`stat-card glass-card p-6 bg-gradient-to-br ${stat.bgGradient} fade-in`} 
               style={{animationDelay: `${index * 0.1}s`}} data-testid={`stat-card-${index}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-black gradient-text-static">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient.replace('gradient-', 'from-')} shadow-lg`}>
                <i className={`fas ${stat.icon} text-white text-xl`}></i>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">No data available</span>
              <div className="flex items-center text-gray-400">
                <i className="fas fa-info-circle mr-1"></i>
                <span className="text-xs">24h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Emails",
      value: stats.totalEmails,
      icon: "fa-envelope",
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-500/10 to-purple-500/10",
      change: "+12%",
      changeColor: "text-emerald-500",
      changeIcon: "fa-trending-up",
      trend: "up"
    },
    {
      title: "Urgent Emails",
      value: stats.urgentEmails,
      icon: "fa-exclamation-triangle",
      gradient: "from-red-500 to-pink-600",
      bgGradient: "from-red-500/10 to-pink-500/10",
      change: "-5%",
      changeColor: "text-emerald-500",
      changeIcon: "fa-trending-down",
      trend: "down"
    },
    {
      title: "Resolved",
      value: stats.resolvedEmails,
      icon: "fa-check-circle",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-500/10 to-emerald-500/10",
      change: "+18%",
      changeColor: "text-emerald-500",
      changeIcon: "fa-trending-up",
      trend: "up"
    },
    {
      title: "Pending",
      value: stats.pendingEmails,
      icon: "fa-clock",
      gradient: "from-yellow-500 to-orange-600",
      bgGradient: "from-yellow-500/10 to-orange-500/10",
      change: "+3%",
      changeColor: "text-yellow-500",
      changeIcon: "fa-trending-up",
      trend: "neutral"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} 
             className={`stat-card glass-card p-6 bg-gradient-to-br ${stat.bgGradient} fade-in group cursor-pointer`} 
             style={{animationDelay: `${index * 0.1}s`}} 
             data-testid={`stat-card-${index}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide" 
                 data-testid={`stat-title-${index}`}>
                {stat.title}
              </p>
              <p className="text-4xl font-black gradient-text-static transition-all duration-300 group-hover:scale-110" 
                 data-testid={`stat-value-${index}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
              <i className={`fas ${stat.icon} text-white text-2xl`}></i>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <div className={`p-2 rounded-full ${
                stat.trend === 'up' ? 'bg-emerald-100' : 
                stat.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
              } mr-2`}>
                <i className={`fas ${stat.changeIcon} text-xs ${
                  stat.trend === 'up' ? 'text-emerald-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}></i>
              </div>
              <div>
                <span className={`font-bold ${
                  stat.trend === 'up' ? 'text-emerald-600' : 
                  stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`} data-testid={`stat-change-${index}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground ml-1 block">vs yesterday</span>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground">
              <i className="fas fa-clock mr-1"></i>
              <span>Live</span>
            </div>
          </div>
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4 w-8 h-8 border-2 border-current rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border border-current rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-current rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
