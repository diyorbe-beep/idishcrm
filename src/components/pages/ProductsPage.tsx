import React, { useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertCircle, Tag, X, Image as ImageIcon } from 'lucide-react';
import { useData, Product } from '../../contexts/DataContext';
import { useCategories, Category } from '../../contexts/CategoryContext';
// import { supabase } from '../../lib/supabase';

export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);
  // const [uploadingImage, setUploadingImage] = useState(false);
  // const [previewImage, setPreviewImage] = useState<string | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);

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
    description: '',
    image_url: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

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
      description: '',
      image_url: ''
    });
    // setPreviewImage(null);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCategorySubmitting(true);
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryFormData);
      } else {
        await addCategory(categoryFormData);
      }
      resetCategoryForm();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategoriya saqlanmadi. Xatolik: ' + (error as Error).message);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `"${name}" kategoriyasini o'chirishni xohlaysizmi?\n\nDiqqat: Bu kategoriyaga bog'langan mahsulotlar ham o'chiriladi!`
    );
    
    if (!confirmDelete) return;
    
    setIsDeletingCategory(id);
    try {
      await deleteCategory(id);
      alert('Kategoriya muvaffaqiyatli o\'chirildi!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategoriya o\'chirilmadi. Xatolik: ' + (error as Error).message);
    } finally {
      setIsDeletingCategory(null);
    }
  };

  // const handleCategoryEdit = (category: Category) => {
  //   setCategoryFormData({
  //     name: category.name,
  //     description: category.description || '',
  //     color: category.color
  //   });
  //   setEditingCategory(category);
  //   setShowCategoryForm(true);
  // };

  // const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   // Rasm formatini tekshirish
  //   if (!file.type.startsWith('image/')) {
  //     alert('Faqat rasm fayllari yuklanishi mumkin!');
  //     return;
  //   }

  //   // Rasm hajmini tekshirish (5MB dan kichik)
  //   if (file.size > 5 * 1024 * 1024) {
  //     alert('Rasm hajmi 5MB dan kichik bo\'lishi kerak!');
  //     return;
  //   }

  //   try {
  //     setUploadingImage(true);
      
  //     // Preview yaratish
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       setPreviewImage(e.target?.result as string);
  //     };
  //     reader.readAsDataURL(file);

  //     // Supabase'ga yuklash
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
  //     console.log('Uploading file:', fileName);
  //     console.log('File size:', file.size);
  //     console.log('File type:', file.type);
      
  //     const { error } = await supabase.storage
  //       .from('product-images')
  //       .upload(fileName, file);

  //     if (error) {
  //       console.error('Storage error:', error);
  //       console.error('Error details:', {
  //         message: error.message
  //       });
        
  //       // Agar bucket mavjud bo'lmasa, fallback
  //       if (error.message.includes('bucket') || error.message.includes('not found')) {
  //         alert('Storage bucket topilmadi. Iltimos, Supabase Dashboard\'da "product-images" bucket\'ini yarating.');
  //         return;
  //       }
        
  //       // RLS policy xatoligi
  //       if (error.message.includes('row-level security') || error.message.includes('policy') || error.message.includes('violates') || error.message.includes('permission') || error.message.includes('already exists')) {
  //         alert('Ruxsat xatoligi. Iltimos, Supabase SQL Editor\'da quyidagi kodlarni ishlating:\n\n1. DO $$ \nDECLARE\n    r RECORD;\nBEGIN\n    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = \'storage\' AND tablename = \'objects\') LOOP\n        EXECUTE \'DROP POLICY IF EXISTS "\' || r.policyname || \'" ON storage.objects\';\n    END LOOP;\nEND $$;\n\n2. ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;\n3. ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;\n4. INSERT INTO storage.buckets (id, name, public) VALUES (\'product-images\', \'product-images\', true) ON CONFLICT (id) DO NOTHING;\n\nYoki Supabase Dashboard\'da Storage > Settings > Policies bo\'limiga o\'ting va barcha policies\'larni o\'chiring.');
  //         return;
  //       }
        
  //       throw error;
  //     }

  //     // Public URL olish
  //     const { data: { publicUrl } } = supabase.storage
  //       .from('product-images')
  //       .getPublicUrl(fileName);

  //     setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
  //   } catch (error) {
  //     console.error('Rasm yuklashda xatolik:', error);
      
  //     // Xatolik turiga qarab xabar berish
  //     if (error instanceof Error) {
  //       if (error.message.includes('bucket')) {
  //         alert('Storage bucket topilmadi. Iltimos, Supabase Dashboard\'da "product-images" bucket\'ini yarating.');
  //       } else if (error.message.includes('permission')) {
  //         alert('Rasm yuklash uchun ruxsat yo\'q. Iltimos, admin bilan bog\'laning.');
  //       } else {
  //         alert(`Rasm yuklashda xatolik: ${error.message}`);
  //       }
  //     } else {
  //       alert('Rasm yuklashda noma\'lum xatolik yuz berdi!');
  //     }
  //   } finally {
  //     setUploadingImage(false);
  //   }
  // };

  // const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   // Rasm formatini tekshirish
  //   if (!file.type.startsWith('image/')) {
  //     alert('Faqat rasm fayllari yuklanishi mumkin!');
  //     return;
  //   }

  //   // Rasm hajmini tekshirish (5MB dan kichik)
  //   if (file.size > 5 * 1024 * 1024) {
  //     alert('Rasm hajmi 5MB dan kichik bo\'lishi kerak!');
  //     return;
  //   }

  //   try {
  //     setUploadingImage(true);
      
  //     // Preview yaratish
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       setPreviewImage(e.target?.result as string);
  //     };
  //     reader.readAsDataURL(file);

  //     // Supabase'ga yuklash
  //     const fileExt = file.name.split('.').pop();
  //     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
  //     const { error } = await supabase.storage
  //       .from('product-images')
  //       .upload(fileName, file);

  //     if (error) {
  //       console.error('Storage error:', error);
  //       console.error('Error details:', {
  //         message: error.message
  //       });
        
  //       // Xatolik turiga qarab xabar berish
  //       if (error.message.includes('bucket')) {
  //         alert('Storage bucket topilmadi. Iltimos, Supabase Dashboard\'da "product-images" bucket\'ini yarating.');
  //       } else if (error.message.includes('permission')) {
  //         alert('Rasm yuklash uchun ruxsat yo\'q. Iltimos, admin bilan bog\'laning.');
  //       } else {
  //         alert(`Rasm yuklashda xatolik: ${error.message}`);
  //       }
  //       return;
  //     }

  //     // Public URL olish
  //     const { data: { publicUrl } } = supabase.storage
  //       .from('product-images')
  //       .getPublicUrl(fileName);

  //     setFormData(prev => ({ ...prev, image_url: publicUrl }));
      
  //   } catch (error) {
  //     console.error('Rasm yuklashda xatolik:', error);
  //     alert('Rasm yuklashda xatolik yuz berdi!');
  //   } finally {
  //     setUploadingImage(false);
  //   }
  // };

  // const removeImage = () => {
  //   setPreviewImage(null);
  //   setFormData(prev => ({ ...prev, image_url: '' }));
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        price: Number(formData.price),
        cost_price: Number(formData.cost_price),
        selling_price: Number(formData.selling_price),
        discount: Number(formData.discount),
        quantity: Number(formData.quantity),
        min_quantity: Number(formData.min_quantity),
        barcode: formData.barcode,
        description: formData.description,
        image_url: formData.image_url || undefined // Rasm yo'q bo'lsa undefined
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Mahsulot saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: (product as any).price?.toString() || '',
      cost_price: product.cost_price.toString(),
      selling_price: product.selling_price.toString(),
      discount: product.discount.toString(),
      quantity: product.quantity.toString(),
      min_quantity: product.min_quantity.toString(),
      barcode: product.barcode,
      description: product.description,
      image_url: product.image_url || ''
    });
    // setPreviewImage(product.image_url || null);
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mahsulotlar</h1>
          <p className="text-gray-600">Ombordagi barcha mahsulotlarni boshqaring</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
          >
            <Tag className="w-5 h-5" />
            <span>Kategoriya qo'shish</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Mahsulot qo'shish</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Kategoriya:</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sotiladigan narx:</span>
                <span className="font-bold text-green-600">
                  {formatPrice(product.selling_price)} so'm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tannarx:</span>
                <span className="font-medium text-blue-600">
                  {formatPrice(product.cost_price)} so'm
                </span>
              </div>
              {product.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Chegirma:</span>
                  <span className="font-medium text-red-600">{product.discount}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Miqdor:</span>
                <span className={`font-medium ${
                  product.quantity <= product.min_quantity ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {product.quantity} ta
                  {product.quantity <= product.min_quantity && (
                    <AlertCircle className="inline w-4 h-4 ml-1" />
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={resetForm}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mahsulot nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                  />
                </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Brend *
                       </label>
                       <input
                         type="text"
                         value={formData.brand}
                         onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                         className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                         required
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Asosiy narx (so'm) *
                       </label>
                       <input
                         type="number"
                         value={formData.price}
                         onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                         className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                         placeholder="Mahsulot asosiy narxi"
                         required
                       />
                     </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategoriya *
                  </label>
                  <div className="flex space-x-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Kategoriyani tanlang</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryForm(true)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Yangi kategoriya qo'shish"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shtrix-kod
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tannarx (so'm) *
                  </label>
                  <input
                    type="number"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                    placeholder="Mahsulot tannarxi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sotiladigan narx (so'm) *
                  </label>
                  <input
                    type="number"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                    placeholder="Mijozga sotiladigan narx"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chegirma (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miqdor *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimal miqdor *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

                     {/* Rasm yuklash - vaqtincha o'chirilgan */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Mahsulot rasmi
                       </label>
                       <div className="flex items-center space-x-2 text-sm text-gray-500">
                         <ImageIcon className="w-4 h-4" />
                         <span>Rasm yuklash funksiyasi keyinroq qo'shiladi</span>
                       </div>
                     </div>

              <div className="flex justify-end space-x-4 pt-4">
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
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isSubmitting ? 'Saqlanmoqda...' : (editingProduct ? 'Saqlash' : 'Qo\'shish')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showCategoryForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={resetCategoryForm}
        >
          <div 
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo\'shish'}
              </h2>
              <button
                onClick={resetCategoryForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoriya nomi *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    isCategorySubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isCategorySubmitting}
                  placeholder="Masalan: Telefonlar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    isCategorySubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={isCategorySubmitting}
                  placeholder="Kategoriya haqida qisqacha ma'lumot..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rang
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className={`w-12 h-10 border border-gray-300 rounded-lg ${
                      isCategorySubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                    disabled={isCategorySubmitting}
                  />
                  <div 
                    className="w-8 h-8 rounded-lg border border-gray-300"
                    style={{ backgroundColor: categoryFormData.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{categoryFormData.color}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isCategorySubmitting}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                    isCategorySubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {isCategorySubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isCategorySubmitting ? 'Saqlanmoqda...' : (editingCategory ? 'Saqlash' : 'Qo\'shish')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kategoriyalar ro'yxati */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <span>Kategoriyalar ({categories.length})</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteCategory(category.id, category.name)}
                    disabled={isDeletingCategory === category.id}
                    className={`p-1 rounded-lg transition-colors ${
                      isDeletingCategory === category.id
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'text-red-600 hover:bg-red-100'
                    }`}
                    title="Kategoriyani o'chirish"
                  >
                    {isDeletingCategory === category.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}