import React from 'react'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import LocationAccess from './pages/LocationAccess'
import Dashboard from './pages/Dashboard'
import MyRides from './pages/MyRides'
import Profile from './pages/Profile'
import RideDetails from './pages/RideDetails'
import BottomNav from './components/BottomNav'
import Toast from './components/common/Toast'
import { UserProvider, useUser } from './context/UserContext'
import { UIProvider, useUI } from './context/UIContext'

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useUser()
  if (loading) return <div className="h-screen w-full flex items-center justify-center text-slate-600 font-medium">Loading...</div>
  if (!token) return <Navigate to="/login" />
  return children
}

// Layout for the main app (has BottomNav and global Toast)
const AppLayout = () => {
    const { showBottomNav } = useUser();
    const { toast } = useUI();
    return (
        <div className="relative">
            <Outlet />
            {showBottomNav && <BottomNav />}
            <Toast visible={toast.visible} message={toast.message} type={toast.type} />
        </div>
    );
};

const App = () => {
  return (
    <UIProvider>
        <UserProvider>
            <Routes>
                {/* Public routes */}
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/location-access' element={<ProtectedRoute><LocationAccess /></ProtectedRoute>} />

                {/* Protected app routes with BottomNav */}
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path='/home' element={<Dashboard />} />
                    <Route path='/dashboard' element={<Navigate to="/home" replace />} />
                    <Route path='/my-rides' element={<MyRides />} />
                    <Route path='/ride/details/:id' element={<RideDetails />} />
                    <Route path='/profile' element={<Profile />} />
                </Route>

                {/* Fallback */}
                <Route path='*' element={<Navigate to="/login" replace />} />
            </Routes>
        </UserProvider>
    </UIProvider>
  )
}

export default App
