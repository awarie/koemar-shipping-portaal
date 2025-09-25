import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Truck, Ship, Plane, MapPin, Package, User, FileText, Calculator, Download } from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

type TransportType = 'sea' | 'air';
type Destination = 'suriname' | 'curacao' | 'aruba' | 'bonaire' | 'st_maarten';

interface PackageRegistration {
  packageNumber: string;
  transportType: TransportType;
  destination: Destination;
  weight: string;
  calculatedPrice: string;
  manualPrice?: string;
  finalPrice: string;
  
  // Package details
  packageContent?: string;
  packageValue?: string;
  
  // Payment methods
  paymentCash: boolean;
  paymentPin: boolean;
  paymentAccount: boolean;
  
  // Sender details - uitgebreide NAW
  senderFirstName: string;
  senderLastName: string;
  senderAddress: string;
  senderCity: string;
  senderCountry?: string;
  senderPhone?: string;
  senderMobile?: string;
  senderEmail?: string;
  
  // Receiver details - uitgebreide NAW
  receiverFirstName: string;
  receiverLastName: string;
  receiverAddress: string;
  receiverCity: string;
  receiverCountry?: string;
  receiverPhone?: string;
  receiverMobile?: string;
  receiverEmail?: string;
}

export default function PakketAanmelden() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<'transport' | 'country' | 'form'>('transport');
  const [transportType, setTransportType] = useState<TransportType | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [packageNumber, setPackageNumber] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [formData, setFormData] = useState<Partial<PackageRegistration>>({});
  const [useManualPrice, setUseManualPrice] = useState<boolean>(false);
  const [manualPrice, setManualPrice] = useState<string>('');

  // Get shipping prices for calculations
  const { data: shippingPrices = [] } = useQuery({
    queryKey: ['/api/shipping-prices'],
  });

  // Generate package number mutation
  const generatePackageNumberMutation = useMutation({
    mutationFn: async (data: { destination: Destination; transportType: TransportType }) => {
      const response = await apiRequest('POST', '/api/generate-package-number', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setPackageNumber(data.packageNumber);
      setExpiresAt(new Date(data.expiresAt));
      setStep('form');
      toast({
        title: "Pakketnummer gegenereerd",
        description: `Uw pakketnummer is ${data.packageNumber}. Dit nummer is 30 minuten gereserveerd.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kan geen pakketnummer genereren. Probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  // Register package mutation
  const registerPackageMutation = useMutation({
    mutationFn: async (packageData: PackageRegistration) => {
      const response = await apiRequest('POST', '/api/packages', packageData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/packages'] });
      toast({
        title: "Pakket geregistreerd",
        description: `Pakket ${data.packageNumber} is succesvol geregistreerd.`,
      });
      // Generate PDF and reset form
      generatePDF(data);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kan pakket niet registreren. Probeer opnieuw.",
        variant: "destructive",
      });
    },
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

  const resetForm = () => {
    setStep('transport');
    setTransportType(null);
    setDestination(null);
    setPackageNumber('');
    setExpiresAt(null);
    setFormData({});
    setUseManualPrice(false);
    setManualPrice('');
  };

  const handleTransportSelect = (type: TransportType) => {
    setTransportType(type);
    setStep('country');
  };

  const handleCountrySelect = (dest: Destination) => {
    setDestination(dest);
    generatePackageNumberMutation.mutate({ destination: dest, transportType: transportType! });
  };

  const calculatePrice = () => {
    if (!formData.weight || !transportType || !destination) return '0.00';
    
    const weightKg = parseFloat(formData.weight);
    if (isNaN(weightKg)) return '0.00';

    // Find appropriate price from shipping prices
    const priceEntry = Array.isArray(shippingPrices) ? shippingPrices.find((price: any) => 
      price.type === (transportType === 'sea' ? 'zeevracht' : 'luchtvracht') &&
      (destination === 'aruba' || destination === 'curacao' ? price.destination === 'aruba_curacao' :
       destination === 'bonaire' || destination === 'st_maarten' ? price.destination === 'bonaire_stmaarten' :
       price.destination === destination)
    ) : null;

    if (!priceEntry) return '0.00';

    const unitPrice = parseFloat(priceEntry.price);
    if (isNaN(unitPrice)) return '0.00';

    // Calculate based on unit type
    if (priceEntry.unit === 'per_kilo') {
      return (weightKg * unitPrice).toFixed(2);
    } else {
      // For boxes, assume 1 box for now (could be enhanced)
      return unitPrice.toFixed(2);
    }
  };

  const getFinalPrice = () => {
    return useManualPrice && manualPrice ? manualPrice : calculatePrice();
  };

  const generatePDF = (packageData: any) => {
    // Simple PDF generation using window.print()
    // In a real app, you'd use libraries like jsPDF or react-pdf
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const paymentMethods = [];
      if (packageData.paymentCash) paymentMethods.push('Cash');
      if (packageData.paymentPin) paymentMethods.push('PIN');
      if (packageData.paymentAccount) paymentMethods.push('Rekening');
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pakket Registratie - ${packageData.packageNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin: 20px 0; }
              .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .label { font-weight: bold; }
              .price-box { background: #f0f9ff; padding: 15px; border: 2px solid #0ea5e9; border-radius: 8px; margin: 10px 0; text-align: center; }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 11px; 
                color: #666;
                border-top: 1px solid #ccc;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Koemar Shipping Pakket Portaal</h1>
              <h2>Pakket Registratie</h2>
              <p><strong>Pakketnummer: ${packageData.packageNumber}</strong></p>
            </div>
            
            <div class="section">
              <h3>Transport Details</h3>
              <p><span class="label">Verzendwijze:</span> ${transportType === 'sea' ? 'Zeevracht' : 'Luchtvracht'}</p>
              <p><span class="label">Bestemming:</span> ${getDestinationLabel(destination!)}</p>
              <p><span class="label">Gewicht:</span> ${packageData.weight} kg</p>
              ${packageData.packageContent ? `<p><span class="label">Inhoud:</span> ${packageData.packageContent}</p>` : ''}
              ${packageData.packageValue ? `<p><span class="label">Waarde:</span> €${packageData.packageValue}</p>` : ''}
              <p><span class="label">Betaalmethode:</span> ${paymentMethods.join(', ')}</p>
            </div>
            
            <div class="price-box">
              <h3>Totaal Bedrag</h3>
              ${packageData.manualPrice ? 
                `<p>Automatisch berekend: €${packageData.calculatedPrice}</p>
                 <p>Handmatig aangepast: €${packageData.manualPrice}</p>
                 <h2 style="color: #0ea5e9;">Totaal: €${packageData.finalPrice}</h2>` 
                : 
                `<h2 style="color: #0ea5e9;">Totaal: €${packageData.finalPrice}</h2>`
              }
            </div>
            
            <div class="details">
              <div class="section">
                <h3>Afzender</h3>
                <p><span class="label">Naam:</span> ${packageData.senderFirstName} ${packageData.senderLastName}</p>
                <p><span class="label">Adres:</span> ${packageData.senderAddress}</p>
                <p><span class="label">Plaats:</span> ${packageData.senderCity}</p>
                ${packageData.senderCountry ? `<p><span class="label">Land:</span> ${packageData.senderCountry}</p>` : ''}
                ${packageData.senderPhone ? `<p><span class="label">Telefoon:</span> ${packageData.senderPhone}</p>` : ''}
                ${packageData.senderMobile ? `<p><span class="label">Mobiel:</span> ${packageData.senderMobile}</p>` : ''}
                ${packageData.senderEmail ? `<p><span class="label">Email:</span> ${packageData.senderEmail}</p>` : ''}
              </div>
              
              <div class="section">
                <h3>Ontvanger</h3>
                <p><span class="label">Naam:</span> ${packageData.receiverFirstName} ${packageData.receiverLastName}</p>
                <p><span class="label">Adres:</span> ${packageData.receiverAddress}</p>
                <p><span class="label">Plaats:</span> ${packageData.receiverCity}</p>
                ${packageData.receiverCountry ? `<p><span class="label">Land:</span> ${packageData.receiverCountry}</p>` : ''}
                ${packageData.receiverPhone ? `<p><span class="label">Telefoon:</span> ${packageData.receiverPhone}</p>` : ''}
                ${packageData.receiverMobile ? `<p><span class="label">Mobiel:</span> ${packageData.receiverMobile}</p>` : ''}
                ${packageData.receiverEmail ? `<p><span class="label">Email:</span> ${packageData.receiverEmail}</p>` : ''}
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Koemar Shipping Pakket Portaal</strong></p>
              <p>Dordtselaan 200-D • 3081 BK Rotterdam • Nederland</p>
              <p>Telefoon: 06 51 47 47 59 • Email: info@suripost.nl</p>
              <p>Website: www.suripost.nl</p>
              <hr style="margin: 15px 0;">
              <p>Geregistreerd op: ${new Date().toLocaleDateString('nl-NL')} om ${new Date().toLocaleTimeString('nl-NL')}</p>
              <p style="font-size: 10px; color: #999;">Dit document is automatisch gegenereerd door het Koemar Shipping Pakket Portaal</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getDestinationLabel = (dest: Destination) => {
    const labels = {
      suriname: 'Suriname',
      curacao: 'Curaçao',
      aruba: 'Aruba',
      bonaire: 'Bonaire',
      st_maarten: 'Sint Maarten'
    };
    return labels[dest];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageNumber || !transportType || !destination) {
      toast({
        title: "Fout",
        description: "Ontbrekende gegevens. Ga terug naar vorige stappen.",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one payment method is selected
    if (!formData.paymentCash && !formData.paymentPin && !formData.paymentAccount) {
      toast({
        title: "Fout",
        description: "Selecteer minimaal één betaalmethode.",
        variant: "destructive",
      });
      return;
    }

    const calculatedPrice = calculatePrice();
    const finalPrice = getFinalPrice();
    
    const packageData: PackageRegistration = {
      packageNumber,
      transportType,
      destination,
      weight: formData.weight || '',
      calculatedPrice,
      manualPrice: useManualPrice ? manualPrice : undefined,
      finalPrice,
      
      // Package details
      packageContent: formData.packageContent,
      packageValue: formData.packageValue,
      
      // Payment methods
      paymentCash: formData.paymentCash || false,
      paymentPin: formData.paymentPin || false,
      paymentAccount: formData.paymentAccount || false,
      
      // Sender details
      senderFirstName: formData.senderFirstName || '',
      senderLastName: formData.senderLastName || '',
      senderAddress: formData.senderAddress || '',
      senderCity: formData.senderCity || '',
      senderCountry: formData.senderCountry,
      senderPhone: formData.senderPhone,
      senderMobile: formData.senderMobile,
      senderEmail: formData.senderEmail,
      
      // Receiver details
      receiverFirstName: formData.receiverFirstName || '',
      receiverLastName: formData.receiverLastName || '',
      receiverAddress: formData.receiverAddress || '',
      receiverCity: formData.receiverCity || '',
      receiverCountry: formData.receiverCountry,
      receiverPhone: formData.receiverPhone,
      receiverMobile: formData.receiverMobile,
      receiverEmail: formData.receiverEmail,
    };

    registerPackageMutation.mutate(packageData);
  };

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
          <div className="mx-auto mb-6 h-20 w-20 bg-primary rounded-full flex items-center justify-center">
            <Truck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pakket Aanmelden
          </h1>
          <p className="text-xl text-gray-600">
            Meld een nieuw pakket aan voor verzending
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'transport' || step === 'country' || step === 'form' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              <Truck className="h-4 w-4" />
            </div>
            <div className={`h-px w-12 ${step === 'country' || step === 'form' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'country' || step === 'form' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              <MapPin className="h-4 w-4" />
            </div>
            <div className={`h-px w-12 ${step === 'form' ? 'bg-primary' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 'form' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
              <FileText className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Step 1: Transport Type Selection */}
        {step === 'transport' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Kies Verzendmethode</CardTitle>
              <CardDescription className="text-center">
                Selecteer hoe u uw pakket wilt verzenden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* Zeevracht Button */}
                <Button
                  variant="outline"
                  className="h-auto p-8 border-2 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleTransportSelect('sea')}
                  data-testid="button-zeevracht"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-blue-100 rounded-full p-4">
                      <Ship className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold">Zeevracht</h3>
                    <p className="text-gray-600">Verzending via zee transport</p>
                  </div>
                </Button>

                {/* Luchtvracht Button */}
                <Button
                  variant="outline"
                  className="h-auto p-8 border-2 hover:border-primary hover:bg-primary/5"
                  onClick={() => handleTransportSelect('air')}
                  data-testid="button-luchtvracht"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-sky-100 rounded-full p-4">
                      <Plane className="h-12 w-12 text-sky-600" />
                    </div>
                    <h3 className="text-2xl font-bold">Luchtvracht</h3>
                    <p className="text-gray-600">Verzending via lucht transport</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Country Selection */}
        {step === 'country' && transportType && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Kies Bestemming</CardTitle>
              <CardDescription className="text-center">
                Selecteer het land waar u uw pakket naartoe wilt verzenden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {[
                  { value: 'suriname', label: 'Suriname', code: transportType === 'sea' ? 'KZ' : 'KL' },
                  { value: 'curacao', label: 'Curaçao', code: transportType === 'sea' ? 'CZ' : 'CL' },
                  { value: 'aruba', label: 'Aruba', code: transportType === 'sea' ? 'AZ' : 'AL' },
                  { value: 'bonaire', label: 'Bonaire', code: transportType === 'sea' ? 'BZ' : 'BL' },
                  { value: 'st_maarten', label: 'Sint Maarten', code: transportType === 'sea' ? 'STMZ' : 'STML' }
                ].map((country) => (
                  <Button
                    key={country.value}
                    variant="outline"
                    className="h-auto p-6 border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => handleCountrySelect(country.value as Destination)}
                    disabled={generatePackageNumberMutation.isPending}
                    data-testid={`button-${country.value}`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <MapPin className="h-8 w-8 text-gray-600" />
                      <h3 className="font-bold">{country.label}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        Code: {country.code}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('transport')}
                  data-testid="button-back-transport"
                >
                  Terug naar verzendmethode
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Package Registration Form */}
        {step === 'form' && packageNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Pakket Gegevens</CardTitle>
              <CardDescription className="text-center">
                Vul alle gegevens in voor uw pakket
              </CardDescription>
              
              {/* Package Number Display */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-bold text-primary">
                    Pakketnummer: {packageNumber}
                  </span>
                </div>
                {expiresAt && (
                  <p className="text-sm text-center text-gray-600 mt-1">
                    Gereserveerd tot: {expiresAt.toLocaleTimeString('nl-NL')}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Weight and Price Section */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="weight">Gewicht (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="bijv. 2.5"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        required
                        data-testid="input-weight"
                      />
                    </div>
                    <div>
                      <Label>Automatisch Berekende Prijs</Label>
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <Calculator className="h-4 w-4 text-gray-500" />
                        <span className="font-bold text-lg">
                          €{calculatePrice()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Price Override */}
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="useManualPrice"
                        checked={useManualPrice}
                        onChange={(e) => setUseManualPrice(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="useManualPrice" className="font-medium">
                        Handmatige Prijsaanpassing
                      </Label>
                    </div>
                    
                    {useManualPrice && (
                      <div className="mt-3">
                        <Label htmlFor="manualPrice">Handmatige Prijs (€)</Label>
                        <Input
                          id="manualPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="bijv. 45.00"
                          value={manualPrice}
                          onChange={(e) => setManualPrice(e.target.value)}
                          data-testid="input-manual-price"
                        />
                      </div>
                    )}
                    
                    <div className="mt-3 p-2 bg-white rounded border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Totale Prijs:</span>
                        <span className="font-bold text-lg text-primary">
                          €{getFinalPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Package Details */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Package className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Pakket Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="packageContent">Inhoud Pakket *</Label>
                      <Input
                        id="packageContent"
                        placeholder="Beschrijf de inhoud van het pakket"
                        value={formData.packageContent || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, packageContent: e.target.value }))}
                        required
                        data-testid="input-package-content"
                      />
                    </div>
                    <div>
                      <Label htmlFor="packageValue">Waarde Pakket (€)</Label>
                      <Input
                        id="packageValue"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="bijv. 150.00"
                        value={formData.packageValue || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, packageValue: e.target.value }))}
                        data-testid="input-package-value"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Calculator className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Betaalmethode *</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="paymentCash"
                        checked={formData.paymentCash || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentCash: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        data-testid="checkbox-payment-cash"
                      />
                      <Label htmlFor="paymentCash">Cash</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="paymentPin"
                        checked={formData.paymentPin || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentPin: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        data-testid="checkbox-payment-pin"
                      />
                      <Label htmlFor="paymentPin">PIN</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="paymentAccount"
                        checked={formData.paymentAccount || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentAccount: e.target.checked }))}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        data-testid="checkbox-payment-account"
                      />
                      <Label htmlFor="paymentAccount">Rekening</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sender Information */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Afzender Gegevens</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="senderFirstName">Voornaam *</Label>
                      <Input
                        id="senderFirstName"
                        placeholder="Voornaam"
                        value={formData.senderFirstName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderFirstName: e.target.value }))}
                        required
                        data-testid="input-sender-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderLastName">Achternaam *</Label>
                      <Input
                        id="senderLastName"
                        placeholder="Achternaam"
                        value={formData.senderLastName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderLastName: e.target.value }))}
                        required
                        data-testid="input-sender-last-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderAddress">Adres *</Label>
                      <Input
                        id="senderAddress"
                        placeholder="Straat en huisnummer"
                        value={formData.senderAddress || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderAddress: e.target.value }))}
                        required
                        data-testid="input-sender-address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderCity">Plaats *</Label>
                      <Input
                        id="senderCity"
                        placeholder="Woonplaats"
                        value={formData.senderCity || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderCity: e.target.value }))}
                        required
                        data-testid="input-sender-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderCountry">Land</Label>
                      <Input
                        id="senderCountry"
                        placeholder="bijv. Nederland"
                        value={formData.senderCountry || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderCountry: e.target.value }))}
                        data-testid="input-sender-country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderPhone">Telefoon</Label>
                      <Input
                        id="senderPhone"
                        placeholder="bijv. 010-1234567"
                        value={formData.senderPhone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderPhone: e.target.value }))}
                        data-testid="input-sender-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderMobile">Mobiel Nr *</Label>
                      <Input
                        id="senderMobile"
                        placeholder="bijv. 06 12345678"
                        value={formData.senderMobile || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderMobile: e.target.value }))}
                        required
                        data-testid="input-sender-mobile"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderEmail">Email</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        placeholder="email@voorbeeld.nl"
                        value={formData.senderEmail || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, senderEmail: e.target.value }))}
                        data-testid="input-sender-email"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Receiver Information */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Ontvanger Gegevens</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receiverFirstName">Voornaam *</Label>
                      <Input
                        id="receiverFirstName"
                        placeholder="Voornaam"
                        value={formData.receiverFirstName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverFirstName: e.target.value }))}
                        required
                        data-testid="input-receiver-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverLastName">Achternaam *</Label>
                      <Input
                        id="receiverLastName"
                        placeholder="Achternaam"
                        value={formData.receiverLastName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverLastName: e.target.value }))}
                        required
                        data-testid="input-receiver-last-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverAddress">Adres *</Label>
                      <Input
                        id="receiverAddress"
                        placeholder="Straat en huisnummer"
                        value={formData.receiverAddress || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverAddress: e.target.value }))}
                        required
                        data-testid="input-receiver-address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverCity">Plaats *</Label>
                      <Input
                        id="receiverCity"
                        placeholder="Woonplaats"
                        value={formData.receiverCity || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverCity: e.target.value }))}
                        required
                        data-testid="input-receiver-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverCountry">Land</Label>
                      <Input
                        id="receiverCountry"
                        placeholder="bijv. Suriname"
                        value={formData.receiverCountry || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverCountry: e.target.value }))}
                        data-testid="input-receiver-country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverPhone">Telefoon</Label>
                      <Input
                        id="receiverPhone"
                        placeholder="Lokaal telefoonnummer"
                        value={formData.receiverPhone || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverPhone: e.target.value }))}
                        data-testid="input-receiver-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverMobile">Mobiel Nr *</Label>
                      <Input
                        id="receiverMobile"
                        placeholder="bijv. +597 123456"
                        value={formData.receiverMobile || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverMobile: e.target.value }))}
                        required
                        data-testid="input-receiver-mobile"
                      />
                    </div>
                    <div>
                      <Label htmlFor="receiverEmail">Email</Label>
                      <Input
                        id="receiverEmail"
                        type="email"
                        placeholder="email@voorbeeld.com"
                        value={formData.receiverEmail || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, receiverEmail: e.target.value }))}
                        data-testid="input-receiver-email"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setStep('country')}
                    data-testid="button-back-country"
                  >
                    Terug naar bestemming
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={registerPackageMutation.isPending}
                    className="flex items-center space-x-2"
                    data-testid="button-register-package"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{registerPackageMutation.isPending ? 'Bezig...' : 'Pakket Registreren'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}