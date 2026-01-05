import { useState, useEffect } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';
import { WORKOUT_DIFFICULTIES } from '../utils/constants';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.number().min(1, 'At least 1 set'),
  reps: z.number().min(1, 'At least 1 rep'),
  restTime: z.number().min(0, 'Rest time cannot be negative'),
});

const workoutPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  durationWeeks: z.number().min(1, 'Duration must be at least 1 week'),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
});

type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>;

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  durationWeeks: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    restTime: number;
  }>;
}

const WorkoutPlans = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WorkoutPlanFormData>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      exercises: [{ name: '', sets: 3, reps: 10, restTime: 60 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      const response = await axiosInstance.get('/workout/plans');
      setPlans(response.data.data.workoutPlans);
    } catch (error) {
      toast.error('Failed to fetch workout plans');
    } finally {
      setLoading(false);
    }
  };

  // const onSubmit = async (data: WorkoutPlanFormData) => {
  //   try {
  //     await axiosInstance.post('/workout/plans', data);
  //     toast.success('Workout plan created successfully');
  //     fetchWorkoutPlans();
  //     setShowCreateForm(false);
  //     reset();
  //   } catch (error) {
  //     toast.error('Failed to create workout plan');
  //   }
  // };
const onSubmit = async (data: WorkoutPlanFormData) => {
  try {
    const payload = {
      name: data.title,              // 🔥 IMPORTANT
      description: data.description,
      difficulty: data.difficulty,
      exercises: data.exercises
      // durationWeeks backend me hai hi nahi → skip
    };

    await axiosInstance.post('/workout/plans', payload);

    toast.success('Workout plan created successfully');
    fetchWorkoutPlans();
    setShowCreateForm(false);
    reset();
  } catch (error) {
    toast.error('Failed to create workout plan');
  }
};

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Workout Plans</h1>
          <p className="text-gray-400">Create and manage workout plans for members</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Plan</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Create New Workout Plan</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  {...register('title')}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="e.g., Beginner Strength Training"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  {...register('difficulty')}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                >
                  {WORKOUT_DIFFICULTIES.map((difficulty) => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  {...register('durationWeeks', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="4"
                />
                {errors.durationWeeks && (
                  <p className="mt-1 text-sm text-red-400">{errors.durationWeeks.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  placeholder="Brief description of the workout plan..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">Exercises</h4>
                <button
                  type="button"
                  onClick={() => append({ name: '', sets: 3, reps: 10, restTime: 60 })}
                  className="px-3 py-1 bg-dark-700 text-sm rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Add Exercise
                </button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="bg-dark-900/50 p-4 rounded-lg border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium text-white">Exercise {index + 1}</h5>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1 hover:bg-red-900/30 rounded text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Name</label>
                        <input
                          {...register(`exercises.${index}.name` as const)}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white text-sm"
                          placeholder="e.g., Bench Press"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Sets</label>
                        <input
                          type="number"
                          {...register(`exercises.${index}.sets` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Reps</label>
                        <input
                          type="number"
                          {...register(`exercises.${index}.reps` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Rest (sec)</label>
                        <input
                          type="number"
                          {...register(`exercises.${index}.restTime` as const, { valueAsNumber: true })}
                          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.exercises && (
                <p className="mt-2 text-sm text-red-400">{errors.exercises.message}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Create Workout Plan
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 bg-dark-700 text-gray-300 font-medium rounded-lg hover:bg-dark-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-primary-500/30 transition-all hover:shadow-xl hover:shadow-primary-500/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  plan.difficulty === 'beginner' ? 'bg-emerald-900/30 text-emerald-400' :
                  plan.difficulty === 'intermediate' ? 'bg-amber-900/30 text-amber-400' :
                  'bg-red-900/30 text-red-400'
                }`}>
                  {plan.difficulty}
                </span>
              </div>
            </div>

            {plan.description && (
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Duration: {plan.durationWeeks} weeks</p>
              <p className="text-sm text-gray-500">Exercises: {plan.exercises.length}</p>
            </div>

            <div className="space-y-2">
              {plan.exercises.slice(0, 3).map((exercise, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300 truncate">{exercise.name}</span>
                  <span className="text-gray-500">
                    {exercise.sets}×{exercise.reps}
                  </span>
                </div>
              ))}
              {plan.exercises.length > 3 && (
                <p className="text-sm text-primary-400 text-center">
                  +{plan.exercises.length - 3} more exercises
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPlans;