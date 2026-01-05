import { useState, useEffect } from 'react';
import { Calendar, User, CreditCard, Plus, Search, Filter, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { MEMBERSHIP_TYPES } from '../utils/constants';

const membershipSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  planType: z.enum(['monthly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type MembershipFormData = z.infer<typeof membershipSchema>;

interface UserType {
  id: string;
  email: string;
  name: string;
}

interface MembershipType {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planType: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

const Memberships = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentMemberships, setCurrentMemberships] = useState<MembershipType[]>([]);
  const [filteredMemberships, setFilteredMemberships] = useState<MembershipType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MembershipFormData>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      planType: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const startDate = watch('startDate');

  useEffect(() => {
    fetchUsers();
    fetchCurrentMemberships();
  }, []);

  useEffect(() => {
    let filtered = currentMemberships;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(membership =>
        membership.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(membership => membership.status === filterStatus);
    }

    setFilteredMemberships(filtered);
  }, [searchTerm, filterStatus, currentMemberships]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      console.log('Users API Response:', response.data);
      // Adjust based on your API response structure
      const usersData = response.data.data?.users || response.data.users || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      toast.error('Failed to fetch users');
      
      // Mock data for demo
      const mockUsers: UserType[] = [
        { id: '1', email: 'john@example.com', name: 'John Doe' },
        { id: '2', email: 'jane@example.com', name: 'Jane Smith' },
        { id: '3', email: 'mike@example.com', name: 'Mike Johnson' },
      ];
      setUsers(mockUsers);
    }
  };

  const fetchCurrentMemberships = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/membership/current');
      console.log('Memberships API Response:', response.data);
      // Adjust based on your API response structure
      const membershipsData = response.data.data?.memberships || response.data.memberships || response.data;
      setCurrentMemberships(Array.isArray(membershipsData) ? membershipsData : []);
      
      // Mock data for demo if API returns empty
      if (!Array.isArray(membershipsData) || membershipsData.length === 0) {
        const mockMemberships: MembershipType[] = [
          {
            id: '1',
            userId: '1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            planType: 'monthly',
            startDate: '2024-01-01',
            endDate: '2024-02-01',
            status: 'active',
            createdAt: '2024-01-01T10:00:00Z'
          },
          {
            id: '2',
            userId: '2',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            planType: 'yearly',
            startDate: '2024-01-15',
            endDate: '2025-01-15',
            status: 'active',
            createdAt: '2024-01-15T14:30:00Z'
          },
          {
            id: '3',
            userId: '3',
            userName: 'Mike Johnson',
            userEmail: 'mike@example.com',
            planType: 'monthly',
            startDate: '2023-12-01',
            endDate: '2024-01-01',
            status: 'expired',
            createdAt: '2023-12-01T09:15:00Z'
          }
        ];
        setCurrentMemberships(mockMemberships);
      }
    } catch (error: any) {
      console.error('Fetch memberships error:', error);
      
      // Mock data for demo
      const mockMemberships: MembershipType[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          planType: 'monthly',
          startDate: '2024-01-01',
          endDate: '2024-02-01',
          status: 'active',
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          planType: 'yearly',
          startDate: '2024-01-15',
          endDate: '2025-01-15',
          status: 'active',
          createdAt: '2024-01-15T14:30:00Z'
        }
      ];
      setCurrentMemberships(mockMemberships);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MembershipFormData) => {
    try {
      console.log('Creating membership with:', data);
      
      // Find selected user
      const selectedUser = users.find(user => user.id === data.userId);
      
      // Prepare request data
      const requestData = {
        ...data,
        userName: selectedUser?.name || 'Unknown User',
        userEmail: selectedUser?.email || 'unknown@example.com'
      };
      
      // API call
      const response = await axiosInstance.post('/membership', requestData);
      console.log('Membership creation response:', response.data);
      
      toast.success('Membership created successfully');
      fetchCurrentMemberships();
      reset();
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Create membership error:', error);
      
      // Mock creation for demo
      if (error.message === 'NETWORK_ERROR' || error.response?.status === 404) {
        const selectedUser = users.find(user => user.id === data.userId);
        const newMembership: MembershipType = {
          id: String(currentMemberships.length + 1),
          userId: data.userId,
          userName: selectedUser?.name || 'New Member',
          userEmail: selectedUser?.email || 'new@example.com',
          planType: data.planType,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        
        setCurrentMemberships(prev => [...prev, newMembership]);
        toast.success('Membership created (demo mode)');
        reset();
        setShowCreateForm(false);
      } else {
        toast.error('Failed to create membership');
      }
    }
  };

  const handleDeleteMembership = async (membershipId: string) => {
    if (!window.confirm('Are you sure you want to delete this membership?')) {
      return;
    }

    try {
      // API call to delete membership
      await axiosInstance.delete(`/membership/${membershipId}`);
      toast.success('Membership deleted successfully');
      fetchCurrentMemberships();
    } catch (error: any) {
      console.error('Delete membership error:', error);
      
      // Mock deletion for demo
      if (error.message === 'NETWORK_ERROR' || error.response?.status === 404) {
        setCurrentMemberships(prev => prev.filter(m => m.id !== membershipId));
        toast.success('Membership deleted (demo mode)');
      } else {
        toast.error('Failed to delete membership');
      }
    }
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateEndDate = (startDate: string, planType: 'monthly' | 'yearly') => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    if (planType === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  // const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>, planType: 'monthly' | 'yearly') => {
  //   const newStartDate = e.target.value;
  //   const newEndDate = calculateEndDate(newStartDate, planType);
    
  //   // Update form values
  //   const event = {
  //     target: {
  //       name: 'endDate',
  //       value: newEndDate
  //     }
  //   } as React.ChangeEvent<HTMLInputElement>;
    
  //   // You would need to set the form value here
  //   // For now, we'll handle it in the form submission
  // };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Membership Management</h1>
          <p className="text-gray-400">Manage gym memberships and subscriptions</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-dark-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Membership Management</h1>
          <p className="text-gray-400">Manage gym memberships and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New Membership</span>
        </button>
      </div>

      {/* Create Membership Form */}
      {showCreateForm && (
        <div className="mb-8 bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Create New Membership</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                reset();
              }}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Member
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <select
                    {...register('userId')}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white appearance-none"
                  >
                    <option value="">Choose a member</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-400">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Type
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <select
                    {...register('planType')}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white appearance-none"
                    onChange={(e) => {
                      const planType = e.target.value as 'monthly' | 'yearly';
                      if (startDate) {
                        const newEndDate = calculateEndDate(startDate, planType);
                        // Update end date in form
                      }
                    }}
                  >
                    {MEMBERSHIP_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-400">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Membership'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="px-6 py-2 bg-dark-700 text-gray-300 font-medium rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="search"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors flex items-center space-x-2">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Memberships</p>
              <h3 className="text-2xl font-bold text-white">
                {currentMemberships.filter(m => m.status === 'active').length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-900/20 rounded-xl">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Monthly Plans</p>
              <h3 className="text-2xl font-bold text-white">
                {currentMemberships.filter(m => m.planType === 'monthly').length}
              </h3>
            </div>
            <div className="p-3 bg-primary-900/20 rounded-xl">
              <Calendar size={24} className="text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Expiring Soon</p>
              <h3 className="text-2xl font-bold text-white">
                {currentMemberships.filter(m => {
                  const daysRemaining = calculateDaysRemaining(m.endDate);
                  return m.status === 'active' && daysRemaining <= 7 && daysRemaining > 0;
                }).length}
              </h3>
            </div>
            <div className="p-3 bg-amber-900/20 rounded-xl">
              <Calendar size={24} className="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Memberships Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-700">
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Member</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Plan Type</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Start Date</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">End Date</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Days Left</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 px-6 text-center text-gray-400">
                    No memberships found
                  </td>
                </tr>
              ) : (
                filteredMemberships.map((membership) => {
                  const daysRemaining = calculateDaysRemaining(membership.endDate);
                  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
                  const isExpired = daysRemaining <= 0 || membership.status === 'expired';

                  return (
                    <tr key={membership.id} className="border-b border-dark-700 hover:bg-dark-900/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-gray-300 font-medium">{membership.userName}</p>
                          <p className="text-sm text-gray-500">{membership.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          membership.planType === 'monthly' 
                            ? 'bg-blue-900/30 text-blue-400' 
                            : 'bg-purple-900/30 text-purple-400'
                        }`}>
                          {membership.planType === 'monthly' ? 'Monthly' : 'Yearly'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {new Date(membership.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {new Date(membership.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isExpired ? 'bg-red-900/30 text-red-400' :
                          isExpiringSoon ? 'bg-amber-900/30 text-amber-400' :
                          'bg-emerald-900/30 text-emerald-400'
                        }`}>
                          {isExpired ? 'Expired' : `${daysRemaining} days`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          membership.status === 'active' ? 'bg-emerald-900/30 text-emerald-400' :
                          membership.status === 'expired' ? 'bg-red-900/30 text-red-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {membership.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Edit functionality
                              toast('Edit feature coming soon');
                            }}
                            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="text-primary-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteMembership(membership.id)}
                            className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Memberships;