import React, { useState, useEffect, useRef } from 'react';
import { Package, Plus, Search, Edit, Trash2, AlertCircle, Tag, X, Image as ImageIcon } from 'lucide-react';
import { useData, Product } from '../../contexts/DataContext';
import { useCategories, Category } from '../../contexts/CategoryContext';
// import { supabase } from '../../lib/supabase';

export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState<string | null>(null);
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false);
  const [editingCategoryData, setEditingCategoryData] = useState<Category | null>(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [usedProductNames, setUsedProductNames] = useState<Set<string>>(new Set());
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
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

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(searchLower);
    const matchesCategory = product.category.toLowerCase().includes(searchLower);
    const matchesBrand = product.brand.toLowerCase().includes(searchLower);
    const matchesBarcode = product.barcode.includes(searchTerm);
    
    const matchesSearch = matchesName || matchesCategory || matchesBrand || matchesBarcode;
    
    // Kategoriya filteri
    const matchesCategoryFilter = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategoryFilter;
  });

  // Mahsulot nomlarini yig'ish
  useEffect(() => {
    const names = new Set(products.map(product => product.name.toLowerCase()));
    setUsedProductNames(names);
  }, [products]);

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
      description: '',
      image_url: ''
    });
    // setPreviewImage(null);
    setShowAddForm(false);
    setEditingProduct(null);
    setShowNameSuggestions(false);
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
      `"${name}" kategoriyasini o'chirishni xohlaysizmi?\n\n` +
      `Diqqat: Bu kategoriyadagi barcha mahsulotlar "Kategoriyasiz" kategoriyasiga o'tkaziladi va mahsulotlar o'chmaydi.`
    );
    
    if (!confirmDelete) return;
    
    setIsDeletingCategory(id);
    try {
      await deleteCategory(id);
      alert(`Kategoriya muvaffaqiyatli o'chirildi!\n\n"${name}" kategoriyasidagi barcha mahsulotlar "Kategoriyasiz" kategoriyasiga o'tkazildi.`);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategoriya o\'chirilmadi. Xatolik: ' + (error as Error).message);
    } finally {
      setIsDeletingCategory(null);
    }
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategoryData(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setShowCategoryEditModal(true);
  };

  const handleCategoryUpdate = async (updateProducts: boolean = false) => {
    if (!editingCategoryData) return;
    
    setIsCategorySubmitting(true);
    try {
      // Kategoriyani yangilash
      await updateCategory(editingCategoryData.id, categoryFormData);
      
      // Agar mahsulotlarni ham yangilash kerak bo'lsa
      if (updateProducts && categoryFormData.name !== editingCategoryData.name) {
        // Bu kategoriyaga tegishli mahsulotlarni topish
        const productsInCategory = products.filter(p => p.category === editingCategoryData.name);
        
        // Har bir mahsulotni yangilash
        for (const product of productsInCategory) {
          await updateProduct(product.id, {
            ...product,
            category: categoryFormData.name
          });
        }
      }
      
      setShowCategoryEditModal(false);
      setEditingCategoryData(null);
      resetCategoryForm();
      alert('Kategoriya muvaffaqiyatli yangilandi!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Kategoriya yangilanmadi. Xatolik: ' + (error as Error).message);
    } finally {
      setIsCategorySubmitting(false);
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
    setShowNameSuggestions(false); // Tahrirlashda takliflarni yashirish
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
            onClick={() => setShowCategoriesModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-colors"
          >
            <Tag className="w-5 h-5" />
            <span>Kategoriyalar</span>
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

      {/* Categories Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="w-5 h-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Kategoriyalar</h3>
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Barchasi ({products.length})
          </button>
          {categories.map((category) => {
            const categoryProductCount = products.filter(p => p.category === category.name).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{ backgroundColor: selectedCategory === category.name ? category.color : undefined }}
              >
                {category.name} ({categoryProductCount})
              </button>
            );
          })}
        </div>
      </div>

      {/* Qidiruv natijalari */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-800 text-sm">
            {searchTerm && (
              <>
                <strong>"{searchTerm}"</strong> bo'yicha qidiruv natijasi
                {selectedCategory !== 'all' && ' va '}
              </>
            )}
            {selectedCategory !== 'all' && (
              <>
                <strong>"{selectedCategory}"</strong> kategoriyasi
              </>
            )}
            : <span className="ml-1 font-semibold">{filteredProducts.length} ta mahsulot topildi</span>
          </p>
        </div>
      )}


      {/* Products Grid */}
      {filteredProducts.length === 0 && (searchTerm || selectedCategory !== 'all') ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hech narsa topilmadi</h3>
          <p className="text-gray-500">
            {searchTerm && (
              <>
                <strong>"{searchTerm}"</strong> bo'yicha
                {selectedCategory !== 'all' && ' va '}
              </>
            )}
            {selectedCategory !== 'all' && (
              <>
                <strong>"{selectedCategory}"</strong> kategoriyasida
              </>
            )}
            {' '}hech qanday mahsulot topilmadi.
            <br />
            Boshqa kalit so'zlar yoki kategoriya bilan qayta urinib ko'ring.
          </p>
        </div>
      ) : (
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
      )}

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
                  {formData.name && usedProductNames.has(formData.name.toLowerCase()) && !editingProduct && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm text-yellow-700">
                          Bu nom allaqachon ishlatilgan! Boshqa nom tanlang yoki mavjud mahsulotni tahrirlang.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Tahrirlashda takroriy nom xatoligi */}
                  {formData.name && usedProductNames.has(formData.name.toLowerCase()) && editingProduct && editingProduct.name.toLowerCase() !== formData.name.toLowerCase() && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-sm text-red-700">
                          Bu nom boshqa mahsulotda ishlatilgan! Boshqa nom tanlang.
                        </span>
                      </div>
                    </div>
                  )}
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
                         readOnly
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-700"
                         placeholder="Miqdor × Tannarx = Asosiy narx"
                       />
                       <p className="text-xs text-gray-500 mt-1">
                         💡 Avtomatik hisoblanadi: Miqdor × Tannarx
                       </p>
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
                    placeholder="Bitta mahsulot tannarxi"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💰 Bitta mahsulot uchun tannarx
                  </p>
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
                    placeholder="Mahsulot miqdori"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    📦 Mahsulot soni (ta)
                  </p>
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


      {/* Kategoriya Tahrirlash Modal */}
      {showCategoryEditModal && editingCategoryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <span>Kategoriyani tahrirlash</span>
                </h2>
                <button
                  onClick={() => setShowCategoryEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoriya nomi *
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.name}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isCategorySubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={isCategorySubmitting}
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
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isCategorySubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      disabled={isCategorySubmitting}
                    />
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

                  {/* Mahsulotlarni yangilash haqida ogohlantirish */}
                  {categoryFormData.name !== editingCategoryData.name && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Diqqat!</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Kategoriya nomini o'zgartirsangiz, bu kategoriyaga tegishli barcha mahsulotlarning kategoriyasi ham yangilanadi.
                            <br />
                            <strong>Bu kategoriyada {products.filter(p => p.category === editingCategoryData.name).length} ta mahsulot mavjud.</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCategoryEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={isCategorySubmitting}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryUpdate(false)}
                    disabled={isCategorySubmitting}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      isCategorySubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {isCategorySubmitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{isCategorySubmitting ? 'Saqlanmoqda...' : 'Kategoriyani saqlash'}</span>
                  </button>
                  {categoryFormData.name !== editingCategoryData.name && (
                    <button
                      type="button"
                      onClick={() => handleCategoryUpdate(true)}
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
                      <span>{isCategorySubmitting ? 'Saqlanmoqda...' : 'Kategoriya va mahsulotlarni yangilash'}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Kategoriyalar Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Tag className="w-6 h-6 text-purple-600" />
                  <span>Kategoriyalar ({categories.length})</span>
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kategoriya qo'shish</span>
                  </button>
                  <button
                    onClick={() => setShowCategoriesModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kategoriyalar yo'q</h3>
                  <p className="text-gray-500 mb-4">Birinchi kategoriyani qo'shing</p>
                  <button
                    onClick={() => setShowCategoryForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Kategoriya qo'shish</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-gray-900 text-sm break-words">{category.name}</h3>
                              {category.description && (
                                <p className="text-xs text-gray-500 break-words mt-1">{category.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleCategoryEdit(category)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Kategoriyani tahrirlash"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={isDeletingCategory === category.id}
                            className={`p-2 rounded-lg transition-colors ${
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}