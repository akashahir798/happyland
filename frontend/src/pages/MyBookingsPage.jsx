// =====================================================
// MY BOOKINGS PAGE
// Guest booking history
// =====================================================

import { Calendar, MapPin, Users, Eye, X } from 'lucide-react';
import { useState } from 'react';

function MyBookingsPage() {
  const [filter, setFilter] = useState('all');

  // Demo bookings
  const bookings = [
    {
      id: '1',
      reference: 'BK2024021000001',
      room: { name: 'Deluxe Room', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Interior_of_a_Room_at_Hotel_Le_Bristol.jpg/400px-Interior_of_a_Room_at_Hotel_Le_Bristol.jpg' },
      checkIn: 'Feb 15, 2024',
      checkOut: 'Feb 18, 2024',
      totalAmount: 717.00,
      status: 'upcoming'
    },
    {
      id: '2',
      reference: 'BK2024010500002',
      room: { name: 'Executive Suite', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Interior_of_a_Room_at_Hotel_Le_Bristol.jpg/400px-Interior_of_a_Room_at_Hotel_Le_Bristol.jpg' },
      checkIn: 'Jan 5, 2024',
      checkOut: 'Jan 8, 2024',
      totalAmount: 1254.00,
      status: 'completed'
    }
  ];

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    const styles = {
      upcoming: 'badge-success',
      completed: 'badge-info',
      cancelled: 'badge-danger'
    };
    return styles[status] || 'badge-info';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {/* Filters */}
        <div className="flex space-x-2 mb-6">
          {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize ${
                filter === f
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <img
                  src={booking.room.image}
                  alt={booking.room.name}
                  className="w-full md:w-48 h-48 md:h-auto object-cover"
                />
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-500">{booking.reference}</span>
                      <h3 className="text-xl font-bold text-gray-900">{booking.room.name}</h3>
                    </div>
                    <span className={`badge ${getStatusBadge(booking.status)} capitalize`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-ocean-500" />
                      <div>
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="font-medium">{booking.checkIn}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-ocean-500" />
                      <div>
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="font-medium">{booking.checkOut}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-2 text-ocean-500" />
                      <div>
                        <p className="text-xs text-gray-500">Guests</p>
                        <p className="font-medium">2 Adults</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-gray-600">
                      Total: <span className="font-bold text-gray-900">₹{booking.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="btn-secondary flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      {booking.status === 'upcoming' && (
                        <button className="btn-outline text-red-600 border-red-600 hover:bg-red-50 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyBookingsPage;
