import React from 'react';
import { UserCheck, Award, TrendingUp, Clock } from 'lucide-react';

export function EmployeesPage() {
  // Mock employee data
  const employees = [
    {
      id: '1',
      name: 'Ahmad Karimov',
      role: 'admin',
      email: 'admin@idishbozor.uz',
      phone: '+998901234567',
      sales_this_month: 45000000,
      total_sales: 250000000,
      performance: 95
    },
    {
      id: '2',
      name: 'Madina Aliyeva',
      role: 'sotuvchi',
      email: 'sotuvchi@idishbozor.uz',
      phone: '+998901234568',
      sales_this_month: 32000000,
      total_sales: 180000000,
      performance: 88
    }
  ];

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Administrator',
      sotuvchi: 'Sotuvchi',
      omborchi: 'Omborchi',
      hisobchi: 'Hisobchi'
    };
    return roles[role] || role;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xodimlar</h1>
          <p className="text-gray-600">Xodimlar faoliyati va statistikasi</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jami xodimlar</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <UserCheck className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Oylik savdo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(employees.reduce((sum, emp) => sum + emp.sales_this_month, 0))}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">O'rtacha samaradorlik</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length)}%
              </p>
            </div>
            <Award className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Faol xodimlar</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Xodimlar ro'yxati</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Xodim</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Lavozim</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Aloqa</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Oylik savdo</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Jami savdo</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">Samaradorlik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.role === 'admin' 
                        ? 'bg-red-100 text-red-800'
                        : employee.role === 'sotuvchi'
                        ? 'bg-green-100 text-green-800'
                        : employee.role === 'omborchi'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {getRoleLabel(employee.role)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-gray-600">{employee.phone}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">
                      {formatPrice(employee.sales_this_month)} so'm
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900">
                      {formatPrice(employee.total_sales)} so'm
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className={`h-2 rounded-full ${
                            employee.performance >= 90 ? 'bg-green-500' :
                            employee.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${employee.performance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {employee.performance}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}