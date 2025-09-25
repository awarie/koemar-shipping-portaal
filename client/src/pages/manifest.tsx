import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Package, Clock, Plane, Ship, CheckCircle, Edit3 } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import type { Package as PackageType } from "@shared/schema";

export default function Manifest() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  // Fetch all packages
  const { data: packages = [], isLoading: packagesLoading } = useQuery<PackageType[]>({
    queryKey: ["/api/packages"],
    enabled: isAuthenticated,
  });

  // Update package status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ packageNumber, status }: { packageNumber: string; status: string }) => {
      return await apiRequest("PATCH", `/api/packages/${packageNumber}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/package-statistics"] });
      setEditingStatus(null);
      toast({
        title: "Status Bijgewerkt",
        description: "De pakket status is succesvol gewijzigd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de status.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aangemeld': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'vertrokken': return <Plane className="h-4 w-4 text-blue-600" />;
      case 'aangekomen': return <Ship className="h-4 w-4 text-purple-600" />;
      case 'afgeleverd': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aangemeld': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'vertrokken': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'aangekomen': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'afgeleverd': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aangemeld': return 'Aangemeld';
      case 'vertrokken': return 'Vertrokken';
      case 'aangekomen': return 'Aangekomen';
      case 'afgeleverd': return 'Afgeleverd';
      default: return status;
    }
  };

  const handleStatusUpdate = (packageNumber: string, newStatus: string) => {
    updateStatusMutation.mutate({ packageNumber, status: newStatus });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Terug naar Dashboard</span>
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 h-20 w-20 bg-green-600 rounded-full flex items-center justify-center">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Manifest
          </h1>
          <p className="text-xl text-gray-600">
            Bekijk en beheer manifesten
          </p>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Pakket Manifest
            </h2>
            <p className="text-gray-600">
              Overzicht van alle geregistreerde pakketten met hun huidige status
            </p>
          </div>

          {packagesLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Pakketten laden...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Geen pakketten gevonden</h3>
              <p className="text-gray-600">Er zijn nog geen pakketten geregistreerd.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pakketnummer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bestemming
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afzender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ontvanger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aangemeld
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50" data-testid={`package-row-${pkg.packageNumber}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{pkg.packageNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          pkg.transportType === 'air' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {pkg.transportType === 'air' ? 'Luchtvracht' : 'Zeevracht'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {pkg.destination.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{`${pkg.senderFirstName} ${pkg.senderLastName}`}</div>
                          <div className="text-gray-500 text-xs">{pkg.senderEmail || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{`${pkg.receiverFirstName} ${pkg.receiverLastName}`}</div>
                          <div className="text-gray-500 text-xs">{pkg.receiverEmail || ''}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(pkg.status)}`}>
                          {getStatusIcon(pkg.status)}
                          <span className="ml-1">{getStatusLabel(pkg.status)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pkg.createdAt ? new Date(pkg.createdAt).toLocaleDateString('nl-NL') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingStatus === pkg.packageNumber ? (
                          <div className="flex items-center space-x-2">
                            <Select
                              value={pkg.status}
                              onValueChange={(value) => handleStatusUpdate(pkg.packageNumber, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aangemeld">Aangemeld</SelectItem>
                                <SelectItem value="vertrokken">Vertrokken</SelectItem>
                                <SelectItem value="aangekomen">Aangekomen</SelectItem>
                                <SelectItem value="afgeleverd">Afgeleverd</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingStatus(null)}
                            >
                              Annuleer
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingStatus(pkg.packageNumber)}
                            className="flex items-center space-x-1"
                            data-testid={`edit-status-${pkg.packageNumber}`}
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Status</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Manifest Maken Sectie */}
          {packages.length > 0 && (
            <div className="mt-8 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manifest Maken</h3>
                  <p className="text-gray-600">Selecteer transport type en bestemming voor manifest export</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Kies Transport Type</option>
                      <option value="air">Luchtvracht</option>
                      <option value="sea">Zeevracht</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Kies Bestemming</option>
                      <option value="suriname">Suriname</option>
                      <option value="curacao">Curaçao</option>
                      <option value="aruba">Aruba</option>
                      <option value="bonaire">Bonaire</option>
                      <option value="st_maarten">St. Maarten</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-create-manifest"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Manifest Maken
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                      data-testid="button-export-excel"
                    >
                      Export Excel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}