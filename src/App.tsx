import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/auth/login/Login';
import { ForgotPassword } from './components/auth/forgotPassword/ForgotPassword';
import { Home } from './components/home/Home';
import { ProtectedRoute } from './components/auth/protectedRoutes/ProtectedRoute';
import { NotFound } from './components/UI/NotFound';
import { useResetDataOnAuthChange } from './hooks/authHooks';
import { ToastContainer } from './components/UI/ToastContainer';
import { ResetPasswordSuccess } from './components/auth/resetPassword/ResetPasswordSuccess';
import { ResetPassword } from './components/auth/resetPassword/ResetPassword';
import { Settings } from './components/settings/Settings';
import { Users } from './components/users/Users';
import { Employees } from './components/employees/Employees';

const ProtectedHome = ProtectedRoute(Home, []);
const ProtectedSettings = ProtectedRoute(Settings, []);
const ProtectedUsers = ProtectedRoute(Users, ['admin']);
const ProtectedEmployees = ProtectedRoute(Employees, ['admin']);

function App() {
  useResetDataOnAuthChange();

  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/reset-password-success"
            element={<ResetPasswordSuccess />}
          />
          <Route path="/employees" element={<ProtectedEmployees />} />
          <Route path="/settings" element={<ProtectedSettings />} />
          <Route path="/users" element={<ProtectedUsers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
