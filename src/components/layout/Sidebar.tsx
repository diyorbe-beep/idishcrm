import React from 'react';
import { 
  Home, Package, ShoppingCart, Users, UserCheck, 
  BarChart3, Settings, Store, X, Warehouse, LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Bosh sahifa', icon: Home },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'warehouse', label: 'Ombor', icon: Warehouse },
    { id: 'sales', label: 'Savdo (Kassa)', icon: ShoppingCart },
    { id: 'customers', label: 'Mijozlar', icon: Users },
    { id: 'employees', label: 'Xodimlar', icon: UserCheck },
    { id: 'reports', label: 'Hisobotlar', icon: BarChart3 },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-72 sm:w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="flex items-center space-x-2">
            <Store className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="text-lg sm:text-xl font-bold text-gray-800">Do'kon</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 sm:p-2 rounded-md hover:bg-gray-100"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-3 sm:p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs sm:text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{user?.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4">
          <ul className="space-y-1 sm:space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onPageChange(item.id);
                      onClose();
                    }}
                    className={`
                      w-full flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-left transition-colors
                      ${currentPage === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base truncate">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-3 sm:p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 sm:py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Chiqish</span>
          </button>
        </div>
      </div>
    </>
  );
}