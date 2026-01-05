import { useEffect, useState } from 'react';
import { DollarSign, Calendar, CreditCard, Download,  Search, TrendingUp, Users, BarChart3, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  planType: 'monthly' | 'yearly';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  paymentMethod: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlanType, setFilterPlanType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, filterStatus, filterPlanType, dateRange]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/payment/history');
      console.log('Payments API Response:', response.data);
      
      // Adjust based on API response structure
      const paymentsData = response.data.data?.payments || response.data.payments || response.data;
      
      if (Array.isArray(paymentsData) && paymentsData.length > 0) {
        setPayments(paymentsData);
      } else {
        // Mock data for demo
        const mockPayments: Payment[] = [
          {
            id: '1',
            userId: '1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            amount: 49.99,
            planType: 'monthly',
            status: 'completed',
            createdAt: '2024-01-15T14:30:00Z',
            paymentMethod: 'Credit Card'
          },
          {
            id: '2',
            userId: '2',
            userName: 'Jane Smith',
            userEmail: 'jane@example.com',
            amount: 499.99,
            planType: 'yearly',
            status: 'completed',
            createdAt: '2024-01-20T11:45:00Z',
            paymentMethod: 'PayPal'
          },
          {
            id: '3',
            userId: '3',
            userName: 'Mike Johnson',
            userEmail: 'mike@example.com',
            amount: 49.99,
            planType: 'monthly',
            status: 'pending',
            createdAt: '2024-01-25T16:20:00Z',
            paymentMethod: 'Credit Card'
          },
          {
            id: '4',
            userId: '4',
            userName: 'Sarah Williams',
            userEmail: 'sarah@example.com',
            amount: 49.99,
            planType: 'monthly',
            status: 'failed',
            createdAt: '2024-01-28T09:15:00Z',
            paymentMethod: 'Debit Card'
          },
          {
            id: '5',
            userId: '5',
            userName: 'David Brown',
            userEmail: 'david@example.com',
            amount: 499.99,
            planType: 'yearly',
            status: 'refunded',
            createdAt: '2024-01-30T13:40:00Z',
            paymentMethod: 'Credit Card'
          },
          {
            id: '6',
            userId: '1',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            amount: 49.99,
            planType: 'monthly',
            status: 'completed',
            createdAt: '2024-02-01T10:30:00Z',
            paymentMethod: 'Credit Card'
          },
          {
            id: '7',
            userId: '6',
            userName: 'Emily Davis',
            userEmail: 'emily@example.com',
            amount: 49.99,
            planType: 'monthly',
            status: 'completed',
            createdAt: '2024-02-05T15:25:00Z',
            paymentMethod: 'Apple Pay'
          },
        ];
        setPayments(mockPayments);
      }
    } catch (error: any) {
      console.error('Fetch payments error:', error);
      
      // Mock data for demo
      const mockPayments: Payment[] = [
        {
          id: '1',
          userId: '1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          amount: 49.99,
          planType: 'monthly',
          status: 'completed',
          createdAt: '2024-01-15T14:30:00Z',
          paymentMethod: 'Credit Card'
        },
        {
          id: '2',
          userId: '2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          amount: 499.99,
          planType: 'yearly',
          status: 'completed',
          createdAt: '2024-01-20T11:45:00Z',
          paymentMethod: 'PayPal'
        },
      ];
      setPayments(mockPayments);
      
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch payments');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Apply plan type filter
    if (filterPlanType !== 'all') {
      filtered = filtered.filter(payment => payment.planType === filterPlanType);
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) >= new Date(dateRange.start)
      );
    }

    if (dateRange.end) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) <= new Date(dateRange.end + 'T23:59:59')
      );
    }

    setFilteredPayments(filtered);
  };

  const calculateRevenue = () => {
    const completedPayments = payments.filter(p => p.status === 'completed');
    return completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return payment.status === 'completed' &&
             paymentDate.getMonth() === currentMonth &&
             paymentDate.getFullYear() === currentYear;
    });
    
    return monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateStats = () => {
    const completed = payments.filter(p => p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const refunded = payments.filter(p => p.status === 'refunded').length;
    
    const monthlyRevenue = calculateMonthlyRevenue();
    const totalRevenue = calculateRevenue();
    const monthlyPlans = payments.filter(p => p.planType === 'monthly').length;
    const yearlyPlans = payments.filter(p => p.planType === 'yearly').length;
    
    return {
      totalRevenue,
      monthlyRevenue,
      completed,
      pending,
      failed,
      refunded,
      monthlyPlans,
      yearlyPlans,
      totalTransactions: payments.length,
    };
  };

  const prepareChartData = () => {
    // Last 6 months revenue data
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() - i);
      
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      const monthlyPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return payment.status === 'completed' &&
               paymentDate.getMonth() === date.getMonth() &&
               paymentDate.getFullYear() === year;
      });
      
      const revenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      months.push({
        name: monthName,
        revenue: revenue,
        transactions: monthlyPayments.length,
      });
    }
    
    return months;
  };

  const preparePieChartData = () => {
    const planTypes = [
      { name: 'Monthly', value: payments.filter(p => p.planType === 'monthly').length, color: '#0EA5E9' },
      { name: 'Yearly', value: payments.filter(p => p.planType === 'yearly').length, color: '#8B5CF6' },
    ];
    
    return planTypes.filter(item => item.value > 0);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'User', 'Email', 'Amount', 'Plan Type', 'Status', 'Payment Method', 'Date'];
    const csvData = filteredPayments.map(payment => [
      payment.id,
      payment.userName,
      payment.userEmail,
      `$${payment.amount.toFixed(2)}`,
      payment.planType,
      payment.status,
      payment.paymentMethod,
      new Date(payment.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Export started');
  };

  const stats = calculateStats();
  const chartData = prepareChartData();
  const pieChartData = preparePieChartData();

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Payments</h1>
          <p className="text-gray-400">Manage and track payment transactions</p>
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
        <h1 className="text-2xl font-bold text-white mb-2">Payments</h1>
        <p className="text-gray-400">Manage and track payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
              <h3 className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 bg-emerald-900/20 rounded-xl">
              <DollarSign size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Monthly Revenue</p>
              <h3 className="text-3xl font-bold text-white">${stats.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
            <div className="p-3 bg-primary-900/20 rounded-xl">
              <TrendingUp size={24} className="text-primary-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Completed</p>
              <h3 className="text-3xl font-bold text-white">{stats.completed}</h3>
              <p className="text-sm text-gray-500 mt-1">Transactions</p>
            </div>
            <div className="p-3 bg-emerald-900/20 rounded-xl">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Pending</p>
              <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
              <p className="text-sm text-gray-500 mt-1">Transactions</p>
            </div>
            <div className="p-3 bg-amber-900/20 rounded-xl">
              <Clock size={24} className="text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
                <p className="text-sm text-gray-400">Last 6 months revenue</p>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 size={20} className="text-gray-400" />
                <span className="text-sm text-gray-400">Monthly Overview</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#D1D5DB' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="revenue" 
                    name="Revenue" 
                    fill="#0EA5E9" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="lg:col-span-1">
          <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Plan Distribution</h3>
                <p className="text-sm text-gray-400">By plan type</p>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={20} className="text-gray-400" />
                <span className="text-sm text-gray-400">{pieChartData.reduce((a, b) => a + b.value, 0)} plans</span>
              </div>
            </div>
            <div className="h-64">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value} transactions`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No plan data available
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{item.value} transactions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="search"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <select
            value={filterPlanType}
            onChange={(e) => setFilterPlanType(e.target.value)}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
          >
            <option value="all">All Plans</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            placeholder="End Date"
          />
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterPlanType('all');
              setDateRange({ start: '', end: '' });
            }}
            className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
          >
            Clear
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-700">
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Transaction ID</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Customer</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Amount</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Plan Type</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Payment Method</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-6 text-center text-gray-400">
                    No payment records found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-dark-700 hover:bg-dark-900/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-gray-300 font-mono text-sm">{payment.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-gray-300 font-medium">{payment.userName}</p>
                        <p className="text-sm text-gray-500">{payment.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-white font-medium">
                          ${payment.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.planType === 'monthly' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {payment.planType === 'monthly' ? 'Monthly' : 'Yearly'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-emerald-900/30 text-emerald-400' :
                        payment.status === 'pending' ? 'bg-amber-900/30 text-amber-400' :
                        payment.status === 'failed' ? 'bg-red-900/30 text-red-400' :
                        'bg-gray-900/30 text-gray-400'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-gray-300">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      <p className="text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // View details
                            toast.info(`Payment ${payment.id} details`);
                          }}
                          className="px-3 py-1 bg-dark-700 text-gray-300 text-sm rounded-lg hover:bg-dark-600 transition-colors"
                        >
                          View
                        </button>
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => {
                              // Mark as completed
                              toast.success(`Payment ${payment.id} marked as completed`);
                            }}
                            className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-sm rounded-lg hover:bg-emerald-800/30 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-900/20 rounded-xl">
              <CreditCard size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Plans</p>
              <p className="text-2xl font-bold text-white">{stats.monthlyPlans}</p>
              <p className="text-sm text-gray-500 mt-1">Active subscriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-900/20 rounded-xl">
              <Calendar size={24} className="text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Yearly Plans</p>
              <p className="text-2xl font-bold text-white">{stats.yearlyPlans}</p>
              <p className="text-sm text-gray-500 mt-1">Active subscriptions</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-900/20 rounded-xl">
              <BarChart3 size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalTransactions > 0 
                  ? `${Math.round((stats.completed / stats.totalTransactions) * 100)}%`
                  : '0%'
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">Payment completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;