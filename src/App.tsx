import { Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/providers/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Generate from '@/pages/Generate';
import Gallery from '@/pages/Gallery';
import Pricing from '@/pages/Pricing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import ImageDetail from '@/pages/ImageDetail';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/gallery/:id" element={<ImageDetail />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-center" richColors />
      </div>
    </AuthProvider>
  );
}
