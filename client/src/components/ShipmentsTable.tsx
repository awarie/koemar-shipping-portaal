import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Shipment } from "@shared/schema";

export default function ShipmentsTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
    retry: false,
  });

  // Listen for refetch events from WebSocket notifications
  useEffect(() => {
    const handleRefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
    };

    window.addEventListener('refetchData', handleRefetch);
    return () => window.removeEventListener('refetchData', handleRefetch);
  }, [queryClient]);

  // Test function to simulate shipment update
  const triggerTestUpdate = async () => {
    try {
      const response = await fetch('/api/shipments/test-shipment/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'Bezorgd',
          eta: 'Voltooid'
        }),
      });

      if (response.ok) {
        toast({
          title: "Test Update",
          description: "Test notificatie verzonden!",
        });
      }
    } catch (error) {
      console.error('Error triggering test update:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'onderweg':
        return 'bg-yellow-100 text-yellow-800';
      case 'bezorgd':
        return 'bg-green-100 text-green-800';
      case 'wordt geladen':
        return 'bg-blue-100 text-blue-800';
      case 'vertraagd':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fallback shipments for when data is loading or empty
  const fallbackShipments = [
    {
      id: '1',
      shipmentNumber: '#ZND-2024-0158',
      customer: 'TechStore B.V.',
      destination: 'Rotterdam',
      status: 'Onderweg',
      eta: '14:30',
    },
    {
      id: '2',
      shipmentNumber: '#ZND-2024-0157',
      customer: 'ModeHuis Amsterdam',
      destination: 'Utrecht',
      status: 'Bezorgd',
      eta: 'Voltooid',
    },
    {
      id: '3',
      shipmentNumber: '#ZND-2024-0156',
      customer: 'FoodMarket Plus',
      destination: 'Den Haag',
      status: 'Wordt geladen',
      eta: '16:00',
    },
  ];

  const displayShipments = shipments && shipments.length > 0 ? shipments : fallbackShipments;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Huidige Zendingen</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={triggerTestUpdate}
              data-testid="button-test-notification"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Notificatie
            </Button>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-new-shipment">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Zending
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zending ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Klant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestemming
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50" data-testid={`row-shipment-${shipment.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {shipment.shipmentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.eta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary hover:text-primary/80 mr-3" data-testid={`button-track-${shipment.id}`}>
                      Volgen
                    </button>
                    <button className="text-gray-600 hover:text-gray-900" data-testid={`button-details-${shipment.id}`}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Toont <span className="font-medium">1</span> tot <span className="font-medium">{displayShipments.length}</span> van <span className="font-medium">247</span> zendingen
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" data-testid="button-previous">Vorige</Button>
            <Button size="sm" className="bg-primary text-white" data-testid="button-page-1">1</Button>
            <Button variant="outline" size="sm" data-testid="button-page-2">2</Button>
            <Button variant="outline" size="sm" data-testid="button-page-3">3</Button>
            <Button variant="outline" size="sm" data-testid="button-next">Volgende</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
