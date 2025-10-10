import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Search, Minus, X, CreditCard, Banknote, Smartphone, Package, AlertCircle, Tag } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoryContext';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export function SalesPage() {
  const { products, customers, addSale, addProduct } = useData();
  const { user } = useAuth();
  const { categories } = useCategories();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'naqd' | 'karta' | 'online'>('naqd');
  const [showPayment, setShowPayment] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [usedProductNames, setUsedProductNames] = useState<Set<string>>(new Set());
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    cost_price: '',
    selling_price: '',
    discount: '',
    quantity: '',
    min_quantity: '',
    barcode: '',
    description: ''
  });

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchLower) ||
                         product.barcode.includes(searchTerm) ||
                         product.category.toLowerCase().includes(searchLower) ||
                         product.brand.toLowerCase().includes(searchLower);
    
    const matchesCategoryFilter = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategoryFilter;
  });

  // Mahsulot nomlarini yig'ish
  useEffect(() => {
    const names = new Set(products.map(product => product.name.toLowerCase()));
    setUsedProductNames(names);
  }, [products]);

  // Shtrix-kod kiritilganda avtomatik mahsulot qo'shish
  useEffect(() => {
    if (searchTerm.length >= 8) { // Minimal shtrix-kod uzunligi
      const product = products.find(p => p.barcode === searchTerm.trim());
      if (product) {
        addToCart(product);
        setSearchTerm(''); // Input'ni tozalash
        console.log('Mahsulot avtomatik qo\'shildi:', product.name);
      }
    }
  }, [searchTerm, products]);

  // Avtomatik hisoblash funksiyasi
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const costPrice = parseFloat(formData.cost_price) || 0;
    
    if (quantity > 0 && costPrice > 0) {
      const totalPrice = quantity * costPrice;
      setFormData(prev => ({
        ...prev,
        price: totalPrice.toString()
      }));
    }
  }, [formData.quantity, formData.cost_price]);

  // Mahsulot nomi o'zgarishini kuzatish
  useEffect(() => {
    if (formData.name.length > 0) {
      const nameLower = formData.name.toLowerCase();
      const suggestions = Array.from(usedProductNames).filter(name => 
        name.includes(nameLower) && name !== nameLower
      ).slice(0, 5);
      setNameSuggestions(suggestions);
      setShowNameSuggestions(suggestions.length > 0);
    } else {
      setShowNameSuggestions(false);
      setNameSuggestions([]);
    }
  }, [formData.name, usedProductNames]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        nameInputRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !nameInputRef.current.contains(event.target as Node)
      ) {
        setShowNameSuggestions(false);
      }
    };

    if (showNameSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNameSuggestions]);

  // Kategoriyalar ro'yxatini olish
  const getCategoriesWithCounts = () => {
    const categoryCounts = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const allCount = products.length;
    const categoryList = [
      { name: 'Barchasi', value: 'all', count: allCount }
    ];

    // Mavjud kategoriyalar
    Object.entries(categoryCounts).forEach(([category, count]) => {
      categoryList.push({ name: category, value: category, count });
    });

    return categoryList;
  };

  const handleNameSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion
    }));
    setShowNameSuggestions(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      brand: '',
      price: '',
      cost_price: '',
      selling_price: '',
      discount: '',
      quantity: '',
      min_quantity: '',
      barcode: '',
      description: ''
    });
    setShowAddProductModal(false);
    setShowNameSuggestions(false);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usedProductNames.has(formData.name.toLowerCase())) {
      alert('Bu nom allaqachon ishlatilgan! Boshqa nom tanlang.');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        discount: parseFloat(formData.discount) || 0,
        quantity: parseInt(formData.quantity) || 0,
        min_quantity: parseInt(formData.min_quantity) || 0,
        barcode: formData.barcode,
        description: formData.description
      };

      await addProduct(productData);
      resetForm();
      alert('Mahsulot muvaffaqiyatli qo\'shildi!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Mahsulot qo\'shishda xatolik yuz berdi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addToCart = (product: typeof products[0], quantity: number = 1) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.selling_price,
        quantity: quantity,
        discount: product.discount
      }]);
    }
  };

  const handleProductClick = (product: typeof products[0]) => {
    // To'g'ridan-to'g'ri savatga qo'shish
    addToCart(product, 1);
    setShowCartModal(true);
  };


  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = (itemTotal * item.discount) / 100;
      return sum + discountAmount;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const completeSale = () => {
    if (cart.length === 0) return;

    const sale = {
      customer_id: selectedCustomer || undefined,
      user_id: user!.id,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      })),
      total: calculateTotal(),
      payment_method: paymentMethod
    };

    addSale(sale);
    setCart([]);
    setSelectedCustomer('');
    setShowPayment(false);
    setShowCartModal(false);
    alert('Savdo muvaffaqiyatli amalga oshirildi!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Products Section */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Savdo (Kassa)</h1>
            <p className="text-gray-600">Mahsulotlarni tanlang va savdo qiling</p>
          </div>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Mahsulot qo'shish</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Mahsulot nomi, kategoriya, brend yoki shtrix-kod bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">Kategoriyalar</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {getCategoriesWithCounts().map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Cart Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setShowCartModal(true)}
            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>"{searchTerm}"</strong> bo'yicha qidiruv natijasi: 
              <span className="ml-1 font-semibold">{filteredProducts.length} ta mahsulot topildi</span>
            </p>
          </div>
        )}

        {/* Category Filter Info */}
        {selectedCategory !== 'all' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              <strong>"{selectedCategory}"</strong> kategoriyasidagi mahsulotlar: 
              <span className="ml-1 font-semibold">{filteredProducts.length} ta</span>
            </p>
          </div>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && (searchTerm || selectedCategory !== 'all') && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">Hech narsa topilmadi</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm 
                ? `"${searchTerm}" bo'yicha hech qanday mahsulot topilmadi`
                : `"${selectedCategory}" kategoriyasida mahsulot yo'q`
              }
            </p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div 
                onClick={() => handleProductClick(product)}
                className="cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">
                      {formatPrice(product.selling_price)} so'm
                    </p>
                    {product.discount > 0 && (
                      <p className="text-sm text-red-600">-{product.discount}%</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{product.quantity} ta</p>
                </div>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => handleProductClick(product)}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Savatga qo'shish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Cart Modal - Mobile */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:items-center justify-center p-0 lg:p-4 z-50">
          <div className="bg-white rounded-t-xl lg:rounded-xl w-full lg:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <span>Savat ({cart.length})</span>
                </h2>
                <button
                  onClick={() => setShowCartModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Savat bo'sh</p>
                <p className="text-sm text-gray-400 mt-2">Mahsulot qo'shish uchun mahsulot ustiga bosing</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Cart Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)} so'm</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mijoz (ixtiyoriy)
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Mijozni tanlang</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span>Jami:</span>
                    <span>{formatPrice(calculateSubtotal())} so'm</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Chegirma:</span>
                      <span>-{formatPrice(calculateDiscount())} so'm</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>To'lov:</span>
                    <span>{formatPrice(calculateTotal())} so'm</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To'lov usuli
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('naqd')}
                      className={`p-2 rounded-lg border text-center ${
                        paymentMethod === 'naqd'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Naqd</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('karta')}
                      className={`p-2 rounded-lg border text-center ${
                        paymentMethod === 'karta'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Karta</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('online')}
                      className={`p-2 rounded-lg border text-center ${
                        paymentMethod === 'online'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">Online</span>
                    </button>
                  </div>
                </div>

                {/* Complete Sale Button */}
                <button
                  onClick={completeSale}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Savdoni yakunlash
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mahsulot qo'shish modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <span>Yangi mahsulot qo'shish</span>
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mahsulot nomi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mahsulot nomi *
                    </label>
                    <div className="relative">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isSubmitting}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        required
                        placeholder="Masalan: iPhone 15 Pro Max"
                      />
                      
                      {/* Takliflar ro'yxati */}
                      {showNameSuggestions && nameSuggestions.length > 0 && (
                        <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <div className="p-2 border-b border-gray-200 bg-blue-50">
                            <p className="text-xs font-medium text-blue-700">Avval qo'shilgan mahsulotlar:</p>
                          </div>
                          {nameSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleNameSuggestionClick(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                            >
                              <span className="text-gray-700">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Takroriy nom xatoligi */}
                    {formData.name && usedProductNames.has(formData.name.toLowerCase()) && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-yellow-700">
                            Bu nom allaqachon ishlatilgan! Boshqa nom tanlang.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kategoriya */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoriya *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      placeholder="Masalan: Telefonlar"
                    />
                  </div>

                  {/* Brend */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brend *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      placeholder="Masalan: Apple"
                    />
                  </div>

                  {/* Shtrix-kod */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shtrix-kod
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Masalan: 123456789012"
                    />
                  </div>

                  {/* Miqdor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Miqdor *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      min="0"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Avtomatik hisoblash uchun miqdor va tannarxni kiriting</p>
                  </div>

                  {/* Tannarx */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tannarx *
                    </label>
                    <input
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  {/* Sotiladigan narx */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sotiladigan narx *
                    </label>
                    <input
                      type="number"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0"
                    />
                  </div>

                  {/* Asosiy narx (avtomatik) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asosiy narx
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      placeholder="Miqdor × Tannarx"
                    />
                    <p className="text-xs text-gray-500 mt-1">Avtomatik hisoblanadi</p>
                  </div>

                  {/* Chegirma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chegirma (%)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>

                  {/* Minimal miqdor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimal miqdor
                    </label>
                    <input
                      type="number"
                      value={formData.min_quantity}
                      onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Tavsif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tavsif
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    rows={3}
                    placeholder="Mahsulot haqida qisqacha ma'lumot..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Qo'shilyapti...</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Mahsulot qo'shish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}