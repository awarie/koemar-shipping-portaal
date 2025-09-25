import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plane } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function Luchtvracht() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
          <Link href="/pakket-aanmelden">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Terug naar Pakket Aanmelden</span>
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="mx-auto mb-6 h-20 w-20 bg-sky-600 rounded-full flex items-center justify-center">
            <Plane className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Luchtvracht
          </h1>
          <p className="text-xl text-gray-600">
            Verzending via lucht transport
          </p>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Luchtvracht Verzending
            </h2>
            <p className="text-gray-600 mb-8">
              Hier komt het formulier voor luchtvracht verzendingen.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
              <div className="text-6xl text-gray-400 mb-4">✈️</div>
              <p className="text-gray-600 text-lg">
                Luchtvracht aanmelding formulier
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Functionaliteit wordt binnenkort toegevoegd
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}