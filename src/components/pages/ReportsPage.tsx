import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar, Download, Filter, RefreshCw, Eye, FileText, PieChart, Activity, ArrowUpRight, ArrowDownRight, Minus, TrendingDown, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import * as XLSX from 'xlsx';

export function ReportsPage() {
  const { products, customers, sales } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: '',
    end: ''
  });
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  const periods = [
    { value: 'today', label: 'Bugun', icon: Calendar },
    { value: 'week', label: 'Bu hafta', icon: Calendar },
    { value: 'month', label: 'Bu oy', icon: Calendar },
    { value: 'year', label: 'Bu yil', icon: Calendar },
    { value: 'custom', label: 'Maxsus', icon: Calendar }
  ];

  // Refresh data function
  const refreshData = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  // Export data function
  const exportData = () => {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // 1. Sales Data Sheet
    const salesData = filteredSales.map(sale => {
      const customer = customers.find(c => c.id === sale.customer_id);
      return {
        'ID': sale.id,
        'Mijoz': customer?.name || 'Noma\'lum',
        'Telefon': customer?.phone || '',
        'Jami': sale.total,
        'To\'lov usuli': sale.payment_method === 'naqd' ? 'Naqd' : sale.payment_method === 'karta' ? 'Karta' : 'Online',
        'Sana': new Date(sale.created_at).toLocaleDateString('uz-UZ'),
        'Vaqt': new Date(sale.created_at).toLocaleTimeString('uz-UZ'),
        'Mahsulotlar soni': sale.items && Array.isArray(sale.items) ? sale.items.length : 0,
        'Jami dona': sale.items && Array.isArray(sale.items) ? sale.items.reduce((sum, item) => sum + item.quantity, 0) : 0
      };
    });
    
    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Savdolar');
    
    // 2. Top Products Sheet
    const topProductsData = topProducts.map((item, index) => ({
      'O\'rin': index + 1,
      'Mahsulot': item.product?.name || 'Noma\'lum',
      'Kategoriya': item.product?.category || '',
      'Sotilgan miqdor': item.quantity,
      'Narx': item.product?.selling_price || 0,
      'Jami summa': (item.product?.selling_price || 0) * item.quantity
    }));
    
    const productsSheet = XLSX.utils.json_to_sheet(topProductsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Mahsulotlar');
    
    // 3. Statistics Sheet
    const statsData = [
      { 'Ko\'rsatkich': 'Jami daromad', 'Qiymat': totalRevenue, 'Birlik': 'so\'m' },
      { 'Ko\'rsatkich': 'Jami savdolar', 'Qiymat': totalTransactions, 'Birlik': 'ta' },
      { 'Ko\'rsatkich': 'O\'rtacha savdo', 'Qiymat': averageTransaction, 'Birlik': 'so\'m' },
      { 'Ko\'rsatkich': 'Foyda/Zarar', 'Qiymat': profit, 'Birlik': 'so\'m' },
      { 'Ko\'rsatkich': 'Foyda marjasi', 'Qiymat': profitMargin, 'Birlik': '%' },
      { 'Ko\'rsatkich': 'Jami tannarx', 'Qiymat': totalCost, 'Birlik': 'so\'m' },
      { 'Ko\'rsatkich': 'Sotilgan mahsulotlar', 'Qiymat': totalProductsSold, 'Birlik': 'dona' },
      { 'Ko\'rsatkich': 'Faol mijozlar', 'Qiymat': uniqueCustomers, 'Birlik': 'ta' }
    ];
    
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistika');
    
    // 4. Payment Methods Sheet
    const paymentMethods = filteredSales.reduce((acc, sale) => {
      const method = sale.payment_method === 'naqd' ? 'Naqd' : sale.payment_method === 'karta' ? 'Karta' : 'Online';
      acc[method] = (acc[method] || 0) + sale.total;
      return acc;
    }, {} as Record<string, number>);
    
    const paymentData = Object.entries(paymentMethods).map(([method, amount]) => ({
      'To\'lov usuli': method,
      'Jami summa': amount,
      'Foiz': totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(1) : 0
    }));
    
    const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'To\'lov usullari');
    
    // Save file
    const fileName = `hisobot-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Calculate stats based on selected period
  const getFilteredSales = () => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      
      if (selectedPeriod === 'custom' && selectedDateRange.start && selectedDateRange.end) {
        const startDate = new Date(selectedDateRange.start);
        const endDate = new Date(selectedDateRange.end);
        return saleDate >= startDate && saleDate <= endDate;
      }
      
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

  // Calculate profit/loss
  const calculateProfit = () => {
    let totalCost = 0;
    let totalRevenue = 0;
    
    filteredSales.forEach(sale => {
      // Check if sale.items exists and is an array
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            totalCost += product.cost_price * item.quantity;
            totalRevenue += product.selling_price * item.quantity;
          }
        });
      }
    });
    
    return {
      cost: totalCost,
      revenue: totalRevenue,
      profit: totalRevenue - totalCost,
      margin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
    };
  };

  const profitData = calculateProfit();
  const profit = profitData.profit;
  const profitMargin = profitData.margin;
  const totalCost = profitData.cost;

  // Additional statistics
  const totalProductsSold = filteredSales.reduce((sum, sale) => {
    if (sale.items && Array.isArray(sale.items)) {
      return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }
    return sum;
  }, 0);
  
  const uniqueCustomers = new Set(filteredSales.map(sale => sale.customer_id)).size;
  
  // Previous period comparison
  const getPreviousPeriodSales = () => {
    const now = new Date();
    return sales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      switch (selectedPeriod) {
        case 'today':
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          return saleDate.toDateString() === yesterday.toDateString();
        case 'week':
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return saleDate >= twoWeeksAgo && saleDate < oneWeekAgo;
        case 'month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return saleDate >= lastMonth && saleDate < thisMonth;
        case 'year':
          return saleDate.getFullYear() === now.getFullYear() - 1;
        default:
          return false;
      }
    });
  };

  const previousSales = getPreviousPeriodSales();
  const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total, 0);
  const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const transactionChange = previousSales.length > 0 ? ((totalTransactions - previousSales.length) / previousSales.length) * 100 : 0;

  // Top selling products
  const productSales = new Map();
  filteredSales.forEach(sale => {
    // Check if sale.items exists and is an array
    if (sale.items && Array.isArray(sale.items)) {
      sale.items.forEach(item => {
        const current = productSales.get(item.product_id) || 0;
        productSales.set(item.product_id, current + item.quantity);
      });
    }
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hisobotlar va Analitika</h1>
          <p className="text-gray-600 mt-1">Biznes statistikasi va ko'rsatkichlar</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-6 lg:mt-0">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Umumiy
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Batafsil
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {periods.map(period => {
                const Icon = period.icon;
                return (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Custom Date Range */}
          {selectedPeriod === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-sm border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Jami daromad</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{formatPrice(totalRevenue)} so'm</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(revenueChange)}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(revenueChange)}`}>
                  {formatPercentage(revenueChange)} oldingi davr bilan
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className={`bg-gradient-to-br rounded-xl p-6 shadow-sm border ${
          profit >= 0 
            ? 'from-emerald-50 to-emerald-100 border-emerald-200' 
            : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                profit >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {profit >= 0 ? 'Foyda' : 'Zarar'}
              </p>
              <p className={`text-3xl font-bold mt-1 ${
                profit >= 0 ? 'text-emerald-900' : 'text-red-900'
              }`}>
                {formatPrice(Math.abs(profit))} so'm
              </p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {profitMargin.toFixed(1)}% foyda marjasi
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}>
              {profit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-white" />
              ) : (
                <TrendingDown className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Savdolar soni</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{totalTransactions}</p>
              <div className="flex items-center mt-2">
                {getChangeIcon(transactionChange)}
                <span className={`text-sm font-medium ml-1 ${getChangeColor(transactionChange)}`}>
                  {formatPercentage(transactionChange)} oldingi davr bilan
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Average Transaction */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">O'rtacha savdo</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{formatPrice(averageTransaction)} so'm</p>
              <div className="flex items-center mt-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium ml-1">
                  {totalProductsSold} ta mahsulot sotilgan
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-sm border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Faol mijozlar</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{uniqueCustomers}</p>
              <div className="flex items-center mt-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium ml-1">
                  {customers.length} jami mijoz
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
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
                      {sale.items && Array.isArray(sale.items) ? sale.items.length : 0} ta mahsulot
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