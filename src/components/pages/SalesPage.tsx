import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, Minus, X, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export function SalesPage() {
  const { products, customers, addSale } = useData();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'naqd' | 'karta' | 'online'>('naqd');
  const [showPayment, setShowPayment] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savdo (Kassa)</h1>
          <p className="text-gray-600">Mahsulotlarni tanlang va savdo qiling</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Mahsulot nomi qidiring yoki shtrix-kod skanerlang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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

    </div>
  );
}