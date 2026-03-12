import { useState, useEffect } from 'react';
import { Menu, X, Leaf, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  currentUser: { name: string; role?: string } | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({ currentUser, onOpenAuth, onLogout }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Rooms', href: '#rooms' },
    { name: 'Facilities', href: '#facilities' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 group">
          <Leaf className={`w-6 h-6 transition-colors ${isScrolled ? 'text-forest-600' : 'text-white group-hover:text-forest-200'}`} />
          <span className={`font-serif text-2xl font-semibold tracking-wide transition-colors ${isScrolled ? 'text-forest-900' : 'text-white'}`}>
            Brokenshire
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-sm font-medium tracking-wide transition-colors hover:text-earth-500 ${
                isScrolled ? 'text-forest-800' : 'text-white/90'
              }`}
            >
              {link.name}
            </a>
          ))}
          
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className={`text-sm font-medium flex items-center gap-2 ${isScrolled ? 'text-forest-800' : 'text-white'}`}>
                  <User className="w-4 h-4" />
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  className={`text-sm font-medium transition-colors hover:text-earth-500 ${
                    isScrolled ? 'text-forest-800/70' : 'text-white/70'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className={`text-sm font-medium transition-colors hover:text-earth-500 ${
                  isScrolled ? 'text-forest-800' : 'text-white'
                }`}
              >
                Sign In
              </button>
            )}
            
            {currentUser?.role === 'admin' ? (
              <Link
                to="/admin"
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isScrolled
                    ? 'bg-forest-900 text-white hover:bg-black'
                    : 'bg-white text-forest-900 hover:bg-earth-100'
                }`}
              >
                Admin Portal
              </Link>
            ) : currentUser?.role === 'user' ? (
              <Link
                to="/user"
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isScrolled
                    ? 'bg-forest-700 text-white hover:bg-forest-800'
                    : 'bg-white text-forest-900 hover:bg-earth-100'
                }`}
              >
                My Portal
              </Link>
            ) : (
              <a
                href="#rooms"
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  isScrolled
                    ? 'bg-forest-700 text-white hover:bg-forest-800'
                    : 'bg-white text-forest-900 hover:bg-earth-100'
                }`}
              >
                Book Your Stay
              </a>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${isScrolled ? 'text-forest-900' : 'text-white'}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isScrolled ? 'text-forest-900' : 'text-white'}`} />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-earth-100 py-4 px-6 flex flex-col gap-4">
          {currentUser ? (
            <div className="flex items-center justify-between py-2 border-b border-earth-100">
              <span className="text-forest-800 font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {currentUser.name}
              </span>
              <button onClick={onLogout} className="text-sm text-forest-800/70">
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="text-left text-forest-800 font-medium py-2 border-b border-earth-100"
            >
              Sign In / Register
            </button>
          )}
          
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-forest-800 font-medium py-2 border-b border-earth-100 last:border-none"
            >
              {link.name}
            </a>
          ))}
          
          {currentUser?.role === 'admin' ? (
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 bg-forest-900 text-white text-center py-3 rounded-full font-medium"
            >
              Admin Portal
            </Link>
          ) : currentUser?.role === 'user' ? (
            <Link
              to="/user"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 bg-forest-700 text-white text-center py-3 rounded-full font-medium"
            >
              My Portal
            </Link>
          ) : (
            <a
              href="#rooms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-4 bg-forest-700 text-white text-center py-3 rounded-full font-medium"
            >
              Book Your Stay
            </a>
          )}
        </div>
      )}
    </header>
  );
}
