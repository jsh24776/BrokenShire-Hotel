import { motion } from 'motion/react';
import { Waves, Flower2, UtensilsCrossed, Dumbbell } from 'lucide-react';

const facilities = [
  {
    id: 1,
    title: 'Infinity Pool',
    description: 'Swim amidst the treetops in our temperature-controlled infinity pool.',
    icon: Waves,
    image: 'src/imgs/istockphoto-157511761-612x612.jpg',
  },
  {
    id: 2,
    title: 'Botanical Spa',
    description: 'Rejuvenate your senses with treatments inspired by local flora.',
    icon: Flower2,
    image: 'src/imgs/thumb-1920-541029.jpg',
  },
  {
    id: 3,
    title: 'Organic Restaurant',
    description: 'Savor farm-to-table cuisine crafted from our very own gardens.',
    icon: UtensilsCrossed,
    image: 'src/imgs/photo-1600093463592-8e36ae95ef56.avif',
  },
  {
    id: 4,
    title: 'Wellness Center',
    description: 'Stay active with state-of-the-art equipment and yoga sessions.',
    icon: Dumbbell,
    image: 'src/imgs/shutterstock_49617541.webp',
  },
];

export default function Facilities() {
  return (
    <section id="facilities" className="py-24 bg-forest-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-forest-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-earth-300/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-earth-600 font-medium tracking-widest uppercase text-sm mb-4 block"
            >
              Experience
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif text-forest-900 mb-6"
            >
              World-Class Facilities
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-forest-700/80 text-lg leading-relaxed"
            >
              Discover a range of amenities designed to enhance your stay, from relaxing spa treatments to invigorating outdoor activities.
            </motion.p>
          </div>
          <motion.a
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            href="#all-facilities"
            className="hidden md:inline-flex items-center gap-2 text-forest-800 font-medium hover:text-earth-600 transition-colors border-b border-transparent hover:border-earth-600 pb-1"
          >
            Explore All Facilities
          </motion.a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={facility.image}
                alt={facility.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/40 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="bg-white/20 backdrop-blur-md w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white border border-white/30 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <facility.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif text-white mb-2 transform transition-transform duration-500 group-hover:-translate-y-2">
                  {facility.title}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  {facility.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
          <a
            href="#all-facilities"
            className="inline-flex items-center gap-2 text-forest-800 font-medium hover:text-earth-600 transition-colors border-b border-forest-800 hover:border-earth-600 pb-1"
          >
            Explore All Facilities
          </a>
        </div>
      </div>
    </section>
  );
}
