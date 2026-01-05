import { useEffect, useState } from 'react';
import { Users, DollarSign, Dumbbell, Apple, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import { StatCardSkeleton } from '../components/LoadingSkeleton';
import axiosInstance from '../api/axiosInstance';

interface DashboardStats {
  totalUsers: number;
  activeMembers: number;
  workoutPlansCount: number;
  dietPlansCount: number;
  monthlyRevenue: number;
}

const attendanceData = [
  { date: 'Mon', checkIns: 65 },
  { date: 'Tue', checkIns: 78 },
  { date: 'Wed', checkIns: 90 },
  { date: 'Thu', checkIns: 85 },
  { date: 'Fri', checkIns: 70 },
  { date: 'Sat', checkIns: 55 },
  { date: 'Sun', checkIns: 40 },
];

const revenueData = [
  { month: 'Jan', revenue: 12000 },
  { month: 'Feb', revenue: 15000 },
  { month: 'Mar', revenue: 18000 },
  { month: 'Apr', revenue: 22000 },
  { month: 'May', revenue: 25000 },
  { month: 'Jun', revenue: 28000 },
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  console.log("stats", stats)

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you'd have a dedicated dashboard API endpoint
      // For now, we'll simulate by fetching multiple endpoints
      const [usersRes, workoutRes, dietRes, paymentsRes] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/workout/plans'),
        axiosInstance.get('/diet/plans'),
        axiosInstance.get('/payment/history'),
      ]);
      console.log("users",usersRes.data.data.users.length[0]);
      // console.log("workout",workoutRes.data.data.workoutPlans);
      // console.log("deits",dietRes.data.data.dietPlans);
      // console.log("payment",paymentsRes.data.data)
           console.log('Dashboard fetched data:', {
        users: usersRes.data.data.users,
        workouts: workoutRes.data.data,
        diets: dietRes.data,
        payments: paymentsRes.data,
      });

      // Calculate monthly revenue from payment history
      const monthlyRevenue = paymentsRes.data.reduce((sum: number, payment: any) => {
        const paymentDate = new Date(payment.createdAt);
        const currentMonth = new Date().getMonth();
        if (paymentDate.getMonth() === currentMonth) {
          return sum + payment.amount;
        }
        return sum;
      }, 0);

      // Calculate active members (users with active memberships)
      const activeMembers = usersRes.data.filter((user: any) => 
        user.membershipStatus === 'active'
      ).length;

      setStats({
        totalUsers: usersRes.data.data.users.length,
        activeMembers,
        workoutPlansCount: workoutRes.data.data.workoutPlans.length,
        dietPlansCount: dietRes.data.length,
        monthlyRevenue,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Members"
          value={stats?.activeMembers || 0}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Workout Plans"
          value={stats?.workoutPlansCount || 0}
          icon={Dumbbell}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats?.monthlyRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Attendance Trend</h3>
              <p className="text-sm text-gray-400">Daily check-ins this week</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="checkIns"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
              <p className="text-sm text-gray-400">Monthly revenue overview</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {[
            { user: 'John Doe', action: 'joined the gym', time: '2 hours ago' },
            { user: 'Jane Smith', action: 'purchased yearly membership', time: '4 hours ago' },
            { user: 'Mike Johnson', action: 'checked in', time: '6 hours ago' },
            { user: 'Sarah Williams', action: 'updated workout plan', time: '1 day ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-dark-900/50 rounded-lg hover:bg-dark-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center">
                  <Users size={20} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300">
                    <span className="font-medium text-white">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-dark-700 rounded-full text-xs text-gray-300">
                New
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
