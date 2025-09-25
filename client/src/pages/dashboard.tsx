import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Truck, Package, FileText, User, Clock, Plane, Ship, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user, isAdmin } = useAuth();
  useWebSocket(); // Initialize WebSocket connection

  // Fetch package statistics
  const { data: statistics = {
    air: {
      aangemeld: 0,
      vertrokken: 0,
      aangekomen: 0,
      afgeleverd: 0,
      total: 0
    },
    sea: {
      aangemeld: 0,
      vertrokken: 0,
      aangekomen: 0,
      afgeleverd: 0,
      total: 0
    }
  } } = useQuery<{
    air: {
      aangemeld: number;
      vertrokken: number;
      aangekomen: number;
      afgeleverd: number;
      total: number;
    };
    sea: {
      aangemeld: number;
      vertrokken: number;
      aangekomen: number;
      afgeleverd: number;
      total: number;
    };
  }>({
    queryKey: ["/api/package-statistics"],
    enabled: isAuthenticated && isAdmin, // Only admins can see statistics
  });

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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-16">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" data-testid="text-welcome-title">
            Welkom bij Koemar Shipping
          </h2>
          <p className="text-xl text-gray-600" data-testid="text-welcome-subtitle">
            Kies een optie om te beginnen
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className={`grid grid-cols-1 gap-6 mx-auto max-w-7xl ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}>
          {/* Pakket Aanmelden Button */}
          <Link href="/pakket-aanmelden">
            <button 
              className="w-full h-80 bg-primary hover:bg-primary/90 text-white rounded-2xl p-8 text-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              data-testid="button-register-package"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="bg-white/20 rounded-full p-6">
                  <Truck className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Pakket Aanmelden</h3>
                <p className="text-white/80 text-lg">Meld een nieuw pakket aan voor verzending</p>
              </div>
            </button>
          </Link>

          {/* Pakket Opzoeken Button */}
          <Link href="/pakket-opzoeken">
            <button 
              className="w-full h-80 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl p-8 text-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              data-testid="button-search-package"
            >
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="bg-white/20 rounded-full p-6">
                  <Package className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Pakket Opzoeken</h3>
                <p className="text-white/80 text-lg">Zoek een bestaand pakket op</p>
              </div>
            </button>
          </Link>

          {/* Manifest Button - Only visible for Admin */}
          {isAdmin && (
            <Link href="/manifest">
              <button 
                className="w-full h-80 bg-green-600 hover:bg-green-700 text-white rounded-2xl p-8 text-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                data-testid="button-manifest"
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="bg-white/20 rounded-full p-6">
                    <FileText className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Manifest</h3>
                  <p className="text-white/80 text-lg">Bekijk en beheer manifesten</p>
                </div>
              </button>
            </Link>
          )}
          
          {/* Gebruikersbeheer Button - Only visible for Admin */}
          {isAdmin && (
            <Link href="/gebruikersbeheer">
              <button 
                className="w-full h-80 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl p-8 text-center transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                data-testid="button-user-management"
              >
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="bg-white/20 rounded-full p-6">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Gebruikersbeheer</h3>
                  <p className="text-white/80 text-lg">Beheer gebruikers en rechten</p>
                </div>
              </button>
            </Link>
          )}
        </div>

        {/* Statistics Section - Only visible for Admin */}
        {isAdmin && (
          <div className="mt-16 max-w-7xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Pakket Statistieken
            </h3>
            
            {/* Luchtvracht Statistieken */}
            <div className="mb-12">
              <h4 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                <Plane className="h-6 w-6 mr-2" />
                Luchtvracht
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 text-center">
                  <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-orange-800 mb-1">Aangemeld</h5>
                  <p className="text-2xl font-bold text-orange-600" data-testid="stat-air-aangemeld">
                    {statistics.air.aangemeld}
                  </p>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                  <Plane className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Vertrokken</h5>
                  <p className="text-2xl font-bold text-blue-600" data-testid="stat-air-vertrokken">
                    {statistics.air.vertrokken}
                  </p>
                </div>
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <Ship className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-purple-800 mb-1">Aangekomen</h5>
                  <p className="text-2xl font-bold text-purple-600" data-testid="stat-air-aangekomen">
                    {statistics.air.aangekomen}
                  </p>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-green-800 mb-1">Afgeleverd</h5>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-air-afgeleverd">
                    {statistics.air.afgeleverd}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h5 className="text-sm font-medium text-blue-800 mb-1">Totaal Luchtvracht</h5>
                <p className="text-3xl font-bold text-blue-600" data-testid="stat-air-total">
                  {statistics.air.total}
                </p>
              </div>
            </div>

            {/* Zeevracht Statistieken */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <Ship className="h-6 w-6 mr-2" />
                Zeevracht
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4 text-center">
                  <Clock className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-orange-800 mb-1">Aangemeld</h5>
                  <p className="text-2xl font-bold text-orange-600" data-testid="stat-sea-aangemeld">
                    {statistics.sea.aangemeld}
                  </p>
                </div>
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                  <Plane className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Vertrokken</h5>
                  <p className="text-2xl font-bold text-blue-600" data-testid="stat-sea-vertrokken">
                    {statistics.sea.vertrokken}
                  </p>
                </div>
                <div className="bg-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <Ship className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-purple-800 mb-1">Aangekomen</h5>
                  <p className="text-2xl font-bold text-purple-600" data-testid="stat-sea-aangekomen">
                    {statistics.sea.aangekomen}
                  </p>
                </div>
                <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <h5 className="text-sm font-medium text-green-800 mb-1">Afgeleverd</h5>
                  <p className="text-2xl font-bold text-green-600" data-testid="stat-sea-afgeleverd">
                    {statistics.sea.afgeleverd}
                  </p>
                </div>
              </div>
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h5 className="text-sm font-medium text-green-800 mb-1">Totaal Zeevracht</h5>
                <p className="text-3xl font-bold text-green-600" data-testid="stat-sea-total">
                  {statistics.sea.total}
                </p>
              </div>
            </div>

            {/* Overall Total */}
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Totaal Alle Pakketten</h4>
              <p className="text-4xl font-bold text-gray-700" data-testid="stat-total">
                {statistics.air.total + statistics.sea.total}
              </p>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
