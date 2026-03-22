import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Maximize, Wifi, Coffee, Tv, Wind, ArrowLeft, Calendar, Star } from 'lucide-react';

function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  const room = {
    id,
    name: 'Deluxe Room',
    description: 'Spacious and elegantly designed with modern amenities. Perfect for business or leisure travelers.',
    basePrice: 5000,
    maxOccupancy: 2,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe'],
    roomSizeSqft: 400,
    images: [
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?w=800',
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?w=800',
      'https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg?w=800'
    ],
    availableCount: 8
  };

  const amenityIcons = { wifi: Wifi, coffee: Coffee, tv: Tv, airconditioning: Wind };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/rooms')}
          className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-medium mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Rooms
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-video rounded-xl overflow-hidden">
              <img
                src={room.images[selectedImage]}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 ${
                    selectedImage === idx ? 'border-ocean-600' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{room.name}</h1>
            
            <div className="flex items-center gap-6 text-gray-600 mb-6">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {room.maxOccupancy} Guests
              </span>
              <span className="flex items-center gap-2">
                <Maximize className="w-5 h-5" />
                {room.roomSizeSqft} sq ft
              </span>
            </div>

            <p className="text-gray-600 mb-6">{room.description}</p>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {room.amenities.map((amenity, idx) => {
                  const Icon = amenityIcons[amenity.toLowerCase().replace(/\s+/g, '')] || Star;
                  return (
                    <div key={idx} className="flex items-center gap-2 text-gray-700">
                      <Icon className="w-4 h-4 text-ocean-600" />
                      {amenity}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Starting from</p>
                  <p className="text-3xl font-bold text-gray-900">₹{room.basePrice}</p>
                  <p className="text-sm text-gray-500">per night</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                  {room.availableCount} Available
                </span>
              </div>

              <Link
                to="/booking"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailPage;
