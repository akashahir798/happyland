// =====================================================
// ADMIN DASHBOARD
// Admin panel for managing hotel operations
// =====================================================

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, DollarSign, ShoppingCart, 
  TrendingUp, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Demo dashboard data
  const stats = {
    occupancy: { available: 45, occupied: 32, reserved: 8, maintenance: 3 },
    revenue: { monthly: 125400, daily: 4180 },
    bookings: { pending: 12, confirmed: 28, checkedIn: 15 },
    orders: { pending: 8, preparing: 5, delivered: 45 }
  };

  const recentBookings = [
    { id: '1', guest: 'John Doe', room: 'Deluxe Room', checkIn: 'Feb 15', status: 'pending' },
    { id: '2', guest: 'Jane Smith', room: 'Suite', checkIn: 'Feb 16', status: 'confirmed' },
    { id: '3', guest: 'Bob Wilson', room: 'Standard', checkIn: 'Feb 17', status: 'pending' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
          <h1 className="text-xl font-bold mb-8">Admin Panel</h1>
          <nav className="space-y-2">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'bookings', name: 'Bookings', icon: Calendar },
              { id: 'rooms', name: 'Rooms', icon: CheckCircle },
              { id: 'orders', name: 'Food Orders', icon: ShoppingCart },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'revenue', name: 'Revenue', icon: DollarSign }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-ocean-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-green-500 text-sm font-medium">+12%</span>
              </div>
              <p className="text-gray-500 text-sm">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-green-500 text-sm font-medium">+8%</span>
              </div>
              <p className="text-gray-500 text-sm">Bookings</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-green-500 text-sm font-medium">+15%</span>
              </div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹125,400</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-red-500 text-sm font-medium">-3%</span>
              </div>
              <p className="text-gray-500 text-sm">Food Orders</p>
              <p className="text-2xl font-bold text-gray-900">58</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Room Occupancy */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Occupancy</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                    <span className="text-gray-600">Available</span>
                  </div>
                  <span className="font-semibold">{stats.occupancy.available} rooms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    <span className="text-gray-600">Occupied</span>
                  </div>
                  <span className="font-semibold">{stats.occupancy.occupied} rooms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                    <span className="text-gray-600">Reserved</span>
                  </div>
                  <span className="font-semibold">{stats.occupancy.reserved} rooms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                    <span className="text-gray-600">Maintenance</span>
                  </div>
                  <span className="font-semibold">{stats.occupancy.maintenance} rooms</span>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guest}</p>
                      <p className="text-sm text-gray-500">{booking.room} • {booking.checkIn}</p>
                    </div>
                    <span className={`badge ${
                      booking.status === 'pending' ? 'badge-warning' : 
                      booking.status === 'confirmed' ? 'badge-success' : 'badge-info'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
