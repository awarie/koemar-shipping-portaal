import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Package, Plane, Edit2, Save, X, Ship } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { ShippingSchedule } from "@shared/schema";

export default function Afvaartschema() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    closingDate: "",
    departureDate: "",
    arrivalDate: ""
  });

  const { data: schedules = [], isLoading } = useQuery<ShippingSchedule[]>({
    queryKey: ["/api/shipping-schedules"],
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { closingDate: string; departureDate?: string; arrivalDate?: string } }) => {
      const response = await fetch(`/api/shipping-schedules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update schedule");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipping-schedules"] });
      setEditingId(null);
      setEditData({ closingDate: "", departureDate: "", arrivalDate: "" });
      toast({
        title: "Schema bijgewerkt",
        description: "Het afvaartschema is succesvol gewijzigd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van het schema.",
        variant: "destructive",
      });
    },
  });

  const startEdit = (schedule: ShippingSchedule) => {
    setEditingId(schedule.id);
    setEditData({
      closingDate: schedule.closingDate,
      departureDate: schedule.departureDate || "",
      arrivalDate: schedule.arrivalDate || ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ closingDate: "", departureDate: "", arrivalDate: "" });
  };

  const saveSchedule = () => {
    if (editingId && editData.closingDate.trim()) {
      updateScheduleMutation.mutate({ 
        id: editingId, 
        data: {
          closingDate: editData.closingDate.trim(),
          departureDate: editData.departureDate.trim() || undefined,
          arrivalDate: editData.arrivalDate.trim() || undefined
        }
      });
    }
  };

  const getDestinationLabel = (destination: string) => {
    switch (destination) {
      case 'suriname': return 'Suriname';
      case 'aruba_curacao': return 'Aruba/Curaçao';
      case 'bonaire_stmaarten': return 'Bonaire/St. Maarten';
      default: return destination;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'zeevracht' ? 
      <Package className="h-5 w-5 text-blue-600" /> : 
      <Plane className="h-5 w-5 text-green-600" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'zeevracht' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const zeevracht = schedules.filter((s) => s.type === 'zeevracht');
  const luchtvracht = schedules.filter((s) => s.type === 'luchtvracht');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Schema's laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Ship className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Afvaartschema Beheer</h1>
              <p className="text-gray-600">Beheer de sluitingsdatums en vertrekdata voor zee- en luchtvracht</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zeevracht Schema's */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Zeevracht Schema's</span>
                </CardTitle>
                <CardDescription>
                  Beheer sluitingsdatums en vertrekdata voor zeevracht
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {zeevracht.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                    data-testid={`zeevracht-schedule-${schedule.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(schedule.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(schedule.type)}`}>
                          {getDestinationLabel(schedule.destination)}
                        </span>
                      </div>
                      {editingId !== schedule.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(schedule)}
                          data-testid={`edit-schedule-${schedule.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {editingId === schedule.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sluitingsdatum
                          </label>
                          <Input
                            value={editData.closingDate}
                            onChange={(e) => setEditData(prev => ({ ...prev, closingDate: e.target.value }))}
                            placeholder="bijv. 15 januari 2025"
                            data-testid={`input-closing-date-${schedule.id}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vertrekdatum (optioneel)
                          </label>
                          <Input
                            value={editData.departureDate}
                            onChange={(e) => setEditData(prev => ({ ...prev, departureDate: e.target.value }))}
                            placeholder="bijv. 22 januari 2025"
                            data-testid={`input-departure-date-${schedule.id}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aankomstdatum (optioneel)
                          </label>
                          <Input
                            value={editData.arrivalDate}
                            onChange={(e) => setEditData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                            placeholder="bijv. 30 januari 2025"
                            data-testid={`input-arrival-date-${schedule.id}`}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={saveSchedule}
                            disabled={updateScheduleMutation.isPending}
                            data-testid={`save-schedule-${schedule.id}`}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Opslaan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            data-testid={`cancel-edit-schedule-${schedule.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Annuleren
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Sluitingsdatum:</span>
                          <span className="font-medium">{schedule.closingDate}</span>
                        </div>
                        {schedule.departureDate && (
                          <div className="flex items-center space-x-2">
                            <Ship className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Vertrekdatum:</span>
                            <span className="font-medium">{schedule.departureDate}</span>
                          </div>
                        )}
                        {schedule.arrivalDate && (
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Aankomstdatum:</span>
                            <span className="font-medium">{schedule.arrivalDate}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Luchtvracht Schema's */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="h-5 w-5 text-green-600" />
                  <span>Luchtvracht Schema's</span>
                </CardTitle>
                <CardDescription>
                  Beheer sluitingsdatums en vertrekdata voor luchtvracht
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {luchtvracht.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                    data-testid={`luchtvracht-schedule-${schedule.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(schedule.type)}
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(schedule.type)}`}>
                          {getDestinationLabel(schedule.destination)}
                        </span>
                      </div>
                      {editingId !== schedule.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(schedule)}
                          data-testid={`edit-schedule-${schedule.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {editingId === schedule.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sluitingsdatum
                          </label>
                          <Input
                            value={editData.closingDate}
                            onChange={(e) => setEditData(prev => ({ ...prev, closingDate: e.target.value }))}
                            placeholder="bijv. 10 januari 2025"
                            data-testid={`input-closing-date-${schedule.id}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vertrekdatum (optioneel)
                          </label>
                          <Input
                            value={editData.departureDate}
                            onChange={(e) => setEditData(prev => ({ ...prev, departureDate: e.target.value }))}
                            placeholder="bijv. 12 januari 2025"
                            data-testid={`input-departure-date-${schedule.id}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aankomstdatum (optioneel)
                          </label>
                          <Input
                            value={editData.arrivalDate}
                            onChange={(e) => setEditData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                            placeholder="bijv. 15 januari 2025"
                            data-testid={`input-arrival-date-${schedule.id}`}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={saveSchedule}
                            disabled={updateScheduleMutation.isPending}
                            data-testid={`save-schedule-${schedule.id}`}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Opslaan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            data-testid={`cancel-edit-schedule-${schedule.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Annuleren
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Sluitingsdatum:</span>
                          <span className="font-medium">{schedule.closingDate}</span>
                        </div>
                        {schedule.departureDate && (
                          <div className="flex items-center space-x-2">
                            <Plane className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Vertrekdatum:</span>
                            <span className="font-medium">{schedule.departureDate}</span>
                          </div>
                        )}
                        {schedule.arrivalDate && (
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Aankomstdatum:</span>
                            <span className="font-medium">{schedule.arrivalDate}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">Sluitingsdatums op Website</h3>
                <p className="text-blue-700 text-sm mt-1">
                  De sluitingsdatums die hier worden ingesteld zijn zichtbaar op de publieke website voor klanten. 
                  Zorg ervoor dat deze datums actueel zijn en regelmatig worden bijgewerkt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}