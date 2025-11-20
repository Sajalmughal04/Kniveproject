import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // ✅ Import Redux
import { updateUser } from '../Redux/slice/authSlice'; // ✅ Import update action
import axios from 'axios';
import { User, Mail, Phone, MapPin, Edit2, Save, X, ShoppingBag, Heart, Package } from 'lucide-react';

const API_URL = "http://localhost:3000/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ Get user from Redux instead of props
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  // Load user data on component mount
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    // Set initial profile data from user
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || ''
    });
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_URL}/user/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // ✅ Update Redux state
        const updatedUser = {
          ...user,
          ...profileData
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update Redux store
        dispatch(updateUser(updatedUser));
        
        setSuccess('Profile updated successfully! ✓');
        setIsEditing(false);
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'auth/logout' });
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">My Profile</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Profile Avatar and Basic Info */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{profileData.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {profileData.email}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <Phone className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Phone</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 ml-7">{profileData.phone || 'Not provided'}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Address</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 ml-7">{profileData.address || 'Not provided'}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <User className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Bio</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 ml-7">{profileData.bio || 'No bio added yet'}</p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 cursor-not-allowed text-gray-900 dark:text-gray-300"
                  disabled
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Address</label>
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Bio</label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setError('');
                    // Reset to original data
                    setProfileData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      address: user.address || '',
                      bio: user.bio || ''
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-3 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <Package className="w-12 h-12 mx-auto mb-3 text-blue-600" />
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">0</h3>
            <p className="text-gray-600 dark:text-gray-400">Orders</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <Heart className="w-12 h-12 mx-auto mb-3 text-red-600" />
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">0</h3>
            <p className="text-gray-600 dark:text-gray-400">Favorites</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition cursor-pointer">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-green-600" />
            <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">0</h3>
            <p className="text-gray-600 dark:text-gray-400">Cart Items</p>
          </div>
        </div>

        {/* Back to Home */}
        
      </div>
    </div>
  );
};

export default ProfilePage;