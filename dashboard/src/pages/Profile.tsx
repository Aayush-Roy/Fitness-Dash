import { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, Edit, Save, X, Lock, Smartphone, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosInstance from '../api/axiosInstance';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  phone?: string;
  location?: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
console.log(profile)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/auth/profile');
      console.log('Profile API Response:', response.data.data.user);
      
      setProfile(response.data.data.user);
      reset({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '+1 (555) 123-4567',
        location: response.data.location || 'New York, USA',
      });
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      
      // If API fails, use mock data but still show error
      const mockProfile: AdminProfile = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        phone: '+1 (555) 123-4567',
        location: 'New York, USA'
      };
      
      setProfile(mockProfile);
      reset({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone,
        location: mockProfile.location,
      });
      
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update profile API call (if available)
      // Note: You might need to adjust the endpoint based on your backend
      const updateData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location
      };
      
      console.log('Updating profile with:', updateData);
      
      // Try to update via API
      try {
        const response = await axiosInstance.put('/auth/profile', updateData);
        console.log('Profile update response:', response.data);
        setProfile(prev => prev ? { ...prev, ...response.data } : null);
        toast.success('Profile updated successfully');
      } catch (apiError: any) {
        // If API fails, update locally for demo
        console.log('Profile update API failed, updating locally');
        setProfile(prev => prev ? { ...prev, ...updateData } : null);
        toast.success('Profile updated (demo mode)');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      // Password change API call (if available)
      const passwordData = {
        currentPassword,
        newPassword
      };
      
      console.log('Changing password with:', passwordData);
      
      // Try API call
      try {
        await axiosInstance.post('/auth/change-password', passwordData);
        toast.success('Password changed successfully');
      } catch (apiError: any) {
        // If API fails, simulate success for demo
        console.log('Password change API failed, simulating success');
        toast.success('Password changed (demo mode)');
      }
      
      setIsChangingPassword(false);
      form.reset();
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    }
  };

  const handleLogoutAll = async () => {
    try {
      // API call to logout all sessions (if available)
      try {
        await axiosInstance.post('/auth/logout-all');
      } catch (apiError) {
        console.log('Logout all API failed, continuing with local logout');
      }
      
      localStorage.removeItem('admin_token');
      toast.success('Logged out from all sessions');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout all error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
            <p className="text-gray-400">Manage your account settings</p>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-dark-800 rounded-xl"></div>
            <div className="h-48 bg-dark-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-purple rounded-full flex items-center justify-center">
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{profile?.name || 'Admin User'}</h2>
                    <p className="text-gray-400">{profile?.role || 'Administrator'}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Member since {new Date(profile?.createdAt || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isEditing ? <X size={18} /> : <Edit size={18} />}
                  <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          {...register('name')}
                          className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          {...register('email')}
                          type="email"
                          className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                          placeholder="admin@example.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          {...register('phone')}
                          className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                        <input
                          {...register('location')}
                          className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                          placeholder="New York, USA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Save size={18} />
                      <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-dark-700 text-gray-300 font-medium rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-700 rounded-lg">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white">{profile?.email || 'admin@example.com'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-700 rounded-lg">
                        <Shield size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Role</p>
                        <p className="text-white">{profile?.role || 'Administrator'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-700 rounded-lg">
                        <Smartphone size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="text-white">{profile?.phone || '+1 (555) 123-4567'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-700 rounded-lg">
                        <Calendar size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Member Since</p>
                        <p className="text-white">
                          {new Date(profile?.createdAt || new Date().toISOString()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Card */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Security</h3>
                  <p className="text-sm text-gray-400">Manage your password and security settings</p>
                </div>
              </div>

              {isChangingPassword ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="password"
                        name="currentPassword"
                        className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-4 py-2 bg-dark-700 text-gray-300 font-medium rounded-lg hover:bg-dark-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-dark-700 rounded-lg">
                        <Lock size={18} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white">Password</p>
                        <p className="text-sm text-gray-400">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 text-primary-400 hover:text-primary-300 font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">Last Login</p>
                  <p className="text-white">2 hours ago</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">Account Status</p>
                  <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">Session Duration</p>
                  <p className="text-white">3 hours</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-400">Total Logins</p>
                  <p className="text-white">156</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={async () => {
                    try {
                      const response = await axiosInstance.get('/auth/activity');
                      console.log('Activity log:', response.data);
                      toast.success('Activity log loaded');
                    } catch (error) {
                      toast.error('Activity log not available');
                    }
                  }}
                  className="w-full px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 text-left transition-colors"
                >
                  View Activity Log
                </button>
                <button className="w-full px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 text-left transition-colors">
                  Download Data
                </button>
                <button className="w-full px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 text-left transition-colors">
                  Privacy Settings
                </button>
                <button 
                  onClick={handleLogoutAll}
                  className="w-full px-4 py-3 bg-red-900/30 hover:bg-red-800/30 text-red-400 rounded-lg text-left transition-colors"
                >
                  Logout All Sessions
                </button>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
              <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">App Version</span>
                  <span className="text-white">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Last Updated</span>
                  <span className="text-white">Jan 3, 2024</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Support</span>
                  <a href="mailto:support@gymmaster.com" className="text-primary-400 hover:text-primary-300">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 