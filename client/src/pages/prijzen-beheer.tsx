import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Package, Plane, Edit2, Save, X, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ShippingPrice } from "@shared/schema";

export default function PrijzenBeheer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const { data: prices = [], isLoading } = useQuery<ShippingPrice[]>({
    queryKey: ["/api/shipping-prices"],
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: string }) => {
      const response = await fetch(`/api/shipping-prices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      if (!response.ok) throw new Error("Failed to update price");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-prices"] });
      setEditingId(null);
      setEditPrice("");
      toast({
        title: "Prijs bijgewerkt",
        description: "De prijs is succesvol gewijzigd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de prijs.",
        variant: "destructive",
      });
    },
  });

  const startEdit = (price: ShippingPrice) => {
    setEditingId(price.id);
    setEditPrice(price.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const savePrice = () => {
    if (editingId && editPrice.trim()) {
      updatePriceMutation.mutate({ id: editingId, price: editPrice.trim() });
    }
  };

  const getDestinationLabel = (destination: string) => {
    switch (destination) {
      case 'suriname': return 'Suriname';
      case 'aruba': return 'Aruba';
      case 'curacao': return 'Curaçao';
      case 'bonaire': return 'Bonaire';
      case 'st_maarten': return 'Sint Maarten';
      default: return destination;
    }
  };

  // Groepeer prijzen per bestemming
  const destinations = ['suriname', 'aruba', 'curacao', 'bonaire', 'st_maarten'];
  const zeevracht = prices.filter((p) => p.type === 'zeevracht');
  const luchtvracht = prices.filter((p) => p.type === 'luchtvracht');
  
  const zeevrachPrijzenPerLand = destinations.map(dest => ({
    destination: dest,
    label: getDestinationLabel(dest),
    prices: zeevracht.filter(p => p.destination === dest).sort((a, b) => {
      const sizeOrder = ['60L', '80L', '120L', '160L', '240L'];
      return sizeOrder.indexOf(a.size || '') - sizeOrder.indexOf(b.size || '');
    })
  }));
  
  const luchtvrachPrijzenPerLand = destinations.map(dest => ({
    destination: dest,
    label: getDestinationLabel(dest),
    prices: luchtvracht.filter(p => p.destination === dest)
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Prijzen laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prijzen Beheer</h1>
          <p className="text-gray-600">Beheer de tarieven voor zeevracht en luchtvracht</p>
        </div>
      </div>

      {/* Zeevracht Prijzen per Land */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span>Zeevracht Prijzen</span>
            </CardTitle>
            <CardDescription>
              Beheer de prijzen per doosgrootte per bestemming (60L, 80L, 120L, 160L, 240L)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {zeevrachPrijzenPerLand.map((landData) => (
                <div key={landData.destination} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                    <Package className="h-4 w-4 mr-2 text-blue-600" />
                    {landData.label}
                  </h3>
                  <div className="space-y-2">
                    {landData.prices.map((price) => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50"
                        data-testid={`zeevracht-price-${price.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            {price.size}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {editingId === price.id ? (
                            <>
                              <Input
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20"
                                data-testid={`input-price-${price.id}`}
                              />
                              <Button
                                size="sm"
                                onClick={savePrice}
                                disabled={updatePriceMutation.isPending}
                                data-testid={`save-price-${price.id}`}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                data-testid={`cancel-edit-${price.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-blue-600 min-w-[60px]">
                                €{price.price}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(price)}
                                data-testid={`edit-price-${price.id}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Luchtvracht Prijzen per Land */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5 text-green-600" />
              <span>Luchtvracht Prijzen</span>
            </CardTitle>
            <CardDescription>
              Beheer de prijzen per kilogram per bestemming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4">
              {luchtvrachPrijzenPerLand.map((landData) => (
                <div key={landData.destination} className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center">
                    <Plane className="h-4 w-4 mr-2 text-green-600" />
                    {landData.label}
                  </h3>
                  <div className="space-y-2">
                    {landData.prices.map((price) => (
                      <div
                        key={price.id}
                        className="flex items-center justify-between p-3 bg-white border rounded hover:bg-gray-50"
                        data-testid={`luchtvracht-price-${price.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Per kg
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {editingId === price.id ? (
                            <>
                              <Input
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20"
                                data-testid={`input-price-${price.id}`}
                              />
                              <Button
                                size="sm"
                                onClick={savePrice}
                                disabled={updatePriceMutation.isPending}
                                data-testid={`save-price-${price.id}`}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEdit}
                                data-testid={`cancel-edit-${price.id}`}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-green-600 min-w-[60px]">
                                €{price.price}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEdit(price)}
                                data-testid={`edit-price-${price.id}`}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      </main>
      
      <Footer />
    </div>
  );
}