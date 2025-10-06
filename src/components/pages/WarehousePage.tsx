import React, { useState } from 'react';
import { 
  Warehouse, Package, TrendingUp, TrendingDown, 
  Plus, Search, Truck, Users, FileText, 
  AlertTriangle, CheckCircle, Clock, X
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

export function WarehousePage() {
  const { 
    products, suppliers, stockMovements, purchaseOrders,
    addSupplier, addStockMovement, addPurchaseOrder, updatePurchaseOrder
  } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  const [movementForm, setMovementForm] = useState({
    product_id: '',
    type: 'kirim' as 'kirim' | 'chiqim' | 'qaytarish' | 'inventarizatsiya',
    quantity: '',
    reason: '',
    supplier_id: ''
  });

  const [orderForm, setOrderForm] = useState({
    supplier_id: '',
    items: [{ product_id: '', quantity: '', unit_price: '' }],
    delivery_date: '',
    notes: ''
  });

  const tabs = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: Warehouse },
    { id: 'movements', label: 'Tovar harakati', icon: TrendingUp },
    { id: 'suppliers', label: 'Ta\'minotchilar', icon: Truck },
    { id: 'orders', label: 'Buyurtmalar', icon: FileText }
  ];

  const lowStockProducts = products.filter(p => p.quantity <= p.min_quantity);
  const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(supplierForm);
    setSupplierForm({ name: '', contact_person: '', phone: '', email: '', address: '' });
    setShowAddSupplier(false);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    addStockMovement({
      ...movementForm,
      quantity: Number(movementForm.quantity),
      employee_id: user!.id
    });
    setMovementForm({
      product_id: '',
      type: 'kirim',
      quantity: '',
      reason: '',
      supplier_id: ''
    });
    setShowStockMovement(false);
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const items = orderForm.items.map(item => ({
      product_id: item.product_id,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price)
    }));
    const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    
    addPurchaseOrder({
      supplier_id: orderForm.supplier_id,
      items,
      total_amount,
      status: 'kutilmoqda',
      delivery_date: orderForm.delivery_date,
      notes: orderForm.notes
    });
    
    setOrderForm({
      supplier_id: '',
      items: [{ product_id: '', quantity: '', unit_price: '' }],
      delivery_date: '',
      notes: ''
    });
    setShowPurchaseOrder(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getMovementTypeLabel = (type: string) => {
    const labels = {
      kirim: 'Kirim',
      chiqim: 'Chiqim',
      qaytarish: 'Qaytarish',
      inventarizatsiya: 'Inventarizatsiya'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      kutilmoqda: 'Kutilmoqda',
      qabul_qilindi: 'Qabul qilindi',
      bekor_qilindi: 'Bekor qilindi'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jami mahsulotlar</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                  </div>
                  <Package className="w-10 h-10 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ombor qiymati</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(totalValue)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kam qolgan</p>
                    <p className="text-2xl font-bold text-gray-900">{lowStockProducts.length}</p>
                  </div>
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ta'minotchilar</p>
                    <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
                  </div>
                  <Truck className="w-10 h-10 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    Kam qolgan mahsulotlar
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-red-600 font-medium">
                          {product.quantity} ta qolgan
                        </span>
                        <span className="text-xs text-gray-500">
                          Min: {product.min_quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Movements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">So'nggi tovar harakatlari</h3>
              <div className="space-y-3">
                {stockMovements.slice(0, 5).map((movement) => {
                  const product = products.find(p => p.id === movement.product_id);
                  const supplier = suppliers.find(s => s.id === movement.supplier_id);
                  
                  return (
                    <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          movement.type === 'kirim' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {movement.type === 'kirim' ? 
                            <TrendingUp className="w-5 h-5 text-green-600" /> :
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product?.name}</p>
                          <p className="text-sm text-gray-500">
                            {getMovementTypeLabel(movement.type)} - {movement.reason}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{movement.quantity} ta</p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.created_at).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'movements':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Tovar harakatlari</h3>
              <button
                onClick={() => setShowStockMovement(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Harakat qo'shish</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Mahsulot</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Turi</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Miqdor</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Sabab</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stockMovements.map((movement) => {
                      const product = products.find(p => p.id === movement.product_id);
                      return (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">{product?.name}</p>
                            <p className="text-sm text-gray-500">{product?.brand}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              movement.type === 'kirim' ? 'bg-green-100 text-green-800' :
                              movement.type === 'chiqim' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {getMovementTypeLabel(movement.type)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`font-medium ${
                              movement.type === 'kirim' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movement.type === 'kirim' ? '+' : '-'}{movement.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{movement.reason}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">
                              {new Date(movement.created_at).toLocaleDateString('uz-UZ')}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'suppliers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Ta'minotchilar</h3>
              <button
                onClick={() => setShowAddSupplier(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Ta'minotchi qo'shish</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
                        <p className="text-sm text-gray-500">{supplier.contact_person}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">📞 {supplier.phone}</p>
                    {supplier.email && (
                      <p className="text-sm text-gray-600">✉️ {supplier.email}</p>
                    )}
                    {supplier.address && (
                      <p className="text-sm text-gray-600">📍 {supplier.address}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Buyurtmalar</h3>
              <button
                onClick={() => setShowPurchaseOrder(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Buyurtma berish</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Ta'minotchi</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Mahsulotlar</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Summa</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Holat</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Yetkazish</th>
                      <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchaseOrders.map((order) => {
                      const supplier = suppliers.find(s => s.id === order.supplier_id);
                      return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">{supplier?.name}</p>
                            <p className="text-sm text-gray-500">{supplier?.contact_person}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{order.items.length} ta mahsulot</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">
                              {formatPrice(order.total_amount)} so'm
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'kutilmoqda' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'qabul_qilindi' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">
                              {order.delivery_date ? 
                                new Date(order.delivery_date).toLocaleDateString('uz-UZ') : 
                                'Belgilanmagan'
                              }
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            {order.status === 'kutilmoqda' && (
                              <button
                                onClick={() => updatePurchaseOrder(order.id, { status: 'qabul_qilindi' })}
                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                              >
                                Qabul qilish
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ombor boshqaruvi</h1>
        <p className="text-gray-600">Tovarlar, ta'minotchilar va ombor harakatlarini boshqaring</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Yangi ta'minotchi qo'shish</h2>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kompaniya nomi *
                </label>
                <input
                  type="text"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aloqa shaxsi *
                </label>
                <input
                  type="text"
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manzil
                </label>
                <textarea
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Movement Modal */}
      {showStockMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Tovar harakati qo'shish</h2>
              <button
                onClick={() => setShowStockMovement(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mahsulot *
                </label>
                <select
                  value={movementForm.product_id}
                  onChange={(e) => setMovementForm({ ...movementForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Mahsulotni tanlang</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harakat turi *
                </label>
                <select
                  value={movementForm.type}
                  onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="kirim">Kirim</option>
                  <option value="chiqim">Chiqim</option>
                  <option value="qaytarish">Qaytarish</option>
                  <option value="inventarizatsiya">Inventarizatsiya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miqdor *
                </label>
                <input
                  type="number"
                  min="1"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sabab *
                </label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Harakat sababini kiriting"
                  required
                />
              </div>

              {movementForm.type === 'kirim' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ta'minotchi
                  </label>
                  <select
                    value={movementForm.supplier_id}
                    onChange={(e) => setMovementForm({ ...movementForm, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Ta'minotchini tanlang</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockMovement(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}