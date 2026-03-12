import { motion } from 'motion/react';
import { BedDouble, Users, Wifi, Coffee } from 'lucide-react';

const rooms = [
  {
    id: 1,
    name: 'Forest View Suite',
    description: 'Wake up to the serene sounds of nature in our spacious suite featuring panoramic forest views and a private balcony.',
    price: 250,
    image: 'https://picsum.photos/seed/forest-room/800/600',
    amenities: ['King Bed', '2 Guests', 'Free Wi-Fi', 'Breakfast'],
  },
  {
    id: 2,
    name: 'Garden Retreat',
    description: 'A cozy and elegant room nestled by our botanical gardens, perfect for a peaceful getaway with direct garden access.',
    price: 180,
    image: 'https://picsum.photos/seed/garden-room/800/600',
    amenities: ['Queen Bed', '2 Guests', 'Free Wi-Fi', 'Breakfast'],
  },
  {
    id: 3,
    name: 'Canopy Family Villa',
    description: 'Ideal for families, this expansive villa offers multiple bedrooms, a private lounge, and stunning views of the tree canopy.',
    price: 450,
    image: 'https://picsum.photos/seed/family-villa/800/600',
    amenities: ['2 King Beds', '4 Guests', 'Free Wi-Fi', 'Breakfast'],
  },
];

export default function Rooms() {
  return (
    <section id="rooms" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-earth-600 font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            Our Accommodations
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-forest-900 mb-6"
          >
            Rest in Nature's Embrace
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-forest-700/80 max-w-2xl mx-auto text-lg"
          >
            Each of our rooms is thoughtfully designed to blend seamlessly with the surrounding environment, offering comfort without compromising the natural aesthetic.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-earth-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                  <span className="font-serif font-semibold text-forest-900">${room.price}</span>
                  <span className="text-xs text-forest-700/70 uppercase tracking-wider ml-1">/ night</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-serif text-forest-900 mb-3 group-hover:text-earth-600 transition-colors">
                  {room.name}
                </h3>
                <p className="text-forest-700/80 mb-6 flex-grow leading-relaxed">
                  {room.description}
                </p>

                {/* Amenities */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8 pt-6 border-t border-earth-200">
                  <div className="flex items-center gap-2 text-sm text-forest-800">
                    <BedDouble className="w-4 h-4 text-earth-500" />
                    <span>{room.amenities[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-forest-800">
                    <Users className="w-4 h-4 text-earth-500" />
                    <span>{room.amenities[1]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-forest-800">
                    <Wifi className="w-4 h-4 text-earth-500" />
                    <span>{room.amenities[2]}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-forest-800">
                    <Coffee className="w-4 h-4 text-earth-500" />
                    <span>{room.amenities[3]}</span>
                  </div>
                </div>

                <a
                  href="#book"
                  className="block w-full text-center py-3 border border-forest-900 text-forest-900 rounded-full font-medium transition-all hover:bg-forest-900 hover:text-white"
                >
                  View Details
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
