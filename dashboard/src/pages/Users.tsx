import { useState, useEffect } from 'react';
import { Search, Edit, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  membershipStatus: string;
}

const userUpdateSchema = z.object({
  goal: z.string().min(1, 'Goal is required'),
  weight: z.number().min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg'),
  height: z.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be less than 250cm'),
  age: z.number().min(13, 'Age must be at least 13').max(100, 'Age must be less than 100'),
});

type UserUpdateFormData = z.infer<typeof userUpdateSchema>;

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserUpdateFormData>({
    resolver: zodResolver(userUpdateSchema),
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setUsers(response.data.data.users);
      console.log(response.data.data.users)
      setFilteredUsers(response.data.data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      goal: user.goal,
      weight: user.weight,
      height: user.height,
      age: user.age,
    });
  };

  const handleUpdate = async (data: UserUpdateFormData) => {
    if (!editingUser) return;

    try {
      await axiosInstance.put(`/users/${editingUser.id}`, data);
      toast.success('User updated successfully');
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Users Management</h1>
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
          <h1 className="text-2xl font-bold text-white mb-2">Users Management</h1>
          <p className="text-gray-400">Manage all gym members and their details</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="search"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
            />
          </div>
        </div>
        <button className="px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors flex items-center justify-center space-x-2">
          <Filter size={20} />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-900/50 border-b border-dark-700">
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Name</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Email</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Age</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Weight</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Height</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Goal</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="py-3 px-6 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-dark-700 hover:bg-dark-900/50 transition-colors">
                  <td className="py-4 px-6 text-gray-300">{user.name}</td>
                  <td className="py-4 px-6 text-gray-300">{user.email}</td>
                  <td className="py-4 px-6 text-gray-300">{user.age}</td>
                  <td className="py-4 px-6 text-gray-300">{user.weight} kg</td>
                  <td className="py-4 px-6 text-gray-300">{user.height} cm</td>
                  <td className="py-4 px-6 text-gray-300">{user.goal}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.membershipStatus === 'active'
                        ? 'bg-emerald-900/30 text-emerald-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {user.membershipStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                    >
                      <Edit size={18} className="text-primary-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full border border-dark-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal
                </label>
                <input
                  {...register('goal')}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="Weight loss, Muscle gain, etc."
                />
                {errors.goal && (
                  <p className="mt-1 text-sm text-red-400">{errors.goal.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    {...register('weight', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-400">{errors.weight.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    {...register('height', { valueAsNumber: true })}
                    className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                  {errors.height && (
                    <p className="mt-1 text-sm text-red-400">{errors.height.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-400">{errors.age.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 px-4 bg-dark-700 text-gray-300 font-medium rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;