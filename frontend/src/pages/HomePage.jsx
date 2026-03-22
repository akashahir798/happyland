// =====================================================
// HOME PAGE - PREMIUM LAYOUT
// Zero overlap, proper grid system, elevated cards
// =====================================================

import { Link, useNavigate } from 'react-router-dom';
import { 
  Star, Award, ArrowRight, Calendar, Users, 
  Building2, UtensilsCrossed, Sparkles, MessageCircle
} from 'lucide-react';
import RoomCard from '../components/booking/RoomCard';

function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: 'Luxury Accommodations',
      description: 'World-class rooms with premium amenities'
    },
    {
      icon: UtensilsCrossed,
      title: 'Exquisite Dining',
      description: 'Award-winning restaurants and in-room service'
    },
    {
      icon: Sparkles,
      title: 'Wellness & Spa',
      description: 'Rejuvenate your senses at our spa'
    }
  ];

  const featuredRooms = [
    {
      id: '1',
      name: 'Deluxe Room', description: 'Spacious and elegantly designed with modern amenities.', basePrice: 5000, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'], images: ['https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?w=800'],
      availableCount: 8
    },
    {
      id: '2',
      name: 'Executive Suite', description: 'Luxurious suite with separate living area and premium services.', basePrice: 12000, maxOccupancy: 4, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Jacuzzi'], images: ['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?w=800'],
      availableCount: 3
    },
    {
      id: '3',
      name: 'Penthouse Suite', description: 'The ultimate luxury experience with panoramic city views.', basePrice: 25000, maxOccupancy: 6, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Pool'], images: ['https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg?w=800'],
      availableCount: 1
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Business Traveler',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/100px-User_font_awesome.svg.png',
      rating: 5,
      text: 'Exceptional service and stunning views. The executive suite exceeded all expectations.'
    },
    {
      name: 'Michael Chen',
      role: 'Family Vacation',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/100px-User_font_awesome.svg.png',
      rating: 5,
      text: 'Perfect family getaway. The staff made our stay absolutely memorable.'
    },
    {
      name: 'Emma Wilson',
      role: 'Honeymoon',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/100px-User_font_awesome.svg.png',
      rating: 5,
      text: 'Romantic paradise! The Penthouse Suite was absolutely stunning.'
    }
  ];

  return (
    <div className="min-h-screen bg-sandy-50">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?w=1920"
            alt="Hotel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Award className="w-5 h-5 text-gold mr-2" />
              <span className="text-white/90 text-sm font-medium">Award-Winning Luxury Hotel</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Experience
              <span className="block text-gold mt-2">Pure Luxury</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Welcome to Happy Land Hotel, where every moment is crafted for perfection. 
              Discover a world of comfort, elegance, and unmatched hospitality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/rooms"
                className="inline-flex items-center justify-center px-8 py-4 bg-gold hover:bg-yellow-600 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
              >
                <span>Book Your Stay</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/events"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 active:scale-95"
              >
                <Calendar className="w-5 h-5 mr-2" />
                <span>Explore Events</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { value: '4.9', label: 'Guest Rating' },
                { value: '15K+', label: 'Happy Guests' },
                { value: '50+', label: 'Luxury Rooms' },
                { value: '24/7', label: 'Concierge' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Booking Bar */}
      <div className="relative z-20 -mt-16 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guests</label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-auto"
              >
                <span>Search</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Why Choose Us</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Experience Unmatched Luxury
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From world-class amenities to personalized service, we ensure every moment of your stay is extraordinary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-ocean-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-ocean-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-16 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <span className="text-gold font-semibold text-sm uppercase tracking-wider">Accommodations</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
                Our Featured Rooms
              </h2>
              <p className="text-gray-600 max-w-xl">
                Choose from our collection of luxurious rooms, each designed for your ultimate comfort.
              </p>
            </div>
            <Link
              to="/rooms"
              className="hidden md:inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 font-semibold mt-4 md:mt-0"
            >
              <span>View All Rooms</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map((room) => (
              <RoomCard key={room.id} room={room} nights={1} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link 
              to="/rooms" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white font-semibold rounded-xl hover:bg-ocean-700 active:scale-95 transition-all duration-200 shadow-md"
            >
              View All Rooms
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-gold fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-900 mb-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready for an Unforgettable Stay?
          </h2>
          <p className="text-xl text-ocean-100 mb-8 max-w-2xl mx-auto">
            Book now and experience the Happy Land difference. 
            Exclusive packages and special offers await you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Calendar className="w-5 h-5" />
              Book Now
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 hover:bg-white/10 text-white font-semibold rounded-xl transition-all duration-300 active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
