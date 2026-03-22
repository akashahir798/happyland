// =====================================================
// ROOM SEARCH FORM COMPONENT
// Date picker and guest selection for room search
// =====================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isBefore, isToday } from 'date-fns';
import { Calendar, Users, Search, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useBookingStore } from '../../store';

function RoomSearchForm({ compact = false }) {
  const navigate = useNavigate();
  const { setSearchCriteria } = useBookingStore();

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Set minimum dates
  const minDate = isToday(new Date()) ? new Date() : addDays(new Date(), 1);
  const minCheckOut = checkIn ? addDays(checkIn, 1) : addDays(minDate, 1);

  // Handle check-in change
  const handleCheckInChange = (date) => {
    setCheckIn(date);
    // If check-out is before or same as new check-in, reset it
    if (checkOut && isBefore(checkOut, addDays(date, 1))) {
      setCheckOut(addDays(date, 1));
    }
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      return;
    }

    // Store search criteria
    setSearchCriteria({
      checkIn: format(checkIn, 'yyyy-MM-dd'),
      checkOut: format(checkOut, 'yyyy-MM-dd'),
      guests
    });

    // Navigate to rooms page with query params
    navigate(`/rooms?checkIn=${format(checkIn, 'yyyy-MM-dd')}&checkOut=${format(checkOut, 'yyyy-MM-dd')}&guests=${guests}`);
  };

  // Guest options
  const guestOptions = [1, 2, 3, 4, 5, 6];

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end justify-center">
        {/* Check-in Date */}
        <div className="relative">
          <DatePicker
            selected={checkIn}
            onChange={handleCheckInChange}
            minDate={minDate}
            placeholderText="Check-in"
            className="input pl-10 w-40"
            dateFormat="MMM dd, yyyy"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Check-out Date */}
        <div className="relative">
          <DatePicker
            selected={checkOut}
            onChange={setCheckOut}
            minDate={minCheckOut}
            placeholderText="Check-out"
            className="input pl-10 w-40"
            dateFormat="MMM dd, yyyy"
          />
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        {/* Guests */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGuestDropdown(!showGuestDropdown)}
            className="input pl-10 pr-10 w-32 flex items-center"
          >
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <span>{guests} Guest{guests > 1 ? 's' : ''}</span>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </button>
          
          {showGuestDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 z-10 w-32">
              {guestOptions.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setGuests(num);
                    setShowGuestDropdown(false);
                  }}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                    guests === num ? 'text-ocean-600 font-medium' : ''
                  }`}
                >
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button type="submit" className="btn-primary flex items-center">
          <Search className="w-4 h-4 mr-2" />
          Search
        </button>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Find Your Perfect Room
      </h2>
      
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Date Selection Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date
            </label>
            <div className="relative">
              <DatePicker
                selected={checkIn}
                onChange={handleCheckInChange}
                minDate={minDate}
                placeholderText="Select check-in date"
                className="input pl-12"
                dateFormat="EEEE, MMMM d, yyyy"
              />
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ocean-500" />
            </div>
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date
            </label>
            <div className="relative">
              <DatePicker
                selected={checkOut}
                onChange={setCheckOut}
                minDate={minCheckOut}
                placeholderText="Select check-out date"
                className="input pl-12"
                dateFormat="EEEE, MMMM d, yyyy"
              />
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ocean-500" />
            </div>
          </div>
        </div>

        {/* Guests and Rooms Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </label>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="input pl-12 appearance-none"
              >
                {guestOptions.map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ocean-500" />
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Room Type Filter (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Type
            </label>
            <select className="input">
              <option value="">All Room Types</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!checkIn || !checkOut}
              className="w-full btn-primary py-3 flex items-center justify-center text-lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Search Rooms
            </button>
          </div>
        </div>

        {/* Date Info */}
        {checkIn && checkOut && (
          <div className="bg-ocean-50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center text-ocean-700">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="text-ocean-600 font-semibold">
              {Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))} Nights
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default RoomSearchForm;
