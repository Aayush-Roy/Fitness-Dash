import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Apple, Flame, Scale } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axiosInstance from '../api/axiosInstance';

const foodSchema = z.object({
  name: z.string().min(1, 'Food name is required'),
  calories: z.number().min(1, 'Calories must be at least 1'),
  protein: z.number().min(0, 'Protein cannot be negative'),
  carbs: z.number().min(0, 'Carbs cannot be negative'),
  fats: z.number().min(0, 'Fats cannot be negative'),
});

const mealSchema = z.object({
  name: z.string().min(1, 'Meal name is required'),
  time: z.string().min(1, 'Meal time is required'),
  foods: z.array(foodSchema).min(1, 'At least one food is required'),
});

const dietPlanSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  goal: z.enum(['weight_loss', 'muscle_gain', 'maintenance']),
  dailyCalories: z.number().min(1000, 'Daily calories must be at least 1000'),
  meals: z.array(mealSchema).min(1, 'At least one meal is required'),
});

type DietPlanFormData = z.infer<typeof dietPlanSchema>;

interface DietPlan {
  id: string;
  title: string;
  description: string;
  goal: string;
  dailyCalories: number;
  meals: Array<{
    name: string;
    time: string;
    foods: Array<{
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }>;
  }>;
}

const DietPlans = () => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log("plans", plans)
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<DietPlanFormData>({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: {
      meals: [{
        name: 'Breakfast',
        time: '08:00',
        foods: [{ name: '', calories: 300, protein: 20, carbs: 30, fats: 10 }]
      }],
    },
  });

  const { fields: mealFields, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: 'meals',
  });

  const watchMeals = watch('meals');

  useEffect(() => {
    fetchDietPlans();
  }, []);

  const fetchDietPlans = async () => {
    try {
      const response = await axiosInstance.get('/diet/plans');
      console.log("diet",response.data.data.dietPlans[0].meals)
      console.log("diet", response.data.data.dietPlans)
      // setPlans(response.data.data.dietPlans[0].meals);
      setPlans(response.data.data.dietPlans);

    } catch (error) {
      toast.error('Failed to fetch diet plans');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCalories = (mealIndex: number) => {
    const meal = watchMeals[mealIndex];
    if (!meal || !meal.foods) return 0;
    return meal.foods.reduce((sum, food) => sum + food.calories, 0);
  };

  const calculateDailyTotal = () => {
    return watchMeals.reduce((sum, meal) => sum + calculateTotalCalories(watchMeals.indexOf(meal)), 0);
  };

  // const onSubmit = async (data: DietPlanFormData) => {
  //   try {
  //     await axiosInstance.post('/diet/plans', data);
  //     toast.success('Diet plan created successfully');
  //     fetchDietPlans();
  //     setShowCreateForm(false);
  //     reset();
  //   } catch (error) {
  //     toast.error('Failed to create diet plan');
  //   }
  // };

  const onSubmit = async (data: DietPlanFormData) => {
    console.log("data", data)
  try {
    const payload = {
      name: data.title,                 // 🔥 title → name
      description: data.description,
      calories: data.dailyCalories,     // 🔥 dailyCalories → calories
      meals: data.meals.map(meal => ({
        name: meal.name,
        time: meal.time,
        foods: meal.foods.map(food => food.name) // 🔥 objects → string[]
      }))
    };

    await axiosInstance.post('/diet/plans', payload);

    toast.success('Diet plan created successfully');
    fetchDietPlans();
    setShowCreateForm(false);
    reset();
  } catch (error) {
    toast.error('Failed to create diet plan');
  }
};


  // const addFoodToMeal = (mealIndex: number) => {
  //   const meals = [...watchMeals];
  //   meals[mealIndex].foods.push({
  //     name: '',
  //     calories: 0,
  //     protein: 0,
  //     carbs: 0,
  //     fats: 0,
  //   });
  //   // Update form
  // };

  // const removeFoodFromMeal = (mealIndex: number, foodIndex: number) => {
  //   const meals = [...watchMeals];
  //   if (meals[mealIndex].foods.length > 1) {
  //     meals[mealIndex].foods.splice(foodIndex, 1);
  //     // Update form
  //   }
  // };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Diet Plans</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-dark-800 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Diet Plans</h1>
          <p className="text-gray-400">Create and manage nutrition plans for members</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-emerald-600 to-accent-emerald text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Plan</span>
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 bg-dark-800 rounded-xl p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Create New Diet Plan</h3>
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
                  placeholder="e.g., Weight Loss Meal Plan"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal
                </label>
                <select
                  {...register('goal')}
                  className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Daily Calories
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('dailyCalories', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    placeholder="2000"
                  />
                  <Flame className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
                </div>
                {errors.dailyCalories && (
                  <p className="mt-1 text-sm text-red-400">{errors.dailyCalories.message}</p>
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
                  placeholder="Brief description of the diet plan..."
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-white">Meals</h4>
                  <p className="text-sm text-gray-400">
                    Daily Total: <span className="text-emerald-400 font-medium">{calculateDailyTotal()} kcal</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => appendMeal({
                    name: '',
                    time: '12:00',
                    foods: [{ name: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]
                  })}
                  className="px-3 py-1 bg-dark-700 text-sm rounded-lg hover:bg-dark-600 transition-colors"
                >
                  Add Meal
                </button>
              </div>

              <div className="space-y-4">
                {mealFields.map((mealField, mealIndex) => (
                  <div key={mealField.id} className="bg-dark-900/50 p-4 rounded-lg border border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-1">
                          <label className="block text-sm text-gray-400 mb-1">Meal Name</label>
                          <input
                            {...register(`meals.${mealIndex}.name` as const)}
                            className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white text-sm"
                            placeholder="e.g., Lunch"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Time</label>
                          <input
                            type="time"
                            {...register(`meals.${mealIndex}.time` as const)}
                            className="px-3 py-2 bg-dark-800 border border-dark-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Total Calories</label>
                          <p className="px-3 py-2 bg-dark-800 rounded text-sm text-emerald-400">
                            {calculateTotalCalories(mealIndex)} kcal
                          </p>
                        </div>
                      </div>
                      {mealFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeal(mealIndex)}
                          className="ml-4 p-1 hover:bg-red-900/30 rounded text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {watchMeals[mealIndex]?.foods?.map((_, foodIndex) => (
                        <div key={foodIndex} className="bg-dark-800 p-3 rounded border border-dark-700">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-xs text-gray-400 mb-1">Food Name</label>
                              <input
                                {...register(`meals.${mealIndex}.foods.${foodIndex}.name` as const)}
                                className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white"
                                placeholder="e.g., Grilled Chicken"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Calories</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  {...register(`meals.${mealIndex}.foods.${foodIndex}.calories` as const, { valueAsNumber: true })}
                                  className="w-full pl-6 pr-2 py-1 bg-dark-700 border border-dark-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white"
                                />
                                <Flame className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" size={12} />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Protein (g)</label>
                              <input
                                type="number"
                                {...register(`meals.${mealIndex}.foods.${foodIndex}.protein` as const, { valueAsNumber: true })}
                                className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Carbs (g)</label>
                              <input
                                type="number"
                                {...register(`meals.${mealIndex}.foods.${foodIndex}.carbs` as const, { valueAsNumber: true })}
                                className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Fats (g)</label>
                              <input
                                type="number"
                                {...register(`meals.${mealIndex}.foods.${foodIndex}.fats` as const, { valueAsNumber: true })}
                                className="w-full px-2 py-1 bg-dark-700 border border-dark-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent text-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-accent-emerald text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Diet Plan
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-dark-800 rounded-xl p-6 border border-dark-700 hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    plan.goal === 'weight_loss' ? 'bg-emerald-900/30 text-emerald-400' :
                    plan.goal === 'muscle_gain' ? 'bg-primary-900/30 text-primary-400' :
                    'bg-amber-900/30 text-amber-400'
                  }`}>
                    {plan?.goal?.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center text-sm text-gray-400">
                    <Flame size={14} className="mr-1" />
                    {plan.calories} kcal/day
                  </div>
                </div>
              </div>
            </div>

            {plan.description && (
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
            )}

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Meals ({plan?.meals?.length})</p>
              <div className="space-y-2">
                {plan && plan.meals.map((meal, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <Apple size={16} className="text-gray-500" />
                      <div>
                        <span className="text-gray-300">{meal.name}</span>
                        <span className="text-gray-500 text-xs ml-2">{meal.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-500">
                        {meal.foods.length} foods
                      </span>
                      <span className="text-emerald-400">
                        {meal.foods.reduce((sum, food) => sum + food.calories, 0)} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-dark-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Scale size={14} className="text-gray-500" />
                    <span className="text-gray-400">Protein</span>
                    <span className="text-white">
                      {plan.meals.reduce((total, meal) => 
                        total + meal.foods.reduce((sum, food) => sum + food.protein, 0), 0
                      )}g
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">Carbs</span>
                    <span className="text-white">
                      {plan.meals.reduce((total, meal) => 
                        total + meal.foods.reduce((sum, food) => sum + food.carbs, 0), 0
                      )}g
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-400">Fats</span>
                    <span className="text-white">
                      {plan.meals.reduce((total, meal) => 
                        total + meal.foods.reduce((sum, food) => sum + food.fats, 0), 0
                      )}g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietPlans;