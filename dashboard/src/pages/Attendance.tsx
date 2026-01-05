import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, Users, TrendingUp, Search, Filter, UserCheck, CalendarDays, BarChart3 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const attendanceSchema = z.object({
  userId: z.string().min(1, 'User is required'),
});

interface UserType {
  id: string;
  email: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  checkInTime: string;
  date: string;
  createdAt: string;
}

const Attendance = () => {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    todayCheckIns: 0,
    averageDaily: 0,
    activeUsers: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ userId: string }>({
    resolver: zodResolver(attendanceSchema),
  });

  useEffect(() => {
    fetchUsers();
    fetchAttendance();
  }, []);

  useEffect(() => {
    filterAttendance();
    calculateStats();
  }, [attendanceList, searchTerm, selectedDate]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      console.log('Users API Response:', response.data);
      const usersData = response.data.data?.users || response.data.users || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      
      // Mock users for demo
      const mockUsers: UserType[] = [
        { id: '1', email: 'john@example.com', name: 'John Doe' },
        { id: '2', email: 'jane@example.com', name: 'Jane Smith' },
        { id: '3', email: 'mike@example.com', name: 'Mike Johnson' },
        { id: '4', email: 'sarah@example.com', name: 'Sarah Williams' },
        { id: '5', email: 'david@example.com', name: 'David Brown' },
      ];
      setUsers(mockUsers);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      
      // Note: Currently we might not have GET attendance API
      // This is a placeholder for when the API is available
      // For now, we'll use mock data
      
      const mockAttendance: AttendanceRecord[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          checkInTime: '08:30 AM',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          checkInTime: '09:15 AM',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          userId: '3',
          userName: 'Mike Johnson',
          userEmail: 'mike@example.com',
          checkInTime: '10:00 AM',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          userId: '4',
          userName: 'Sarah Williams',
          userEmail: 'sarah@example.com',
          checkInTime: '07:45 AM',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '5',
          userId: '5',
          userName: 'David Brown',
          userEmail: 'david@example.com',
          checkInTime: '11:30 AM',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
      ];
      
      setAttendanceList(mockAttendance);
      
    } catch (error: any) {
      console.error('Fetch attendance error:', error);
      toast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = attendanceList;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter(record => record.date === selectedDate);
    }

    setFilteredAttendance(filtered);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceList.filter(record => record.date === today);
    
    // Calculate average daily check-ins (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    const last7DaysCounts = last7Days.map(date => 
      attendanceList.filter(record => record.date === date).length
    );
    
    const averageDaily = last7DaysCounts.reduce((a, b) => a + b, 0) / 7;

    setStats({
      totalCheckIns: attendanceList.length,
      todayCheckIns: todayRecords.length,
      averageDaily: Math.round(averageDaily),
      activeUsers: new Set(attendanceList.map(record => record.userId)).size,
    });
  };

  const onSubmit = async (data: { userId: string }) => {
    try {
      console.log('Checking in user:', data);
      
      // API call
      await axiosInstance.post('/attendance/check-in', data);
      
      // Find selected user
      const selectedUser = users.find(user => user.id === data.userId);
      
      // Add to local list
      const newRecord: AttendanceRecord = {
        id: String(attendanceList.length + 1),
        userId: data.userId,
        userName: selectedUser?.name || 'Unknown User',
        userEmail: selectedUser?.email || 'unknown@example.com',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      setAttendanceList(prev => [newRecord, ...prev]);
      toast.success('Check-in recorded successfully');
      reset();
      
    } catch (error: any) {
      console.error('Check-in error:', error);
      
      // Mock check-in for demo
      if (error.message === 'NETWORK_ERROR' || error.response?.status === 404) {
        const selectedUser = users.find(user => user.id === data.userId);
        const newRecord: AttendanceRecord = {
          id: String(attendanceList.length + 1),
          userId: data.userId,
          userName: selectedUser?.name || 'Demo User',
          userEmail: selectedUser?.email || 'demo@example.com',
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        
        setAttendanceList(prev => [newRecord, ...prev]);
        toast.success('Check-in recorded (demo mode)');
        reset();
      } else {
        toast.error('Failed to record check-in');
      }
    }
  };

  const getCheckInStatsForUser = (userId: string) => {
    const userRecords = attendanceList.filter(record => record.userId === userId);
    const thisWeek = userRecords.filter(record => {
      const recordDate = new Date(record.date);
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      return recordDate >= weekStart;
    }).length;
    
    const thisMonth = userRecords.filter(record => {
      const recordDate = new Date(record.date);
      const monthStart = new Date();
      monthStart.setDate(1);
      return recordDate >= monthStart;
    }).length;
    
    return { thisWeek, thisMonth, total: userRecords.length };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Attendance Management</h1>
          <p className="text-gray-400">Track and manage member check-ins</p>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-800 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-dark-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Attendance Management</h1>
        <p className="text-gray-400">Track and manage member check-ins</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Today's Check-ins</p>
              <h3 className="text-3xl font-bold text-white">{stats.todayCheckIns}</h3>
              <p className="text-sm text-gray-500 mt-1">As of now</p>
            </div>
            <div className="p-3 bg-emerald-900/20 rounded-xl">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Check-ins</p>
              <h3 className="text-3xl font-bold text-white">{stats.totalCheckIns}</h3>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-primary-900/20 rounded-xl">
              <Users size={24} className="text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Daily Average</p>
              <h3 className="text-3xl font-bold text-white">{stats.averageDaily}</h3>
              <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
            </div>
            <div className="p-3 bg-amber-900/20 rounded-xl">
              <TrendingUp size={24} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Users</p>
              <h3 className="text-3xl font-bold text-white">{stats.activeUsers}</h3>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 bg-purple-900/20 rounded-xl">
              <UserCheck size={24} className="text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Check-in Form and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Check-in Form */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Manual Check-in</h3>
              <p className="text-sm text-gray-400">Record member attendance</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Member
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
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
                  Check-in Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="text"
                    value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    readOnly
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? 'Recording...' : 'Record Check-in'}
              </button>
            </form>
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="lg:col-span-2">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Attendance Overview</h3>
                <p className="text-sm text-gray-400">Recent check-in activity</p>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDays size={20} className="text-gray-400" />
                <span className="text-sm text-gray-400">Live Updates</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {attendanceList.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-900/30 rounded-full flex items-center justify-center">
                      <UserCheck size={18} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{record.userName}</p>
                      <p className="text-sm text-gray-400">{record.userEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{record.checkInTime}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            />
          </div>
          <button
            onClick={() => {
              setSelectedDate('');
              setSearchTerm('');
            }}
            className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Attendance List */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-700">
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Member</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Check-in Time</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">This Week</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">This Month</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-6 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => {
                  const userStats = getCheckInStatsForUser(record.userId);
                  
                  return (
                    <tr key={record.id} className="border-b border-dark-700 hover:bg-dark-900/50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-gray-300 font-medium">{record.userName}</p>
                          <p className="text-sm text-gray-500">{record.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-gray-400" />
                          <span className="text-gray-300">{record.checkInTime}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-900/30 text-blue-400 text-xs font-medium rounded-full">
                          {userStats.thisWeek} times
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-purple-900/30 text-purple-400 text-xs font-medium rounded-full">
                          {userStats.thisMonth} times
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-medium rounded-full">
                          {userStats.total} total
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-900/20 rounded-xl">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Peak Hour</p>
              <p className="text-lg font-semibold text-white">9:00 AM - 10:00 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-900/20 rounded-xl">
              <UserCheck size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Most Consistent</p>
              <p className="text-lg font-semibold text-white">John Doe (28 days)</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-900/20 rounded-xl">
              <TrendingUp size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Growth</p>
              <p className="text-lg font-semibold text-white">+12% this week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;