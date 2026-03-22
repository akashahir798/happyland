// =====================================================
// ROOM CARD - PREMIUM ELEVATED DESIGN
// Zero overlap, modern card with proper spacing
// =====================================================

import { Link } from 'react-router-dom';
import { Users, Maximize, Wifi, Coffee, Tv, Wind, ArrowRight } from 'lucide-react';

function RoomCard({ room, nights = 1 }) {
  const {
    id,
    name,
    description,
    basePrice,
    maxOccupancy,
    roomSizeSqft,
    amenities = [],
    images = [],
    availableCount
  } = room;

  const displayImage = images[0] || 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?w=800';
  const displayAmenities = amenities.slice(0, 4);
  const totalPrice = basePrice * nights;

  const amenityIcons = {
    wifi: Wifi,
    coffee: Coffee,
    tv: Tv,
    airconditioning: Wind
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image Section - Fixed Aspect Ratio */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={displayImage}
          alt={name}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
        />
        
        {/* Availability Badge */}
        {availableCount !== undefined && (
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              availableCount > 5 ? 'bg-green-100 text-green-800' : 
              availableCount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {availableCount > 0 ? `${availableCount} Available` : 'Sold Out'}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Room Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {name}
        </h3>

        {/* Room Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {maxOccupancy} Guests
          </span>
          {roomSizeSqft && (
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4" />
              {roomSizeSqft} sq ft
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {description}
        </p>

        {/* Amenities */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {displayAmenities.map((amenity, index) => {
              const Icon = amenityIcons[amenity.toLowerCase().replace(/\s+/g, '')] || Wifi;
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-sandy-100 rounded-lg text-xs text-navy-800"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {amenity}
                </span>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              {nights > 1 ? `${nights} nights` : 'Per night'}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{totalPrice}
              </span>
              {nights > 1 && (
                <span className="text-sm text-gray-500">
                  (₹{basePrice}/night)
                </span>
              )}
            </div>
          </div>

          <Link
            to={`/rooms/${id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            View
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
