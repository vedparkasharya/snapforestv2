import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import NotFound from './pages/NotFound'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import HostDashboard from './pages/HostDashboard'
import Profile from './pages/Profile'
import Room360Viewer from './pages/Room360Viewer'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/super-admin-login" element={<AdminLogin />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:id" element={<RoomDetail />} />
      <Route path="/rooms/:id/360" element={<Room360Viewer />} />
      <Route path="/booking/:roomId" element={<Booking />} />
      <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/host" element={<HostDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
