
import { motion } from "framer-motion";
import { Shield, Truck, Package, RefreshCw } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: "Trusted Supplier",
    desc: "Serving hospitality businesses across Eswatini",
  },
  {
    icon: Package,
    title: "Bulk Orders",
    desc: "Wholesale quantities for properties of every size",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    desc: "Dependable local delivery across the country",
  },
  {
    icon: RefreshCw,
    title: "Consistent Restocking",
    desc: "Keep your guest amenities supplied and ready",
  },
];

const TrustIndicators = () => (
  <section className="relative overflow-hidden border-b border-[#17352D]/10 bg-[#F8F4EA] py-16 md:py-20">
    {/* Ambient Gold Detail */}
    <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#B99A5B]/[0.07] blur-3xl" />
    <div className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-[#17352D]/[0.035] blur-3xl" />

    <div className="container relative z-10 mx-auto px-5 sm:px-6 lg:px-8">
      {/* Section Intro */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{
          duration: 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="mb-12 text-center md:mb-14"
      >
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[#B99A5B]" />
          <span className="font-body text-[9px] font-semibold uppercase tracking-[0.25em] text-[#B99A5B]">
            Hospitality Supply
          </span>
          <span className="h-px w-8 bg-[#B99A5B]" />
        </div>

        <h2
          className="font-serif text-2xl font-medium tracking-[-0.02em] text-[#17352D] sm:text-3xl"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Designed for the Way Hospitality Works.
        </h2>

        <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-6 text-[#17352D]/60">
          From your first order to ongoing restocking, Milan_sz is built around
          the practical needs of accommodation businesses.
        </p>
      </motion.div>

      {/* Indicators */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#17352D]/10 bg-[#17352D]/10 sm:grid-cols-2 lg:grid-cols-4">
        {indicators.map((item, i) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative bg-[#FCFCFA] px-6 py-9 text-center transition-colors duration-300 hover:bg-white md:px-7 md:py-10"
            >
              {/* Gold hover line */}
              <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[#B99A5B] transition-transform duration-500 group-hover:scale-x-100" />

              {/* Icon */}
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.25 }}
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#B99A5B]/25 bg-[#F8F4EA] transition-all duration-300 group-hover:border-[#B99A5B]/50 group-hover:bg-[#B99A5B]/10"
              >
                <Icon
                  size={22}
                  strokeWidth={1.45}
                  className="text-[#B99A5B]"
                />
              </motion.div>

              {/* Number */}
              <span className="font-body text-[8px] font-semibold uppercase tracking-[0.22em] text-[#B99A5B]/70">
                0{i + 1}
              </span>

              {/* Title */}
              <h3
                className="mt-2 font-serif text-lg font-medium text-[#17352D]"
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p className="mx-auto mt-2 max-w-[220px] font-body text-xs leading-5 text-[#17352D]/55">
                {item.desc}
              </p>

              {/* Bottom detail */}
              <div className="mx-auto mt-6 h-px w-8 bg-[#B99A5B]/35 transition-all duration-300 group-hover:w-14 group-hover:bg-[#B99A5B]" />
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Brand Statement */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="mt-10 flex items-center justify-center gap-3"
      >
        <span className="h-px w-6 bg-[#B99A5B]/50" />

        <p className="font-body text-[9px] font-medium uppercase tracking-[0.2em] text-[#17352D]/45 sm:text-[10px]">
          Your property. Your brand. Every guest detail.
        </p>

        <span className="h-px w-6 bg-[#B99A5B]/50" />
      </motion.div>
    </div>
  </section>
);

export default TrustIndicators;
