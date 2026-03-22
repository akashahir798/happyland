// =====================================================
// PROFILE PAGE
// Guest profile management
// =====================================================

import { useState } from 'react';
import { useAuthStore } from '../store';
import { User, Mail, Phone, Calendar, Edit, Save, X } from 'lucide-react';

function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: '',
    dateOfBirth: ''
  });

  const handleSave = () => {
    setIsEditing(false);
    // API call would go here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Profile Header */}
          <div className="bg-ocean-600 p-8 text-white">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-ocean-600" />
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-ocean-100">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                className="flex items-center text-ocean-600 hover:text-ocean-700"
              >
                {isEditing ? (
                  <>
                    <X className="w-5 h-5 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5 mr-1" />
                    Edit
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="input pl-10 disabled:bg-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="input disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input pl-10 bg-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="input pl-10 disabled:bg-gray-100"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    disabled={!isEditing}
                    className="input pl-10 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="btn-primary flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Loyalty Points */}
          <div className="border-t p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Program</h3>
            <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 rounded-lg p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-ocean-100">Member since 2024</p>
                  <p className="text-3xl font-bold mt-1">1,250</p>
                  <p className="text-ocean-100">Loyalty Points</p>
                </div>
                <div className="text-right">
                  <p className="text-ocean-100">Current Tier</p>
                  <p className="text-xl font-bold mt-1">Gold Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
