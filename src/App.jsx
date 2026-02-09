import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreateTask from './pages/CreateTask';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import EditTask from './pages/EditTask';

function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <Router>
          <Routes>
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
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
          </Routes>
        </Router>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;
