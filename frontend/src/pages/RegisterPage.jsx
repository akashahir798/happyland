// =====================================================
// REGISTER PAGE - ENHANCED
// Modern, interactive user registration
// =====================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, CheckCircle2, Gift, Crown, Star } from 'lucide-react';
import { useAuthStore } from '../store';

function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = {
        id: '1',
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'guest'
      };

      setAuth(user, 'demo-token');
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-ocean-50 to-ocean-100/20 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-ocean-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-ocean-300/20 rounded-full blur-3xl animate-float" />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Registration Form */}
          <div className="animate-slide-up order-2 md:order-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-gold to-ocean-400 opacity-10 rounded-full -ml-20 -mt-20" />
              
              <div className="relative">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold to-yellow-600 rounded-2xl mb-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                  <p className="text-gray-600">Join Happy Land and unlock exclusive benefits</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-center animate-slide-down">
                      <div className="w-2 h-2 bg-red-600 rounded-full mr-3" />
                      {error}
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                      <div className="relative">
                        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                          focusedField === 'firstName' ? 'text-ocean-600' : 'text-gray-400'
                        }`}>
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'email' ? 'text-ocean-600' : 'text-gray-400'
                      }`}>
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (optional)</label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'phone' ? 'text-ocean-600' : 'text-gray-400'
                      }`}>
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'password' ? 'text-ocean-600' : 'text-gray-400'
                      }`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-ocean-600 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                i < strength ? strengthColors[strength - 1] : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        {strength > 0 && (
                          <p className="text-xs text-gray-600">
                            Password strength: <span className="font-medium">{strengthLabels[strength - 1]}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === 'confirmPassword' ? 'text-ocean-600' : 'text-gray-400'
                      }`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-ocean-500 focus:ring-4 focus:ring-ocean-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-ocean-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      required
                      className="w-5 h-5 text-ocean-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-ocean-500 cursor-pointer mt-0.5" 
                    />
                    <label className="ml-3 text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-ocean-600 hover:text-ocean-700 font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-ocean-600 hover:text-ocean-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-600 hover:to-gold text-gray-900 font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-ocean-600 hover:text-ocean-700 font-semibold transition-colors inline-flex items-center group"
                    >
                      Sign in
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="hidden md:block space-y-8 animate-slide-up delay-200 order-1 md:order-2">
            <div>
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg">
                <Crown className="w-5 h-5 text-gold mr-2" />
                <span className="text-gray-700 text-sm font-medium">Join Our Community</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Start Your
                <span className="block text-gold">Luxury Journey</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Create your account and enjoy exclusive member benefits, personalized experiences, and special rewards.
              </p>
            </div>

            {/* Benefits Cards */}
            <div className="space-y-4">
              {[
                {
                  icon: Gift,
                  title: 'Welcome Bonus',
                  description: 'Get 10% off your first booking as a new member',
                  color: 'bg-pink-100 text-pink-600'
                },
                {
                  icon: Star,
                  title: 'Loyalty Rewards',
                  description: 'Earn points with every stay and redeem for free nights',
                  color: 'bg-yellow-100 text-yellow-600'
                },
                {
                  icon: CheckCircle2,
                  title: 'Priority Service',
                  description: 'Fast-track check-in and dedicated customer support',
                  color: 'bg-green-100 text-green-600'
                }
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
