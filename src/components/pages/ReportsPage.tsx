import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar, Download } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export function ReportsPage() {
  const { products, customers, sales } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const periods = [
    { value: 'today', label: 'Bugun' },
    { value: 'week', label: 'Bu hafta' },
    { value: 'month', label: 'Bu oy' },
    { value: 'year', label: 'Bu yil' }
  ];

  // Calculate stats based on selected period
  const getFilteredSales = () => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      switch (selectedPeriod) {
        case 'today':
          return saleDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= weekAgo;
        case 'month':
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        case 'year':
          return saleDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredSales = getFilteredSales();
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = filteredSales.length;
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Top selling products
  const productSales = new Map();
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productSales.get(item.product_id) || 0;
      productSales.set(item.product_id, current + item.quantity);
    });
  });

  const topProducts = Array.from(productSales.entries())
    .map(([productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return { product, quantity };
    })
    .filter(item => item.product)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hisobotlar va Analitika</h1>
          <p className="text-gray-600">Biznes statistikasi va ko'rsatkichlar</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jami daromad</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(totalRevenue)} so'm</p>
              <p className="text-sm text-green-600 mt-1">+12% oldingi davr bilan</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Savdolar soni</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              <p className="text-sm text-green-600 mt-1">+8% oldingi davr bilan</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">O'rtacha savdo</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(averageTransaction)} so'm</p>
              <p className="text-sm text-yellow-600 mt-1">-2% oldingi davr bilan</p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Faol mijozlar</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              <p className="text-sm text-green-600 mt-1">+15% oldingi davr bilan</p>
            </div>
            <Users className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Eng ko'p sotilgan mahsulotlar
          </h2>
          
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Ma'lumot yo'q</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={item.product?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name}</p>
                      <p className="text-sm text-gray-500">{item.product?.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.quantity} ta</p>
                    <p className="text-sm text-gray-500">sotilgan</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            To'lov usullari statistikasi
          </h2>

          <div className="space-y-4">
            {['naqd', 'karta', 'online'].map(method => {
              const methodSales = filteredSales.filter(sale => sale.payment_method === method);
              const methodRevenue = methodSales.reduce((sum, sale) => sum + sale.total, 0);
              const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;
              
              const methodLabels = {
                naqd: 'Naqd pul',
                karta: 'Bank kartasi',
                online: 'Online to\'lov'
              };

              const colors = {
                naqd: 'bg-green-500',
                karta: 'bg-blue-500',
                online: 'bg-purple-500'
              };

              return (
                <div key={method}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {methodLabels[method as keyof typeof methodLabels]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatPrice(methodRevenue)} so'm ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colors[method as keyof typeof colors]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">So'nggi savdolar</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Vaqt</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Mahsulotlar</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Summa</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">To'lov</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.slice(0, 10).map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {new Date(sale.created_at).toLocaleDateString('uz-UZ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.created_at).toLocaleTimeString('uz-UZ')}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-900">
                      {sale.items.length} ta mahsulot
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">
                      {formatPrice(sale.total)} so'm
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sale.payment_method === 'naqd' 
                        ? 'bg-green-100 text-green-800'
                        : sale.payment_method === 'karta'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {sale.payment_method === 'naqd' ? 'Naqd' : 
                       sale.payment_method === 'karta' ? 'Karta' : 'Online'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tanlangan davr uchun ma'lumot yo'q</p>
          </div>
        )}
      </div>
    </div>
  );
}