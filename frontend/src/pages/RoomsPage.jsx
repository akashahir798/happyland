// =====================================================
// ROOMS PAGE - PREMIUM DESIGN
// Modern room listings with filters
// =====================================================

import { useState } from 'react';
import { Filter, Grid, List, X } from 'lucide-react';
import RoomCard from '../components/booking/RoomCard';

const demoRooms = [
  {
    id: '1',
    name: 'Standard Room',
    description: 'Comfortable and affordable room with all essential amenities.',
    basePrice: 2500,
    maxOccupancy: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Room Service'],
    roomSizeSqft: 300,
    images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?w=800'],
    availableCount: 10
  },
  {
    id: '2',
    name: 'Deluxe Room',
    description: 'Spacious and elegantly designed with modern amenities.',
    basePrice: 5000,
    maxOccupancy: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
    roomSizeSqft: 400,
    images: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?w=800'],
    availableCount: 8
  },
  {
    id: '3',
    name: 'Executive Suite',
    description: 'Luxurious suite with separate living area and premium services.',
    basePrice: 12000,
    maxOccupancy: 4,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Jacuzzi'],
    roomSizeSqft: 650,
    images: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?w=800'],
    availableCount: 3
  },
  {
    id: '4',
    name: 'Penthouse Suite',
    description: 'The ultimate luxury experience with panoramic city views.',
    basePrice: 25000,
    maxOccupancy: 6,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Pool'],
    roomSizeSqft: 1500,
    images: ['https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg?w=800'],
    availableCount: 1
  }
];

function RoomsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    priceRange: '',
    sortBy: 'price'
  });
  const [rooms] = useState(demoRooms);

  const filteredRooms = rooms
    .filter((room) => {
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (room.basePrice < min || (max && room.basePrice > max)) return false;
      }
      return true;
    })
    .sort((a, b) => a.basePrice - b.basePrice);

  return (
    <div className="min-h-screen bg-sandy-50">
      {/* Hero Header */}
      <div className="relative bg-navy-900 py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?w=1920"
            alt="Rooms"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Accommodations
          </h1>
          <p className="text-xl text-ocean-100 max-w-2xl">
            Discover our collection of luxurious rooms and suites, each crafted for your ultimate comfort.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-30 bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 transition-all duration-200"
              >
                <option value="">Any Price</option>
                <option value="0-5000">Under ₹5,000</option>
                <option value="5000-15000">₹5,000 – ₹15,000</option>
                <option value="15000-30000">₹15,000 – ₹30,000</option>
                <option value="30000-100000">₹30,000+</option>
              </select>

              {filters.priceRange && (
                <button
                  onClick={() => setFilters({ ...filters, priceRange: '' })}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
              </span>
              
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-ocean-100 text-ocean-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-ocean-100 text-ocean-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters.</p>
            <button
              onClick={() => setFilters({ priceRange: '', sortBy: 'price' })}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} nights={1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomsPage;
