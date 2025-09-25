import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Shield, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Inloggen gelukt!",
          description: "Welkom terug bij Koemar Shipping",
        });
        // Force a page reload to ensure session is properly loaded
        window.location.reload();
      } else {
        toast({
          title: "Inloggen mislukt",
          description: data.message || "Controleer uw gegevens en probeer opnieuw",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Inloggen mislukt",
        description: "Er is een fout opgetreden. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Koemar Shipping</h2>
            <p className="text-sm text-gray-600">Login om verder te gaan</p>
          </div>

          {/* Login Card */}
          <Card>
            <CardContent className="pt-6 space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mailadres
                    </Label>
                    <div className="relative">
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Uw e-mailadres"
                        className="pl-3"
                        data-testid="input-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Wachtwoord
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-3"
                        data-testid="input-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Onthoud mij
                  </label>
                </div>

                <div>
                  <Button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    data-testid="button-login"
                    disabled={isLoading}
                  >
                    {isLoading ? "Inloggen..." : "Inloggen"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Koemar Shipping
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Applicatie ontwikkeling en onderhoud door <a href="https://poeranet.nl" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">Poeranet.nl</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
