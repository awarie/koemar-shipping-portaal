import { TrendingUp, CheckCircle, Truck, Warehouse } from "lucide-react";

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Totaal Zendingen</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-total-shipments">1,247</p>
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              <span data-testid="text-total-shipments-growth">+12%</span> deze maand
            </p>
          </div>
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Bezorgd Vandaag</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-delivered-today">89</p>
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              <span data-testid="text-delivered-today-growth">+8%</span> vs gisteren
            </p>
          </div>
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Voertuigen Actief</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-active-vehicles">24</p>
            <p className="text-sm text-gray-500 mt-1">
              <span data-testid="text-total-vehicles">32</span> totaal beschikbaar
            </p>
          </div>
          <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Truck className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Magazijn Status</p>
            <p className="text-3xl font-bold text-gray-900" data-testid="text-warehouse-capacity">78%</p>
            <p className="text-sm text-orange-600 mt-1">
              <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
              Bijna vol
            </p>
          </div>
          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Warehouse className="text-purple-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
