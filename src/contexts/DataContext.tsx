import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// Interfaces
export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  cost_price: number; // Tannarx
  selling_price: number; // Sotiladigan narx
  discount: number;
  quantity: number;
  min_quantity: number;
  barcode: string;
  description: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  bonus_points: number;
  total_purchases: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  customer_id: string;
  user_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    discount: number;
  }>;
  total: number;
  payment_method: 'naqd' | 'karta' | 'online';
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: 'kirim' | 'chiqim' | 'qaytarish' | 'inventarizatsiya';
  quantity: number;
  reason: string;
  supplier_id: string;
  user_id: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  total_amount: number;
  status: 'kutilmoqda' | 'tasdiqlangan' | 'yetkazib_berilgan' | 'bekor_qilingan';
  order_date: string;
  delivery_date: string;
  notes: string;
  created_at: string;
}

interface DataContextType {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  purchaseOrders: PurchaseOrder[];
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'created_at'>) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => Promise<void>;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'created_at'>) => Promise<void>;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'order_date' | 'created_at'>) => Promise<void>;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Load customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (customersError) throw customersError;
      setCustomers(customersData || []);

      // Load suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (suppliersError) throw suppliersError;
      setSuppliers(suppliersData || []);

      // Load sales with items
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items (
            product_id,
            quantity,
            price,
            discount
          )
        `)
        .order('created_at', { ascending: false });
      
      if (salesError) throw salesError;
      setSales(salesData || []);

      // Load stock movements
      const { data: movementsData, error: movementsError } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (movementsError) throw movementsError;
      setStockMovements(movementsData || []);

      // Load purchase orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          purchase_order_items (
            product_id,
            quantity,
            unit_price
          )
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      setPurchaseOrders(ordersData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();
      
      if (error) throw error;
      setProducts(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setProducts(prev => prev.map(product => 
        product.id === id ? data : product
      ));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();
      
      if (error) throw error;
      setCustomers(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'created_at'>) => {
    try {
      // First create the sale
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_id: sale.customer_id,
          user_id: sale.user_id,
          total: sale.total,
          payment_method: sale.payment_method
        }])
        .select()
        .single();
      
      if (saleError) throw saleError;

      // Then create sale items
      const saleItems = sale.items.map(item => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);
      
      if (itemsError) throw itemsError;

      // Reload sales to get the complete data
      await loadData();
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();
      
      if (error) throw error;
      setSuppliers(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
  };

  const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([movement])
        .select()
        .single();
      
      if (error) throw error;
      setStockMovements(prev => [data, ...prev]);
      
      // Update product quantity
      if (movement.type === 'kirim') {
        const product = products.find(p => p.id === movement.product_id);
        if (product) {
          await updateProduct(movement.product_id, { 
            quantity: product.quantity + movement.quantity 
          });
        }
      } else if (movement.type === 'chiqim') {
        const product = products.find(p => p.id === movement.product_id);
        if (product) {
          await updateProduct(movement.product_id, { 
            quantity: product.quantity - movement.quantity 
          });
        }
      }
    } catch (error) {
      console.error('Error adding stock movement:', error);
      throw error;
    }
  };

  const addPurchaseOrder = async (order: Omit<PurchaseOrder, 'id' | 'order_date' | 'created_at'>) => {
    try {
      // First create the order
      const { data: orderData, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([{
          supplier_id: order.supplier_id,
          total_amount: order.total_amount,
          status: order.status,
          delivery_date: order.delivery_date,
          notes: order.notes
        }])
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Then create order items
      const orderItems = order.items.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;

      // Reload orders to get the complete data
      await loadData();
    } catch (error) {
      console.error('Error adding purchase order:', error);
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setPurchaseOrders(prev => prev.map(order => 
        order.id === id ? data : order
      ));
    } catch (error) {
      console.error('Error updating purchase order:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      products,
      customers,
      sales,
      suppliers,
      stockMovements,
      purchaseOrders,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      addSale,
      addSupplier,
      addStockMovement,
      addPurchaseOrder,
      updatePurchaseOrder,
      loading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}