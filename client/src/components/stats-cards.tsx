import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Link2, MousePointer, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="ml-5 w-0 flex-1">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Links",
      value: stats?.totalLinks || 0,
      icon: Link2,
      color: "text-primary",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeText: "from last month",
    },
    {
      title: "Total Clicks",
      value: stats?.totalClicks || 0,
      icon: MousePointer,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      change: "+8.3%",
      changeText: "from last week",
    },
    {
      title: "Unique Visitors",
      value: stats?.uniqueVisitors || 0,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      change: "+15.2%",
      changeText: "from last month",
    },
    {
      title: "Avg. Click Rate",
      value: stats?.avgClickRate || 0,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-50",
      change: "-2.1%",
      changeText: "from last week",
      isNegative: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((stat) => (
        <Card key={stat.title} className="border border-slate-200 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">{stat.title}</dt>
                  <dd className="text-3xl font-bold text-slate-900">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <div className="bg-slate-50 px-5 py-3 rounded-b-xl">
            <div className="text-sm">
              <span className={`font-medium ${stat.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {stat.change}
              </span>
              <span className="text-slate-600"> {stat.changeText}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
