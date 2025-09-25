import { Truck, Package, Globe, Shield, Clock, Users, ArrowRight, CheckCircle, Star, Mail, Phone, MapPin, Plane, Calendar, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PublicWebsite() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Koemar Shipping</h1>
                <p className="text-xs text-gray-500">Pakket Portaal</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-primary transition-colors">Diensten</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors">Over Ons</a>
              <a href="#contact" className="text-gray-700 hover:text-primary transition-colors">Contact</a>
            </nav>
            
            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Shield className="mr-2 h-4 w-4" />
                  Login voor Beheer
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="sm:hidden">
                  <Shield className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Specialist in Zee- en Luchtvracht
              <span className="block text-primary">Al 33 jaar uw betrouwbare brug naar de Caraïben</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Betrouwbare logistiek tussen Nederland en het Caribisch gebied sinds 1991. 
              Gespecialiseerd in transport naar Suriname, Aruba, Curaçao, Bonaire en Sint Maarten.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <Package className="mr-2 h-5 w-5" />
                Zeevracht
              </Button>
              <Button size="lg" variant="outline">
                <Globe className="mr-2 h-5 w-5" />
                Luchtvracht
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Onze Diensten</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialisatie in zee- en luchtvracht naar de Caraïbische regio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="bg-blue-600 rounded-lg p-3 w-fit mb-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Zeevracht</h3>
              <p className="text-gray-600 mb-4">
                Kosteneffectieve zeevracht naar Suriname, Aruba, Curaçao, Bonaire en Sint Maarten. 
                Verschillende boxformaten beschikbaar voor alle behoeften.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Boxformaten van 60L tot 240L
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Vaste afvaartdata
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Deur-tot-deur service
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="bg-green-600 rounded-lg p-3 w-fit mb-4">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Luchtvracht</h3>
              <p className="text-gray-600 mb-4">
                Snelle luchtvracht voor urgente zendingen. €7,50 per kilo naar alle 
                Caraïbische bestemmingen met korte levertijden.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  €7,50 per kilogram
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Snelle levering
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Tracking & trace
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">33+</div>
              <div className="text-gray-600">Jaar ervaring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5</div>
              <div className="text-gray-600">Caraïbische bestemmingen</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.8%</div>
              <div className="text-gray-600">Leverbetrouwbaarheid</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2005</div>
              <div className="text-gray-600">Eigen pand Rotterdam</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Al 33 jaar betrouwbare logistiek
              </h2>
              <div className="space-y-6 text-gray-600">
                <p className="text-lg">
                  Koemar Shipping is een toonaangevend zee- en luchtvrachtbedrijf, gespecialiseerd in het transport van goederen tussen Nederland en de Caraïbische regio — waaronder Suriname, Aruba, Curaçao, Bonaire en Sint Maarten.
                </p>
                <p>
                  Sinds de oprichting in 1991 is het hoofdkantoor gevestigd aan de Dordtselaan in Rotterdam-Zuid. Wat begon als een gehuurde locatie groeide uit tot een vast bezit in 2005 — een mijlpaal die het resultaat is van een gezonde bedrijfsvoering en een strategisch financieel beleid.
                </p>
                <p>
                  Door slechts een beperkt deel van de bedrijfswinsten te onttrekken, kon Koemar Shipping duurzaam investeren in groei, innovatie en stabiliteit.
                </p>
                <div className="bg-primary/5 rounded-lg p-6 mt-6">
                  <p className="text-primary font-medium italic">
                    "Bij Koemar Shipping geloven we dat logistiek draait om meer dan alleen transport — het gaat om vertrouwen, transparantie en toewijding. Elke zending, groot of klein, behandelen we met zorg en precisie."
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-blue-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">💼 Wat ons uniek maakt</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ruim drie decennia ervaring</h4>
                    <p className="text-gray-600">Zee- en luchtvracht specialist sinds 1991</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Building className="h-6 w-6 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Eigen pand in Rotterdam</h4>
                    <p className="text-gray-600">Symbool van financiële kracht en continuïteit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Persoonlijke service</h4>
                    <p className="text-gray-600">Korte lijnen en betrokken medewerkers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className="h-6 w-6 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Caraïbische specialisatie</h4>
                    <p className="text-gray-600">Diepgaande kennis van lokale regelgeving</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transparante Prijzen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Duidelijke tarieven voor zeevracht en luchtvracht naar alle Caraïbische bestemmingen
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Zeevracht Pricing */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Zeevracht Tarieven</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Afmeting</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Suriname</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Aruba/Curaçao</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-900">Bonaire/St. Maarten</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3 px-2 font-medium">240 L</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€50,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€70,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€70,-</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">160 L</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€30,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€40,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€40,-</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">120 L</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€25,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€35,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€35,-</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">80 L</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€20,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€30,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€30,-</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 font-medium">60 L</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€15,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€25,-</td>
                        <td className="py-3 px-2 text-blue-600 font-semibold">€25,-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Luchtvracht Pricing */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <Plane className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Luchtvracht Tarieven</h3>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">€7,50</div>
                  <div className="text-lg text-gray-600 mb-4">per kilogram</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>✓ Alle Caraïbische bestemmingen</p>
                    <p>✓ Snelle levering</p>
                    <p>✓ Tracking & trace</p>
                    <p>✓ Veilige afhandeling</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white/60 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Bestemmingen:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Suriname (Paramaribo)</p>
                  <p>• Aruba (Oranjestad)</p>
                  <p>• Curaçao (Willemstad)</p>
                  <p>• Bonaire (Kralendijk)</p>
                  <p>• Sint Maarten (Philipsburg)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Heeft u vragen of wilt u een offerte aanvragen? Neem contact met ons op!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">E-mail</h3>
              <p className="text-gray-600">info@suripost.nl</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Telefoon</h3>
              <p className="text-gray-600">+31 (0)20 123 4567</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Adres</h3>
              <p className="text-gray-600">
                Dordtselaan<br />
                Rotterdam-Zuid
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary rounded-lg p-2">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Koemar Shipping</h1>
                  <p className="text-sm text-gray-300">Pakket Portaal</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                Betrouwbare logistieke diensten voor al uw zending- en vrachtbehoeften. 
                Wereldwijd netwerk, lokale service.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Diensten</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Pakketdiensten</li>
                <li>Internationale Vracht</li>
                <li>Express Diensten</li>
                <li>Douane-afhandeling</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>info@suripost.nl</li>
                <li>+31 (0)20 123 4567</li>
                <li>Hoofdstraat 123</li>
                <li>1000 AB Amsterdam</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Koemar Shipping Pakket Portaal. Alle rechten voorbehouden.
              <span className="block sm:inline sm:ml-2">
                Powered by <a href="https://poeranet.nl" className="text-primary hover:underline">Poeranet.nl</a>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}