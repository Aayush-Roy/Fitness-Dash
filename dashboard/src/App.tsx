import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import WorkoutPlans from './pages/WorkoutPlans';
import DietPlans from './pages/DietPlans';
import Memberships from './pages/Memberships';
import Attendance from './pages/Attendance';
import Payments from './pages/Payments';
import Profile from './pages/Profile';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-dark-950 text-white">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className="p-0">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Users />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout-plans"
          element={
            <ProtectedRoute>
              <AppLayout>
                <WorkoutPlans />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/diet-plans"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DietPlans />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/memberships"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Memberships />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Attendance />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Payments />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;