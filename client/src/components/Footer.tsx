import { Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Koemar Shipping
          </p>
          <div className="text-xs text-gray-400 mt-1 space-y-1">
            <p>Dordtselaan 200-D • 06 51 47 47 59 • info@koemarshipping.com</p>
            <p>Applicatie ontwikkeld door <a href="https://poeranet.nl" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">Poeranet.nl</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
