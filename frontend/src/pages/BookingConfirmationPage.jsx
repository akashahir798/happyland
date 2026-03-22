// =====================================================
// BOOKING CONFIRMATION PAGE
// Success page after booking is complete
// =====================================================

import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Share2 } from 'lucide-react';
import { useEffect } from 'react';

function BookingConfirmationPage() {
  // Demo booking data
  const booking = {
    id: 'demo-booking-id',
    reference: 'BK2024021300001',
    status: 'confirmed',
    room: {
      name: 'Deluxe Room',
      images: ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Interior_of_a_Room_at_Hotel_Le_Bristol.jpg/800px-Interior_of_a_Room_at_Hotel_Le_Bristol.jpg']
    },
    checkIn: 'Feb 15, 2024',
    checkOut: 'Feb 18, 2024',
    nights: 3,
    totalAmount: 717.00,
    guest: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Thank you for your booking. A confirmation email has been sent to {booking.guest.email}
          </p>
        </div>

        {/* Booking Reference */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Booking Reference</span>
            <span className="badge-success">Confirmed</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 font-mono">
            {booking.reference}
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Booking Details
          </h2>

          {/* Room */}
          <div className="flex items-center space-x-4 pb-4 border-b">
            <img
              src={booking.room.images[0]}
              alt={booking.room.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-medium text-gray-900">{booking.room.name}</h3>
              <p className="text-sm text-gray-500">Deluxe Room with City View</p>
            </div>
          </div>

          {/* Dates */}
          <div className="py-4 border-b">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Check-in</span>
                <p className="font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-ocean-500" />
                  {booking.checkIn}
                </p>
                <p className="text-sm text-gray-500">From 3:00 PM</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Check-out</span>
                <p className="font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-ocean-500" />
                  {booking.checkOut}
                </p>
                <p className="text-sm text-gray-500">By 11:00 AM</p>
              </div>
            </div>
          </div>

          {/* Guest */}
          <div className="py-4 border-b">
            <span className="text-sm text-gray-500 block mb-1">Guest</span>
            <p className="font-medium text-gray-900">{booking.guest.name}</p>
            <p className="text-gray-600">{booking.guest.email}</p>
          </div>

          {/* Payment */}
          <div className="py-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount Paid</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{booking.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Hotel Contact */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-ocean-500" />
              <span>123 Hotel Street, City Center</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="w-5 h-5 mr-3 text-ocean-500" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-ocean-500" />
              <span>reservations@happyland.com</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 btn-primary flex items-center justify-center">
            <Download className="w-5 h-5 mr-2" />
            Download Confirmation
          </button>
          <button className="flex-1 btn-secondary flex items-center justify-center">
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </button>
        </div>

        {/* Continue Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Ready to enhance your stay?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="btn-outline">
              Order In-Room Dining
            </Link>
            <Link to="/my-bookings" className="btn-secondary">
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmationPage;
