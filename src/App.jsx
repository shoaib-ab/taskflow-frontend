import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import AdminUsers from './pages/AdminUsers';
import Teams from './pages/Teams';
import ManagerDashboard from './pages/ManagerDashboard';
import TeamTasks from './pages/TeamTasks';
import Analytics from './pages/Analytics';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='/login' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create-task'
          element={
            <ProtectedRoute>
              <CreateTask />
            </ProtectedRoute>
          }
        />
        <Route
          path='/edit-task/:id'
          element={
            <ProtectedRoute>
              <EditTask />
            </ProtectedRoute>
          }
        />
        {/* Admin + Manager routes */}
        <Route
          path='/teams'
          element={
            <RoleProtectedRoute roles={['admin', 'manager']}>
              <Teams />
            </RoleProtectedRoute>
          }
        />
        <Route
          path='/manager-dashboard'
          element={
            <RoleProtectedRoute roles={['admin', 'manager']}>
              <ManagerDashboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path='/team-tasks'
          element={
            <RoleProtectedRoute roles={['admin', 'manager']}>
              <TeamTasks />
            </RoleProtectedRoute>
          }
        />
        {/* Analytics */}
        <Route
          path='/analytics'
          element={
            <RoleProtectedRoute roles={['admin', 'manager']}>
              <Analytics />
            </RoleProtectedRoute>
          }
        />
        {/* Task detail – accessible to all authenticated users */}
        <Route
          path='/task/:id'
          element={
            <ProtectedRoute>
              <TaskDetail />
            </ProtectedRoute>
          }
        />
        {/* Profile & Settings */}
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        {/* Admin-only routes */}}
        <Route
          path='/admin/users'
          element={
            <RoleProtectedRoute roles={['admin']}>
              <AdminUsers />
            </RoleProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
