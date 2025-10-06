import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CategoryProvider } from './contexts/CategoryContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CategoryProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </CategoryProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;