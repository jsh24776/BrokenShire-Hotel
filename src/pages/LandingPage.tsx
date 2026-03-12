import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Rooms from '../components/Rooms';
import Facilities from '../components/Facilities';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role?: string } | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col font-sans text-forest-900 bg-earth-50">
      <Header 
        currentUser={currentUser} 
        onOpenAuth={() => navigate('/login')} 
        onLogout={() => setCurrentUser(null)} 
      />
      <main className="flex-grow">
        <Hero />
        <Rooms />
        <Facilities />
        <About />
        <Testimonials />
      </main>
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/user');
          }
        }} 
      />
    </div>
  );
}
