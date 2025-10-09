import React, { useState, useEffect } from 'react';
import { Settings, Store, User, Bell, Shield, Database, Printer, Smartphone, Check, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Umumiy sozlamalar
  const [generalSettings, setGeneralSettings] = useState({
    language: 'uz',
    currency: 'uzs',
    darkMode: false
  });

  // Do'kon ma'lumotlari
  const [storeSettings, setStoreSettings] = useState({
    name: 'Idish Bozor',
    address: 'Toshkent, Chilonzor tumani',
    phone: '+998712001122',
    taxNumber: ''
  });

  // Profil ma'lumotlari
  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Bildirishnoma sozlamalari
  const [notificationSettings, setNotificationSettings] = useState({
    lowStock: true,
    newSale: false,
    dailyReport: true,
    smsNotifications: false
  });

  // Xavfsizlik sozlamalari
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorAuth: false
  });

  // Integratsiya sozlamalari
  const [integrationSettings, setIntegrationSettings] = useState({
    printer: false,
    barcodeScanner: true,
    telegramBot: false
  });

  // LocalStorage dan sozlamalarni yuklash
  useEffect(() => {
    const savedGeneral = localStorage.getItem('generalSettings');
    const savedStore = localStorage.getItem('storeSettings');
    const savedProfile = localStorage.getItem('profileSettings');
    const savedNotifications = localStorage.getItem('notificationSettings');
    const savedSecurity = localStorage.getItem('securitySettings');
    const savedIntegrations = localStorage.getItem('integrationSettings');

    if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral));
    if (savedStore) setStoreSettings(JSON.parse(savedStore));
    if (savedProfile) setProfileSettings(JSON.parse(savedProfile));
    if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
    if (savedSecurity) setSecuritySettings(JSON.parse(savedSecurity));
    if (savedIntegrations) setIntegrationSettings(JSON.parse(savedIntegrations));
  }, []);

  // User ma'lumotlari o'zgarganda profil sozlamalarini yangilash
  useEffect(() => {
    if (user) {
      setProfileSettings({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
    }
  }, [user]);

  // Saqlash funksiyasi
  const handleSave = async () => {
    setIsSaving(true);
    setShowError(false);
    setShowSuccess(false);

    try {
      // Profil ma'lumotlarini yangilash (agar o'zgargan bo'lsa)
      if (profileSettings.name !== user?.name || 
          profileSettings.email !== user?.email || 
          profileSettings.phone !== user?.phone) {
        
        const profileUpdateSuccess = await updateProfile({
          name: profileSettings.name,
          email: profileSettings.email,
          phone: profileSettings.phone
        });

        if (!profileUpdateSuccess) {
          setErrorMessage('Profil ma\'lumotlarini yangilashda xatolik yuz berdi');
          setShowError(true);
          setTimeout(() => setShowError(false), 5000);
          return;
        }
      }

      // Boshqa sozlamalarni LocalStorage'ga saqlash
      localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
      localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
      localStorage.setItem('profileSettings', JSON.stringify(profileSettings));
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
      localStorage.setItem('integrationSettings', JSON.stringify(integrationSettings));

      // Simulyatsiya - haqiqiy API chaqiruv
      await new Promise(resolve => setTimeout(resolve, 1000));

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Sozlamalarni saqlashda xatolik yuz berdi');
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Parol o'zgartirish
  const handlePasswordChange = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setErrorMessage('Yangi parollar mos kelmaydi');
      setShowError(true);
      return;
    }

    if (securitySettings.newPassword.length < 6) {
      setErrorMessage('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      setShowError(true);
      return;
    }

    setIsSaving(true);
    try {
      // Simulyatsiya - haqiqiy API chaqiruv
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSecuritySettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setErrorMessage('Parol o\'zgartirishda xatolik yuz berdi');
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Umumiy', icon: Settings },
    { id: 'store', label: 'Do\'kon', icon: Store },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell },
    { id: 'security', label: 'Xavfsizlik', icon: Shield },
    { id: 'integrations', label: 'Integratsiya', icon: Database }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Umumiy sozlamalar</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tizim tili
                  </label>
                  <select 
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="uz">O'zbek tili</option>
                    <option value="ru">Русский язык</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valyuta
                  </label>
                  <select 
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="uzs">O'zbek so'mi (UZS)</option>
                    <option value="usd">Dollar ($)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={generalSettings.darkMode}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="darkMode" className="ml-2 text-sm text-gray-700">
                    Qorong'u rejim
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'store':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Do'kon ma'lumotlari</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Do'kon nomi
                  </label>
                  <input
                    type="text"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manzil
                  </label>
                  <textarea
                    rows={3}
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={storeSettings.phone}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soliq raqami
                  </label>
                  <input
                    type="text"
                    value={storeSettings.taxNumber}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, taxNumber: e.target.value }))}
                    placeholder="12345678901"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shaxsiy ma'lumotlar</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ism-familiya
                  </label>
                  <input
                    type="text"
                    value={profileSettings.name}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lavozim
                  </label>
                  <input
                    type="text"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                    disabled
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirishnoma sozlamalari</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kam qolgan mahsulotlar</p>
                    <p className="text-sm text-gray-500">Mahsulot tugab qolganda bildirishnoma</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.lowStock}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStock: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Yangi savdo</p>
                    <p className="text-sm text-gray-500">Har bir yangi savdo uchun</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.newSale}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, newSale: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kunlik hisobot</p>
                    <p className="text-sm text-gray-500">Har kuni soat 18:00 da</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.dailyReport}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, dailyReport: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">SMS xabarnomalar</p>
                    <p className="text-sm text-gray-500">Telefon raqamiga SMS yuborish</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xavfsizlik sozlamalari</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Joriy parol
                  </label>
                  <input
                    type="password"
                    value={securitySettings.currentPassword}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yangi parol
                  </label>
                  <input
                    type="password"
                    value={securitySettings.newPassword}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parolni tasdiqlash
                  </label>
                  <input
                    type="password"
                    value={securitySettings.confirmPassword}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button 
                  onClick={handlePasswordChange}
                  disabled={isSaving || !securitySettings.currentPassword || !securitySettings.newPassword || !securitySettings.confirmPassword}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
                </button>

                <hr className="my-6" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ikki bosqichli autentifikatsiya</p>
                    <p className="text-sm text-gray-500">Qo'shimcha xavfsizlik uchun</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integratsiya sozlamalari</h3>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Printer className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Chek printeri</h4>
                        <p className="text-sm text-gray-500">Savdo chekini chop etish</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      integrationSettings.printer 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {integrationSettings.printer ? 'Faol' : 'Ulanmagan'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIntegrationSettings(prev => ({ ...prev, printer: !prev.printer }))}
                    className="text-blue-600 text-sm hover:text-blue-700"
                  >
                    {integrationSettings.printer ? 'O\'chirish' : 'Printerni sozlash'} →
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Database className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Shtrix-kod skaneri</h4>
                        <p className="text-sm text-gray-500">Mahsulotlarni tez qidirish</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      integrationSettings.barcodeScanner 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {integrationSettings.barcodeScanner ? 'Faol' : 'O\'chirilgan'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIntegrationSettings(prev => ({ ...prev, barcodeScanner: !prev.barcodeScanner }))}
                    className="text-blue-600 text-sm hover:text-blue-700"
                  >
                    {integrationSettings.barcodeScanner ? 'O\'chirish' : 'Sozlamalarni o\'zgartirish'} →
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Smartphone className="w-6 h-6 text-blue-400 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Telegram Bot</h4>
                        <p className="text-sm text-gray-500">Hisobotlarni Telegram orqali olish</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      integrationSettings.telegramBot 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {integrationSettings.telegramBot ? 'Faol' : 'Sozlanmagan'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIntegrationSettings(prev => ({ ...prev, telegramBot: !prev.telegramBot }))}
                    className="text-blue-600 text-sm hover:text-blue-700"
                  >
                    {integrationSettings.telegramBot ? 'O\'chirish' : 'Botni sozlash'} →
                  </button>
                </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
        <p className="text-gray-600">Tizim va do'kon sozlamalarini boshqaring</p>
      </div>

      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Sozlamalar muvaffaqiyatli saqlandi!</p>
        </div>
      )}

      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

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

      <div className="flex justify-end space-x-4">
        <button 
          onClick={() => {
            // Reset all settings to default
            setGeneralSettings({
              language: 'uz',
              currency: 'uzs',
              darkMode: false
            });
            setStoreSettings({
              name: 'Idish Bozor',
              address: 'Toshkent, Chilonzor tumani',
              phone: '+998712001122',
              taxNumber: ''
            });
            setProfileSettings({
              name: user?.name || '',
              email: user?.email || '',
              phone: user?.phone || ''
            });
            setNotificationSettings({
              lowStock: true,
              newSale: false,
              dailyReport: true,
              smsNotifications: false
            });
            setSecuritySettings({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
              twoFactorAuth: false
            });
            setIntegrationSettings({
              printer: false,
              barcodeScanner: true,
              telegramBot: false
            });
            setShowError(false);
            setShowSuccess(false);
          }}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Bekor qilish
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}</span>
        </button>
      </div>
    </div>
  );
}