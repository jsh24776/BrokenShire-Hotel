import { Leaf, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-forest-900 text-white pt-24 pb-12 border-t-8 border-earth-500">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <a href="#home" className="flex items-center gap-2 group">
              <Leaf className="w-8 h-8 text-earth-400" />
              <span className="font-serif text-3xl font-semibold tracking-wide">
                Brokenshire
              </span>
            </a>
            <p className="text-forest-200/80 leading-relaxed max-w-sm">
              A sanctuary where luxury meets nature. Experience the ultimate retreat in the heart of the forest.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center text-forest-200 hover:bg-earth-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center text-forest-200 hover:bg-earth-500 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-forest-800 flex items-center justify-center text-forest-200 hover:bg-earth-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-xl mb-6 text-earth-300">Explore</h4>
            <ul className="space-y-4">
              <li><a href="#home" className="text-forest-200/80 hover:text-earth-400 transition-colors">Home</a></li>
              <li><a href="#rooms" className="text-forest-200/80 hover:text-earth-400 transition-colors">Accommodations</a></li>
              <li><a href="#facilities" className="text-forest-200/80 hover:text-earth-400 transition-colors">Facilities & Spa</a></li>
              <li><a href="#about" className="text-forest-200/80 hover:text-earth-400 transition-colors">Our Philosophy</a></li>
              <li><a href="#gallery" className="text-forest-200/80 hover:text-earth-400 transition-colors">Gallery</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif text-xl mb-6 text-earth-300">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-earth-500 shrink-0 mt-1" />
                <span className="text-forest-200/80">Brgy 8-A, Brokenshire Heights,<br />Madapo, Davao City</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-earth-500 shrink-0" />
                <span className="text-forest-200/80">0953-347-1698 or 082-221-0487</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-earth-500 shrink-0" />
                <span className="text-forest-200/80">bihmi.info@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-xl mb-6 text-earth-300">Newsletter</h4>
            <p className="text-forest-200/80 mb-4">Subscribe to receive exclusive offers and updates from the forest.</p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-forest-800 border border-forest-700 text-white px-4 py-3 rounded-md focus:outline-none focus:border-earth-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-earth-500 hover:bg-earth-600 text-white px-4 py-3 rounded-md font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-forest-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-forest-300/60">
          <p>&copy; {new Date().getFullYear()} Brokenshire Hotel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-earth-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-earth-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
