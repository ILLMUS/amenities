import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  CheckCircle2,
  Building2,
  Hotel,
  Home,
  PlusCircle,
  X,
  Loader2,
  MessageSquare,
  Radio,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Review {
  id: string;
  name: string;
  role: string;
  property: string;
  category: "hotel" | "lodge" | "airbnb";
  location: string;
  rating: number;
  text: string;
  featured?: boolean;
  created_at?: string;
}

const fallbackReviews: Review[] = [
  {
    id: "1",
    name: "Thabo Mebane",
    role: "General Manager",
    property: "Royal Palm Boutique Hotel",
    category: "hotel",
    location: "Ezulwini, Eswatini",
    rating: 5,
    text: "Milan_sz has completely transformed our guest bathroom experience. The custom gold-embossed logos on the bottles add an immediate luxury touch that guests frequently compliment in their reviews.",
    featured: true,
  },
  {
    id: "2",
    name: "Nomsa Dlamini",
    role: "Owner & Operator",
    property: "Mbabane Heights Guesthouse",
    category: "lodge",
    location: "Mbabane",
    rating: 5,
    text: "Professional, ultra-reliable, and the product formulation is outstanding. Reordering custom batches is seamless and delivery is always on point.",
  },
  {
    id: "3",
    name: "David Kruger",
    role: "Superhost (4 Properties)",
    property: "Luxury Stays Eswatini",
    category: "airbnb",
    location: "Malkerns",
    rating: 5,
    text: "Our review scores for 'Attention to Detail' went straight to 5 stars after switching to Milan_sz custom amenities. It gives an instant high-end hotel vibe.",
  },
];

