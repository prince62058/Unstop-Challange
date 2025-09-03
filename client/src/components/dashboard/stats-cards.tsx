import { Card, CardContent } from "@/components/ui/card";
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
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Emails (24h)", value: "--", icon: "fa-envelope", color: "primary" },
          { title: "Urgent Emails", value: "--", icon: "fa-exclamation-triangle", color: "destructive" },
          { title: "Resolved", value: "--", icon: "fa-check-circle", color: "green-500" },
          { title: "Pending", value: "--", icon: "fa-clock", color: "yellow-500" }
        ].map((stat, index) => (
          <Card key={index} data-testid={`stat-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color}/10 rounded-lg`}>
                  <i className={`fas ${stat.icon} text-${stat.color}`}></i>
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                No data available
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Total Emails (24h)",
      value: stats.totalEmails,
      icon: "fa-envelope",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      change: "+12%",
      changeColor: "text-green-500",
      changeIcon: "fa-arrow-up"
    },
    {
      title: "Urgent Emails",
      value: stats.urgentEmails,
      icon: "fa-exclamation-triangle",
      bgColor: "bg-destructive/10",
      iconColor: "text-destructive",
      change: "-5%",
      changeColor: "text-destructive",
      changeIcon: "fa-arrow-down"
    },
    {
      title: "Resolved",
      value: stats.resolvedEmails,
      icon: "fa-check-circle",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500",
      change: "+8%",
      changeColor: "text-green-500",
      changeIcon: "fa-arrow-up"
    },
    {
      title: "Pending",
      value: stats.pendingEmails,
      icon: "fa-clock",
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-500",
      change: "+3%",
      changeColor: "text-yellow-500",
      changeIcon: "fa-arrow-up"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} data-testid={`stat-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground" data-testid={`stat-title-${index}`}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                <i className={`fas ${stat.icon} ${stat.iconColor}`}></i>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <i className={`fas ${stat.changeIcon} ${stat.changeColor} mr-1`}></i>
              <span className={stat.changeColor} data-testid={`stat-change-${index}`}>
                {stat.change}
              </span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
