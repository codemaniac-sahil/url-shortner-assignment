import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointer, Link2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['/api/activity'],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'click':
        return MousePointer;
      case 'create':
        return Link2;
      case 'expire':
        return Clock;
      default:
        return MousePointer;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'click':
        return 'bg-blue-500';
      case 'create':
        return 'bg-green-500';
      case 'expire':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-medium text-slate-900">Recent Activity</CardTitle>
        <p className="text-sm text-slate-600">Latest clicks and interactions</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activity?.map((item: any, index: number) => {
              const Icon = getActivityIcon(item.type);
              const isLast = index === activity.length - 1;
              
              return (
                <li key={index}>
                  <div className="relative pb-8">
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full ${getActivityColor(item.type)} flex items-center justify-center ring-8 ring-white`}>
                          <Icon className="text-white h-3 w-3" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-slate-500">
                            {item.type === 'click' && (
                              <>
                                Click on <span className="font-medium text-slate-900">{item.shortCode}</span>
                                {item.referrer && (
                                  <> from <span className="font-medium text-slate-900">{item.referrer}</span></>
                                )}
                              </>
                            )}
                            {item.type === 'create' && (
                              <>New link created: <span className="font-medium text-slate-900">{item.shortCode}</span></>
                            )}
                            {item.type === 'expire' && (
                              <>Link <span className="font-medium text-slate-900">{item.shortCode}</span> expired</>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-slate-500">
                          <time>{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}</time>
                        </div>
                      </div>
                    </div>
                    {!isLast && (
                      <div className="absolute top-0 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        {!activity || activity.length === 0 && (
          <div className="text-center py-6">
            <MousePointer className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm text-slate-500">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
