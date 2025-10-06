import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { DashboardHome } from './pages/DashboardHome';
import { ProductsPage } from './pages/ProductsPage';
import { WarehousePage } from './pages/WarehousePage';
import { SalesPage } from './pages/SalesPage';
import { CustomersPage } from './pages/CustomersPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useData } from '../contexts/DataContext';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loading } = useData();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onPageChange={setCurrentPage} />;
      case 'products':
        return <ProductsPage />;
      case 'warehouse':
        return <WarehousePage />;
      case 'sales':
        return <SalesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardHome />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}