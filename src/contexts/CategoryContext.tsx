import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading categories:', error);
        // Agar jadval mavjud bo'lmasa, bo'sh array qaytaramiz
        if (error.code === 'PGRST205') {
          console.log('Categories table does not exist yet. Please run the SQL script in Supabase.');
          setCategories([]);
          return;
        }
        throw error;
      }
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCategories(prev => 
        prev.map(category => 
          category.id === id ? { ...category, ...data } : category
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      // Avval kategoriyani topamiz
      const categoryToDelete = categories.find(cat => cat.id === id);
      if (!categoryToDelete) {
        throw new Error('Kategoriya topilmadi');
      }

      // O'sha kategoriyadagi barcha mahsulotlarning kategoriyasini "Kategoriyasiz" qilib qo'yamiz
      const { error: updateError } = await supabase
        .from('products')
        .update({ category: 'Kategoriyasiz' })
        .eq('category', categoryToDelete.name);

      if (updateError) {
        console.error('Error updating products category:', updateError);
        // Mahsulotlarni yangilashda xatolik bo'lsa ham kategoriyani o'chirishga davom etamiz
      }

      // Endi kategoriyani o'chiramiz
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider value={{
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      loading
    }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
