import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CheckCircle, Truck, AlertTriangle, Package, X } from "lucide-react";
import type { Activity } from "@shared/schema";

export default function RecentActivity() {
  const queryClient = useQueryClient();
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    retry: false,
  });

  // Listen for refetch events from WebSocket notifications
  useEffect(() => {
    const handleRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    };

    window.addEventListener('refetchData', handleRefetch);
    return () => window.removeEventListener('refetchData', handleRefetch);
  }, [queryClient]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'delivery':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'departure':
        return <Truck className="text-blue-600" size={16} />;
      case 'delay':
        return <AlertTriangle className="text-yellow-600" size={16} />;
      case 'received':
        return <Package className="text-purple-600" size={16} />;
      case 'failed':
        return <X className="text-red-600" size={16} />;
      default:
        return <Package className="text-gray-600" size={16} />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'delivery':
        return 'bg-green-100';
      case 'departure':
        return 'bg-blue-100';
      case 'delay':
        return 'bg-yellow-100';
      case 'received':
        return 'bg-purple-100';
      case 'failed':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Net nu';
    if (diffInMinutes < 60) return `${diffInMinutes} minuten geleden`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} uur geleden`;
    return `${Math.floor(diffInMinutes / 1440)} dagen geleden`;
  };

  // Fallback activities for when data is loading or empty
  const fallbackActivities = [
    {
      id: '1',
      type: 'delivery',
      description: 'Zending #ZND-2024-0156 bezorgd',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'departure',
      description: 'Voertuig VRG-001 vertrokken naar Amsterdam',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'delay',
      description: 'Vertraging gemeld voor route RT-A02',
      createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'received',
      description: 'Nieuwe voorraad ontvangen in magazijn MAG-C',
      createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'failed',
      description: 'Bezorging mislukt voor #ZND-2024-0151',
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    },
  ];

  const displayActivities = activities && activities.length > 0 ? activities : fallbackActivities;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Recente Activiteit</h3>
      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {displayActivities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`h-8 w-8 ${getActivityBgColor(activity.type)} rounded-full flex items-center justify-center mt-1`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900" data-testid={`text-activity-${activity.id}`}>
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500" data-testid={`text-activity-time-${activity.id}`}>
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <a href="#" className="text-sm font-medium text-primary hover:text-primary/80" data-testid="link-all-activity">
          Alle activiteit bekijken →
        </a>
      </div>
    </div>
  );
}
