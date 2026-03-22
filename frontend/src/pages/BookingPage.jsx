// =====================================================
// BOOKING PAGE
// Multi-step room booking flow — FIXED
// =====================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, differenceInCalendarDays } from 'date-fns';
import { Calendar, Users, ChevronRight, ChevronLeft, Check, CreditCard, Shield } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const selectedRoom = {
  id: '2',
  name: 'Deluxe Room',
  basePrice: 5000,
  maxOccupancy: 2,
  amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
  image: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?w=400'
};

function BookingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    checkInDate: null,
    checkOutDate: null,
    numberOfGuests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'credit_card'
  });

  const steps = [
    { id: 1, name: 'Dates & Guests', icon: Calendar },
    { id: 2, name: 'Guest Details', icon: Users },
    { id: 3, name: 'Confirmation', icon: CreditCard }
  ];

  // Calculate nights from local state (the fix!)
  const nights = formData.checkInDate && formData.checkOutDate
    ? Math.max(0, differenceInCalendarDays(formData.checkOutDate, formData.checkInDate))
    : 0;

  const subtotal = selectedRoom.basePrice * nights;
  const taxes = subtotal * 0.12;
  const total = subtotal + taxes;

  const handleCheckInChange = (date) => {
    const newFormData = { ...formData, checkInDate: date };
    // Auto-reset check-out if it's before the new check-in
    if (formData.checkOutDate && date >= formData.checkOutDate) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      newFormData.checkOutDate = nextDay;
    }
    setFormData(newFormData);
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/booking/confirmation/demo-booking-id');
    } catch (err) {
      setError('Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.checkInDate && formData.checkOutDate && nights > 0 && formData.numberOfGuests > 0;
    }
    if (currentStep === 2) {
      return formData.firstName && formData.lastName && formData.email;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">
            You're booking: <span className="font-semibold">{selectedRoom.name}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Progress Steps */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.id ? 'bg-ocean-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded ${
                        currentStep > step.id ? 'bg-ocean-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Step 1: Dates & Guests */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Select Dates & Number of Guests</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Date</label>
                      <DatePicker
                        selected={formData.checkInDate}
                        onChange={handleCheckInChange}
                        minDate={new Date()}
                        selectsStart
                        startDate={formData.checkInDate}
                        endDate={formData.checkOutDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select check-in date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Date</label>
                      <DatePicker
                        selected={formData.checkOutDate}
                        onChange={(date) => setFormData({ ...formData, checkOutDate: date })}
                        minDate={formData.checkInDate
                          ? new Date(formData.checkInDate.getTime() + 86400000)
                          : new Date(Date.now() + 86400000)
                        }
                        selectsEnd
                        startDate={formData.checkInDate}
                        endDate={formData.checkOutDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                        dateFormat="dd MMM yyyy"
                        placeholderText="Select check-out date"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <select
                      value={formData.numberOfGuests}
                      onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 w-40"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num} disabled={num > selectedRoom.maxOccupancy}>
                          {num} Guest{num > 1 ? 's' : ''} {num > selectedRoom.maxOccupancy ? '(Exceeds capacity)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.checkInDate && formData.checkOutDate && nights > 0 && (
                    <div className="bg-ocean-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-ocean-700">
                          <Calendar className="w-5 h-5 mr-2" />
                          <span>
                            {format(formData.checkInDate, 'dd MMM')} – {format(formData.checkOutDate, 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="text-ocean-600 font-semibold">
                          {nights} Night{nights !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Guest Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Guest Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                        placeholder="Rahul"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                        placeholder="Sharma"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                        placeholder="rahul@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500"
                      rows={4}
                      placeholder="Any special requests or preferences?"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Confirm & Pay</h2>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room</span>
                      <span className="font-medium">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">
                        {formData.checkInDate && format(formData.checkInDate, 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">
                        {formData.checkOutDate && format(formData.checkOutDate, 'dd MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{nights} Night{nights !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests</span>
                      <span className="font-medium">{formData.numberOfGuests}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Guest Details</h3>
                    <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
                    <p className="text-gray-600">{formData.email}</p>
                    {formData.phone && <p className="text-gray-600">{formData.phone}</p>}
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={formData.paymentMethod === 'credit_card'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="mr-3"
                        />
                        <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                        <span>Credit / Debit Card</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="mr-3"
                        />
                        <span>UPI / Net Banking</span>
                      </label>
                      <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pay_at_hotel"
                          checked={formData.paymentMethod === 'pay_at_hotel'}
                          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                          className="mr-3"
                        />
                        <span>Pay at Hotel</span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="inline-flex items-center px-5 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </button>

                {currentStep < steps.length ? (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="inline-flex items-center px-6 py-3 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 disabled:opacity-40 transition-all shadow-md"
                  >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

              {/* Room Info */}
              <div className="flex space-x-4 mb-6">
                <img
                  src={selectedRoom.image}
                  alt={selectedRoom.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{selectedRoom.name}</h4>
                  <p className="text-sm text-gray-500">Up to {selectedRoom.maxOccupancy} guests</p>
                  <p className="text-sm font-semibold text-ocean-600 mt-1">₹{selectedRoom.basePrice.toLocaleString('en-IN')}/night</p>
                </div>
              </div>

              {/* Stay Summary */}
              {nights > 0 && (
                <div className="bg-ocean-50 rounded-lg p-3 mb-4 text-sm">
                  <div className="flex justify-between text-ocean-700 font-medium">
                    <span>{nights} Night{nights !== 1 ? 's' : ''}</span>
                    <span>
                      {formData.checkInDate && format(formData.checkInDate, 'dd MMM')} –{' '}
                      {formData.checkOutDate && format(formData.checkOutDate, 'dd MMM')}
                    </span>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ₹{selectedRoom.basePrice.toLocaleString('en-IN')} × {nights} night{nights !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees (12%)</span>
                  <span className="text-gray-900">₹{taxes.toFixed(0)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-ocean-700">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  <span>Free cancellation until 24 hours before check-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
