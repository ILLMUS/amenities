import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import bodyWashImg from "@/assets/product-body-wash.jpg";

const points = [
  "Premium guest amenities for hotels, lodges and hospitality properties",
  "Professionally branded products that reflect your property's identity",
  "Custom amenity collections tailored to your brand and guest experience",
  "35ml professionally presented amenities for individual guest use",
  "Flexible quantities and product selections for hospitality establishments",
  "Reliable supply and long-term partnerships with accommodation businesses",
];

const About = () => (
  <section id="about" className="gradient-dark relative overflow-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[650px] items-stretch">
      
      {/* LEFT SIDE: 50% Full-bleed Image */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative w-full h-64 sm:h-96 lg:h-auto min-h-full overflow-hidden"
      >
        <img
          src={bodyWashImg}
          alt="Milan Body Wash Amenity"
          className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
        />
        {/* Subtle Dark Vignette Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40 lg:to-black/60 pointer-events-none" />
      </motion.div>

      {/* RIGHT SIDE: 50% Content */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="flex flex-col justify-center px-8 py-16 sm:px-12 md:px-16 lg:px-20 xl:px-24"
      >
        <span className="font-body text-xs font-light uppercase tracking-[0.3em] text-gold">
          About Milan_sz
        </span>

        <h2 className="mt-3 font-heading text-3xl font-bold text-primary-foreground md:text-4xl xl:text-5xl leading-tight">
          Elevating the Guest Experience
        </h2>

        <p className="mt-6 font-body text-base md:text-lg font-light leading-relaxed text-primary-foreground/80">
          Milan_sz provides premium guest amenities and hospitality solutions
          designed to help hotels, lodges, boutique properties and other
          accommodation establishments create a more refined and memorable
          guest experience.
        </p>

        <p className="mt-4 font-body text-sm md:text-base font-light leading-relaxed text-primary-foreground/60">
          From professionally branded 35ml amenities to flexible product
          collections, we help hospitality businesses transform everyday
          guest essentials into a seamless extension of their brand.
        </p>

        {/* Checkpoints Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle
                className="mt-0.5 shrink-0 text-gold"
                size={18}
              />
              <span className="font-body text-xs md:text-sm text-primary-foreground/80 leading-snug">
                {point}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  </section>
);

export default About;