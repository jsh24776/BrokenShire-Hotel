import { motion } from 'motion/react';
import { Leaf, Droplets, Sun } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Grid */}
          <div className="relative grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-4"
            >
              <img
                src="https://picsum.photos/seed/hotel-exterior/600/800"
                alt="Hotel exterior blending with nature"
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
                referrerPolicy="no-referrer"
              />
              <img
                src="https://picsum.photos/seed/hotel-lobby/600/600"
                alt="Serene hotel lobby"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4 mt-12"
            >
              <img
                src="https://picsum.photos/seed/hotel-garden/600/600"
                alt="Lush hotel gardens"
                className="w-full h-48 object-cover rounded-2xl shadow-lg"
                referrerPolicy="no-referrer"
              />
              <img
                src="https://picsum.photos/seed/hotel-details/600/800"
                alt="Nature-inspired details"
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Decorative Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-full shadow-xl z-10 hidden md:block"
            >
              <div className="w-24 h-24 border-2 border-earth-300 rounded-full flex items-center justify-center flex-col text-center">
                <span className="text-3xl font-serif text-forest-900">15</span>
                <span className="text-xs uppercase tracking-widest text-earth-600">Years</span>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="max-w-xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-earth-600 font-medium tracking-widest uppercase text-sm mb-4 block"
            >
              Our Philosophy
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-forest-900 mb-6 leading-tight"
            >
              Harmony Between Luxury and Nature
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-forest-700/80 text-lg leading-relaxed mb-10"
            >
              <p>
                At Brokenshire Hotel, we believe that true luxury lies in the seamless integration with the natural world. Our architecture, amenities, and services are all designed to foster a deep connection with the environment.
              </p>
              <p>
                From sustainable building materials to locally sourced organic cuisine, every aspect of your stay is curated to minimize our footprint while maximizing your comfort and tranquility.
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="bg-forest-100 p-3 rounded-full text-forest-700 mt-1">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-serif text-forest-900 mb-1">Eco-Friendly Practices</h4>
                  <p className="text-forest-700/70">Committed to sustainability and preserving our local ecosystem.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-earth-100 p-3 rounded-full text-earth-700 mt-1">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-serif text-forest-900 mb-1">Natural Springs</h4>
                  <p className="text-forest-700/70">Purified water sourced directly from underground aquifers.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-forest-100 p-3 rounded-full text-forest-700 mt-1">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-serif text-forest-900 mb-1">Solar Powered</h4>
                  <p className="text-forest-700/70">Harnessing the sun's energy to power our facilities sustainably.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
