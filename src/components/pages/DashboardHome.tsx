import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Users, TrendingUp, 
  AlertTriangle, DollarSign, Calendar, Award 
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardHomeProps {
  onPageChange: (page: string) => void;
}

export function DashboardHome({ onPageChange }: DashboardHomeProps) {
  const { products, customers, sales } = useData();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time vaqt yangilanishi
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);
  const todaysSales = sales.filter(sale => {
    const today = new Date().toDateString();
    return new Date(sale.created_at).toDateString() === today;
  });
  const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);

  // Real-time statistikalar
  const totalProducts = products.length;
  const totalCustomers = customers.length;
  const lowStockCount = lowStockProducts.length;
  
  // Bugungi savdo statistikasi
  const todaysSalesCount = todaysSales.length;
  const averageSale = todaysSalesCount > 0 ? todaysRevenue / todaysSalesCount : 0;

  const stats = [
    {
      title: "Bugungi savdo",
      value: `${todaysRevenue.toLocaleString()} so'm`,
      icon: DollarSign,
      color: "bg-green-500",
      change: todaysSalesCount > 0 ? `+${todaysSalesCount} savdo` : "Savdo yo'q",
      subtitle: `O'rtacha: ${averageSale.toLocaleString()} so'm`
    },
    {
      title: "Jami mahsulotlar",
      value: totalProducts.toString(),
      icon: Package,
      color: "bg-blue-500",
      change: totalProducts > 0 ? `${totalProducts} ta` : "Mahsulot yo'q",
      subtitle: `Omborida`
    },
    {
      title: "Faol mijozlar",
      value: totalCustomers.toString(),
      icon: Users,
      color: "bg-purple-500",
      change: totalCustomers > 0 ? `${totalCustomers} mijoz` : "Mijoz yo'q",
      subtitle: `Ro'yxatda`
    },
    {
      title: "Tugab qolgan",
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: lowStockCount > 0 ? "bg-red-500" : "bg-green-500",
      change: lowStockCount > 0 ? "Diqqat!" : "Hammasi OK",
      subtitle: lowStockCount > 0 ? `${lowStockCount} ta mahsulot` : "Yetarli miqdor"
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Xush kelibsiz, {user?.name}!
        </h1>
        <p className="opacity-90 text-sm sm:text-base">
          <span className="hidden sm:inline">
            Bugun {currentTime.toLocaleDateString('uz-UZ', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} - 
          </span>
          <span className="sm:hidden">
            {currentTime.toLocaleDateString('uz-UZ', { 
              day: 'numeric', 
              month: 'short' 
            })} - 
          </span>
          {currentTime.toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${
                  stat.change.includes('+') ? 'text-green-600' : 
                  stat.change.includes('Diqqat') ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm sm:text-base">{stat.title}</p>
              {stat.subtitle && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tezkor amallar</h2>
          <div className="space-y-2 sm:space-y-3">
            <button 
              onClick={() => onPageChange('sales')}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Yangi savdo qilish</p>
                <p className="text-xs sm:text-sm text-gray-500">Kassa oynasini ochish</p>
              </div>
            </button>
            <button 
              onClick={() => onPageChange('products')}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Mahsulot qo'shish</p>
                <p className="text-xs sm:text-sm text-gray-500">Yangi tovar kiritish</p>
              </div>
            </button>
            <button 
              onClick={() => onPageChange('customers')}
              className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Mijoz ro'yxatga olish</p>
                <p className="text-xs sm:text-sm text-gray-500">Yangi mijoz qo'shish</p>
              </div>
            </button>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Tugab qolgan mahsulotlar</h2>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <AlertTriangle className={`w-4 h-4 sm:w-5 sm:h-5 ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`} />
              <span className={`text-xs sm:text-sm font-medium ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {lowStockCount} ta
              </span>
            </div>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-3 sm:py-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <p className="text-gray-500 text-sm sm:text-base">Hamma mahsulotlar yetarli miqdorda</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">Real-time yangilanadi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {product.quantity} ta qolgan
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {product.min_quantity} ta
                    </p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 4 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  va yana {lowStockProducts.length - 4} ta mahsulot...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}