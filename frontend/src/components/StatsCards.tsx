import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import { DashboardStats } from "@/types/complaint";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

/**
 * Dashboard statistics cards component
 */
export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  const cards = [
    {
      title: "Total Complaints",
      value: stats.total,
      icon: FileText,
      className: "border-dashboard-accent",
    },
    {
      title: "Reported",
      value: stats.reported,
      icon: AlertCircle,
      className: "border-destructive",
    },
    {
      title: "Acknowledged",
      value: stats.acknowledged,
      icon: Clock,
      className: "border-warning",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      className: "border-success",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className={`border-2 ${card.className} transition-all hover:shadow-lg`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.title === "Total Complaints"
                  ? "All time complaints"
                  : `${((card.value / stats.total) * 100).toFixed(
                      1
                    )}% of total`}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