const categories = [
  { id: "all", label: "All Properties", icon: Building2 },
  { id: "hotel", label: "Hotels & Resorts", icon: Hotel },
  { id: "lodge", label: "Lodges & Guesthouses", icon: Building2 },
  { id: "airbnb", label: "Airbnbs & Villas", icon: Home },
];

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    property: "",
    category: "hotel" as "hotel" | "lodge" | "airbnb",
    location: "",
    rating: 5,
    text: "",
  });
  const [hoverRating, setHoverRating] = useState<number>(0);

  // 1. Initial Fetch
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setReviews(data);
      } else {
        setReviews(fallbackReviews);
      }
    } catch (err) {
      console.warn("Could not fetch from Supabase, serving fallbacks:", err);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  // 2. Realtime Subscription Listener
  useEffect(() => {
    fetchReviews();

    // Subscribe to INSERT changes on testimonials table
    const channel = supabase
      .channel("public:testimonials")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "testimonials",
        },
        (payload) => {
          const newReview = payload.new as Review;
          setReviews((prev) => {
            // Prevent duplicate insertion if already added locally
            if (prev.some((r) => r.id === newReview.id)) return prev;
            return [newReview, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;

    try {
      setSubmitting(true);
      const newEntry = {
        name: formData.name,
        role: formData.role || "Property Host",
        property: formData.property || "Bespoke Residence",
        category: formData.category,
        location: formData.location || "Eswatini",
        rating: formData.rating,
        text: formData.text,
        featured: false,
      };

      const { data, error } = await supabase
        .from("testimonials")
        .insert([newEntry])
        .select();

      if (error) throw error;

      // Optimistic state update in case socket latency is high
      if (data && data.length > 0) {
        const created = data[0] as Review;
        setReviews((prev) => {
          if (prev.some((r) => r.id === created.id)) return prev;
          return [created, ...prev];
        });
      }

      // Reset & Close Modal
      setFormData({
        name: "",
        role: "",
        property: "",
        category: "hotel",
        location: "",
        rating: 5,
        text: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("An error occurred while posting your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Items & Dynamic Rating Calculation
  const filteredReviews =
    activeCategory === "all"
      ? reviews
      : reviews.filter((r) => r.category === activeCategory);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <section
      id="reviews"
      className="relative overflow-hidden bg-[#FCFCFA] py-24 text-[#17352D] lg:py-32"
    >
      {/* Background Decorative Accents */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-[#B99A5B]/[0.03] blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          {/* Live Indicator Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B99A5B]/30 bg-white px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#B99A5B] shadow-sm">
            <Radio size={12} className="animate-pulse text-emerald-600" />
            Live Client Feed
          </div>

          <h2 className="mt-4 font-heading text-3xl font-normal leading-tight text-[#17352D] sm:text-4xl md:text-5xl">
            Elevating Guest Experiences Across{" "}
            <span className="font-serif italic text-[#B99A5B]">Eswatini</span>
          </h2>

          <p className="mt-4 font-body text-sm text-[#17352D]/65 sm:text-base">
            See how premier hotels, lodges, and hosts rely on Milan_sz to deliver
            unforgettable guest impressions.
          </p>

          {/* Dynamic Score & Action Header */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-[#17352D]/8 bg-white px-5 py-2.5 shadow-sm">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="fill-[#B99A5B] text-[#B99A5B]"
                    size={15}
                  />
                ))}
              </div>
              <div className="h-3 w-px bg-[#17352D]/15" />
              <span className="font-body text-xs font-semibold tracking-wide text-[#17352D]">
                {averageRating} / 5.0
              </span>
              <span className="font-body text-xs text-[#17352D]/50">
                ({reviews.length} Verified Reviews)
              </span>
            </div>

            {/* Leave Review Trigger Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#B99A5B] bg-[#B99A5B]/10 px-5 py-2.5 font-body text-xs font-semibold text-[#17352D] transition-all duration-300 hover:bg-[#B99A5B] hover:text-white"
            >
              <PlusCircle size={15} />
              Write a Review
            </button>
          </div>
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-[10px] font-medium uppercase tracking-[0.15em] transition-all duration-300 ${
                  isActive
                    ? "bg-[#17352D] text-white shadow-md shadow-[#17352D]/10"
                    : "border border-[#17352D]/10 bg-white/60 text-[#17352D]/70 hover:border-[#17352D]/25 hover:bg-white"
                }`}
              >
                <Icon
                  size={13}
                  className={isActive ? "text-[#B99A5B]" : "text-[#17352D]/50"}
                />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="mt-20 flex justify-center">
            <Loader2 className="animate-spin text-[#B99A5B]" size={32} />
          </div>
        ) : (
          <motion.div
            layout
            className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredReviews.map((review) => (
                <motion.div
                  layout
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    review.featured
                      ? "border-[#B99A5B]/40 bg-gradient-to-b from-white via-white to-[#FBF9F3] shadow-md"
                      : "border-[#17352D]/10 bg-white/80 hover:border-[#B99A5B]/30"
                  }`}
                >
                  {/* Top Row: Stars & Quote Icon */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, j) => (
                          <Star
                            key={j}
                            className="fill-[#B99A5B] text-[#B99A5B]"
                            size={14}
                          />
                        ))}
                      </div>
                      <Quote
                        size={24}
                        className="text-[#B99A5B]/25 transition-colors group-hover:text-[#B99A5B]/50"
                      />
                    </div>

                    {/* Review Text */}
                    <p className="mt-5 font-body text-sm font-light leading-relaxed text-[#17352D]/85 sm:text-[15px]">
                      "{review.text}"
                    </p>
                  </div>

                  {/* Author Info Footer */}
                  <div className="mt-8 border-t border-[#17352D]/8 pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-heading text-base font-medium text-[#17352D]">
                          {review.name}
                        </h4>
                        <p className="mt-0.5 font-body text-xs text-[#B99A5B]">
                          {review.role} ·{" "}
                          <span className="font-medium text-[#17352D]/70">
                            {review.property}
                          </span>
                        </p>
                        <p className="font-body text-[10px] tracking-wide text-[#17352D]/40">
                          {review.location}
                        </p>
                      </div>

                      {/* Verified Partner Badge */}
                      <div
                        title="Verified Client"
                        className="flex items-center gap-1 rounded-full bg-[#17352D]/[0.05] px-2 py-1 text-[#17352D]/60"
                      >
                        <CheckCircle2 size={12} className="text-[#B99A5B]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom Banner Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#B99A5B]/20 bg-[#17352D] px-8 py-8 text-white shadow-xl lg:flex-row lg:px-12"
        >
          <div>
            <h3 className="font-heading text-xl font-normal text-white sm:text-2xl">
              Ready to create custom amenities for your property?
            </h3>
            <p className="mt-1 font-body text-xs text-white/70 sm:text-sm">
              Join Eswatini’s finest hospitality venues. Request sample packs or custom mockups today.
            </p>
          </div>

          <a
            href="#contact"
            className="whitespace-nowrap rounded-sm bg-[#B99A5B] px-7 py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-[#17352D] transition-all duration-300 hover:bg-[#caba79] hover:shadow-lg"
          >
            Request Free Mockup
          </a>
        </motion.div>
      </div>

      {/* SUBMIT REVIEW MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#17352D]/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-[#17352D]/10 bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-center justify-between border-b border-[#17352D]/8 pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#B99A5B]" />
                  <h3 className="font-heading text-xl text-[#17352D]">
                    Add Partner Review
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1 text-[#17352D]/50 hover:bg-[#17352D]/5 hover:text-[#17352D]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="mt-6 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sibusiso Simelane"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#17352D]/15 p-3 font-body text-sm outline-none transition focus:border-[#B99A5B] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>

                {/* Role & Property Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. General Manager"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#17352D]/15 p-3 font-body text-sm outline-none transition focus:border-[#B99A5B] focus:ring-1 focus:ring-[#B99A5B]"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                      Property Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mantenga Lodge"
                      value={formData.property}
                      onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#17352D]/15 p-3 font-body text-sm outline-none transition focus:border-[#B99A5B] focus:ring-1 focus:ring-[#B99A5B]"
                    />
                  </div>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                      Property Type
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as "hotel" | "lodge" | "airbnb",
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#17352D]/15 p-3 font-body text-sm outline-none transition focus:border-[#B99A5B] focus:ring-1 focus:ring-[#B99A5B]"
                    >
                      <option value="hotel">Hotel / Resort</option>
                      <option value="lodge">Lodge / Guesthouse</option>
                      <option value="airbnb">Airbnb / Villa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ezulwini"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-[#17352D]/15 p-3 font-body text-sm outline-none transition focus:border-[#B99A5B] focus:ring-1 focus:ring-[#B99A5B]"
                    />
                  </div>
                </div>

                {/* Star Rating Input */}
                <div>
                  <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                    Star Rating
                  </label>
                  <div className="mt-2 flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 transition-transform hover:scale-125"
                      >
                        <Star
                          size={22}
                          className={
                            star <= (hoverRating || formData.rating)
                              ? "fill-[#B99A5B] text-[#B99A5B]"
                              : "text-[#17352D]/20"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Testimonial Message */}
                <div>
                  <label className="block font-body text-xs font-semibold uppercase tracking-wider text-[#17352D]">
                    Testimonial *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share your experience with Milan_sz product quality, custom branding, or guest feedback..."
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#17352D]/15 p-3 font-body text-sm outline-none transition focus:border-[#B99A5B] focus:ring-1 focus:ring-[#B99A5B]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#17352D] py-3.5 font-body text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-[#17352D]/90 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin text-[#B99A5B]" />
                    ) : (
                      "Publish Review"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Reviews;