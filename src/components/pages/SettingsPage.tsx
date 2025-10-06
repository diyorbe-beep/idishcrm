import React, { useState } from 'react';
import { Settings, Store, User, Bell, Shield, Database, Printer, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

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
                  <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="uz">O'zbek tili</option>
                    <option value="ru">Русский язык</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valyuta
                  </label>
                  <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="uzs">O'zbek so'mi (UZS)</option>
                    <option value="usd">Dollar ($)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="darkMode"
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
                    defaultValue="Idish Bozor"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manzil
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Toshkent, Chilonzor tumani"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    defaultValue="+998712001122"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soliq raqami
                  </label>
                  <input
                    type="text"
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
                    defaultValue={user?.name}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    defaultValue={user?.phone}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lavozim
                  </label>
                  <input
                    type="text"
                    value={user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
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
                    defaultChecked
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
                    defaultChecked
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
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yangi parol
                  </label>
                  <input
                    type="password"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parolni tasdiqlash
                  </label>
                  <input
                    type="password"
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Parolni o'zgartirish
                </button>

                <hr className="my-6" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ikki bosqichli autentifikatsiya</p>
                    <p className="text-sm text-gray-500">Qo'shimcha xavfsizlik uchun</p>
                  </div>
                  <input
                    type="checkbox"
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
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Ulanmagan
                    </span>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Printerni sozlash →
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
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Faol
                    </span>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Sozlamalarni o'zgartirish →
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
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Sozlanmagan
                    </span>
                  </div>
                  <button className="text-blue-600 text-sm hover:text-blue-700">
                    Botni sozlash →
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
        <button className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
          Bekor qilish
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          O'zgarishlarni saqlash
        </button>
      </div>
    </div>
  );
}