import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Travel Blogger',
    content: 'An absolute haven of peace. The way the hotel integrates with the surrounding forest is breathtaking. The staff were incredibly attentive, and the organic restaurant exceeded all expectations.',
    rating: 5,
    image: 'https://picsum.photos/seed/sarah/150/150',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Architect',
    content: 'As someone who appreciates design, Brokenshire is a masterpiece. The use of natural light and sustainable materials creates an atmosphere of pure tranquility. I left feeling completely recharged.',
    rating: 5,
    image: 'https://picsum.photos/seed/michael/150/150',
  },
  {
    id: 3,
    name: 'Emily & David',
    role: 'Honeymooners',
    content: 'We spent our honeymoon here and it was magical. Waking up to the sound of birds and having breakfast on our private balcony overlooking the canopy was a dream come true.',
    rating: 5,
    image: 'https://picsum.photos/seed/emily-david/150/150',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-earth-100 relative overflow-hidden">
      {/* Decorative Leaf Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.83-54.627 54.627-.83-.83L54.627 0zM27.314 0l.83.83-27.314 27.314-.83-.83L27.314 0zM0 27.314l.83.83L0 28.974v-1.66zM54.627 60l.83-.83L60 54.627v1.66l-4.543 4.543h-.83zM0 54.627l.83.83L0 56.287v-1.66zM27.314 60l.83-.83L60 27.314v1.66l-31.856 31.856h-.83z\' fill=\'%232d553d\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E")' }}></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-earth-600 font-medium tracking-widest uppercase text-sm mb-4 block"
          >
            Guest Experiences
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-serif text-forest-900 mb-6"
          >
            Whispers from the Forest
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm relative"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-earth-200/50" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-earth-500 text-earth-500" />
                ))}
              </div>
              
              <p className="text-forest-800/80 italic mb-8 leading-relaxed relative z-10">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-serif text-lg font-semibold text-forest-900">{testimonial.name}</h4>
                  <span className="text-sm text-earth-600">{testimonial.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
