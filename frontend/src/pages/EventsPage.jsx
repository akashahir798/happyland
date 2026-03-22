// =====================================================
// EVENTS PAGE
// Conference hall and banquet room bookings
// =====================================================

import { useState, useEffect } from 'react';
import { Users, Clock, MapPin, ArrowRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function EventsPage() {
  const [eventSpaces, setEventSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoEventSpaces = [
    {
      id: '1',
      name: 'Grand Ballroom',
      description: 'Our largest venue, perfect for weddings and gala events.',
      capacity: 500,
      hourlyRate: 25000,
      amenities: ['Stage', 'Sound System', 'Projector', 'Catering Kitchen'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Grand_Ballroom%2C_Hotel_Intercontinental.jpg/800px-Grand_Ballroom%2C_Hotel_Intercontinental.jpg'
    },
    {
      id: '2',
      name: 'Conference Room A',
      description: 'Ideal for corporate meetings and presentations.',
      capacity: 50,
      hourlyRate: 5000,
      amenities: ['TV Screen', 'Video Conferencing', 'Whiteboard'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Terrace_Hotel_Splendide_Royal_Lugano.jpg/800px-Terrace_Hotel_Splendide_Royal_Lugano.jpg'
    },
    {
      id: '3',
      name: 'Boardroom',
      description: 'Executive meeting space for intimate discussions.',
      capacity: 20,
      hourlyRate: 3000,
      amenities: ['Conference Phone', 'Smart Board', 'Refreshments'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Meeting_Room_at_the_Hotel_Le_Bristol.jpg/800px-Meeting_Room_at_the_Hotel_Le_Bristol.jpg'
    },
    {
      id: '4',
      name: 'Garden Terrace',
      description: 'Open-air venue for receptions and social gatherings.',
      capacity: 150,
      hourlyRate: 15000,
      amenities: ['Outdoor Seating', 'BBQ Area', 'Ambient Lighting'],
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Garden_Hotel_Splendide_Royal_Lugano.jpg/800px-Garden_Hotel_Splendide_Royal_Lugano.jpg'
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'events'));
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (eventsData.length > 0) {
          setEventSpaces(eventsData);
        } else {
          setEventSpaces(demoEventSpaces);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setEventSpaces(demoEventSpaces);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-sandy-50">
      {/* Header */}
      <div className="bg-ocean-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Event Spaces</h1>
          <p className="text-xl text-ocean-100 max-w-2xl mx-auto">
            Host your next conference, wedding, or special event in our versatile venues
          </p>
        </div>
      </div>

      {/* Event Spaces */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {eventSpaces.map((space) => (
            <div key={space.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={space.image}
                alt={space.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{space.name}</h3>
                <p className="text-gray-600 mb-4">{space.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Up to {space.capacity} guests
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    ₹{space.hourlyRate}/hour
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {space.amenities.map((amenity, index) => (
                    <span key={index} className="badge bg-sandy-100 text-navy-800">
                      {amenity}
                    </span>
                  ))}
                </div>

                <button className="btn-outline w-full flex items-center justify-center">
                  Request Booking
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
