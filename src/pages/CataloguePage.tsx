import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Search,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { products, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
// Adjust this import path to match your Supabase client setup
import { supabase } from "@/lib/supabaseClient"; 

type CatalogueProduct = (typeof products)[number];

interface ProductStats {
  likes: number;
  dislikes: number;
  rating: number;
  reviewCount: number;
}

const fallbackStats: ProductStats = {
  likes: 0,
  dislikes: 0,
  rating: 5,
  reviewCount: 0,
};

const Catalogue = () => {
  const { setOpen } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<CatalogueProduct>(
    products[0]
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Record<string, ProductStats>>({});
  const [userReaction, setUserReaction] = useState<
    Record<string, "like" | "dislike" | null>
  >({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [hoverRating, setHoverRating] = useState(0);
  const [enquiryItems, setEnquiryItems] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  // -------------------------------------------------------------
  // 1. PULL STATS & RATINGS FROM SUPABASE ON MOUNT
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        setLoadingStats(true);
        
        // Fetch product stats summary from Supabase 'product_stats' table
        const { data, error } = await supabase
          .from("product_stats")
          .select("product_id, likes, dislikes, rating, review_count");

        if (error) {
          console.error("Error fetching product stats from Supabase:", error);
          return;
        }

        if (data) {
          const statsMap: Record<string, ProductStats> = {};
          data.forEach((item: any) => {
            statsMap[item.product_id] = {
              likes: item.likes ?? 0,
              dislikes: item.dislikes ?? 0,
              rating: Number(item.rating ?? 5),
              reviewCount: item.review_count ?? 0,
            };
          });
          setStats(statsMap);
        }
      } catch (err) {
        console.error("Unexpected error loading Supabase data:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProductStats();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.range)))],
    []
  );

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "All" || product.range === activeCategory;

      const searchMatch =
        !query ||
        [product.title, product.description, product.range]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, searchQuery]);

  const activeStats = stats[selectedProduct.id] ?? fallbackStats;
  const selectedReaction = userReaction[selectedProduct.id];
  const selectedRating = userRatings[selectedProduct.id] ?? 0;

  const selectProduct = (product: CatalogueProduct) => {
    setSelectedProduct(product);
    window.requestAnimationFrame(() => {
      document
        .getElementById("catalogue-inspector")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // -------------------------------------------------------------
  // 2. TOGGLE REACTION (LIKES / DISLIKES) WITH SUPABASE SAVE
  // -------------------------------------------------------------
  const toggleReaction = async (id: string, type: "like" | "dislike") => {
    const current = userReaction[id];
    const base = stats[id] ?? fallbackStats;

    let likes = base.likes;
    let dislikes = base.dislikes;

    if (current === type) {
      if (type === "like") likes -= 1;
      else dislikes -= 1;
    } else {
      if (type === "like") {
        likes += 1;
        if (current === "dislike") dislikes -= 1;
      } else {
        dislikes += 1;
        if (current === "like") likes -= 1;
      }
    }

    const updatedStat = { ...base, likes, dislikes };

    // Optimistic UI update
    setStats((prev) => ({ ...prev, [id]: updatedStat }));
    setUserReaction((prev) => ({
      ...prev,
      [id]: current === type ? null : type,
    }));

    // Save to Supabase
    try {
      const { error } = await supabase.from("product_stats").upsert({
        product_id: id,
        likes: updatedStat.likes,
        dislikes: updatedStat.dislikes,
        rating: updatedStat.rating,
        review_count: updatedStat.reviewCount,
      });

      if (error) {
        console.error("Error updating reactions in Supabase:", error);
      }
    } catch (err) {
      console.error("Failed to persist reaction to Supabase:", err);
    }
  };

  // -------------------------------------------------------------
  // 3. RATE PRODUCT WITH SUPABASE SAVE
  // -------------------------------------------------------------
  const rateProduct = async (id: string, rating: number) => {
    const base = stats[id] ?? fallbackStats;
    const previousTotal = base.rating * base.reviewCount;
    const existingRating = userRatings[id];

    let newAverage: number;
    let newCount: number;

    if (existingRating) {
      newCount = base.reviewCount;
      newAverage =
        base.reviewCount > 0
          ? Number(
              (
                (previousTotal - existingRating + rating) /
                base.reviewCount
              ).toFixed(1)
            )
          : rating;
    } else {
      newCount = base.reviewCount + 1;
      newAverage = Number(((previousTotal + rating) / newCount).toFixed(1));
    }

    const updatedStat: ProductStats = {
      ...base,
      rating: newAverage,
      reviewCount: newCount,
    };

    // Optimistic UI updates
    setUserRatings((prev) => ({ ...prev, [id]: rating }));
    setStats((prev) => ({ ...prev, [id]: updatedStat }));

    // Persist to Supabase
    try {
      const { error } = await supabase.from("product_stats").upsert({
        product_id: id,
        likes: updatedStat.likes,
        dislikes: updatedStat.dislikes,
        rating: updatedStat.rating,
        review_count: updatedStat.reviewCount,
      });

      if (error) {
        console.error("Error saving rating to Supabase:", error);
      }
    } catch (err) {
      console.error("Failed to save rating to Supabase:", err);
    }
  };

  const toggleEnquiry = (id: string) => {
    setEnquiryItems((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const shareCatalogue = async () => {
    const shareData = {
      title: "Milan_sz Luxury Hospitality Catalogue",
      text: "Explore Milan_sz accommodation amenities and hospitality supplies.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 1800);
      }
    } catch {
      // Sharing was cancelled or unavailable.
    }
  };

  return (
    <div
      id="catalogue-top"
      className="min-h-screen bg-[#FCFCFA] text-[#17352D]"
    >
      <Navbar />

      <main className="pt-[76px]">
        {/* COLLECTION CONTROLS */}
        <section className="container mx-auto px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#17352D]/10 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.15em] transition-all ${
                      activeCategory === category
                        ? "bg-[#17352D] text-white shadow-md"
                        : "bg-[#F7F6F1] text-[#17352D]/60 hover:bg-[#17352D]/10"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:max-w-xs">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#17352D]/35"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search collection..."
                  aria-label="Search products"
                  className="h-10 w-full rounded-full border border-[#17352D]/10 bg-[#F7F6F1]/70 pl-10 pr-10 font-body text-xs text-[#17352D] outline-none transition-all placeholder:text-[#17352D]/35 focus:border-[#B99A5B] focus:ring-2 focus:ring-[#B99A5B]/15"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#17352D]/40 hover:text-[#17352D]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT INSPECTOR */}
        <section
          id="catalogue-inspector"
          className="container mx-auto scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8"
        >
          <div className="overflow-hidden rounded-[28px] border border-[#17352D]/10 bg-white shadow-2xl shadow-[#17352D]/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProduct.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12"
              >
                {/* IMAGE */}
                <div className="relative min-h-[360px] bg-[#F7F6F1] p-4 sm:p-7 lg:col-span-6 lg:min-h-[620px] lg:p-8">
                  <div className="absolute left-7 top-7 z-10 flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B99A5B]" />
                    <span className="font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#17352D]">
                      {selectedProduct.range}
                    </span>
                  </div>

                  <div className="absolute right-7 top-7 z-10 rounded-full border border-[#B99A5B]/25 bg-white/90 px-3 py-1.5 backdrop-blur-md">
                    <span className="font-body text-[9px] font-semibold uppercase tracking-widest text-[#B99A5B]">
                      {selectedProduct.unit}
                    </span>
                  </div>

                  <div className="h-full min-h-[328px] overflow-hidden rounded-[22px]">
                    <motion.img
                      initial={{ scale: 0.96, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.45 }}
                      src={selectedProduct.image}
                      alt={selectedProduct.title}
                      className="h-full min-h-[328px] w-full object-cover transition-transform duration-700 hover:scale-[1.035]"
                    />
                  </div>

                  <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between rounded-2xl border border-white/60 bg-white/85 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17352D]">
                        <Package size={16} className="text-[#B99A5B]" />
                      </div>
                      <div>
                        <p className="font-body text-[10px] font-semibold uppercase tracking-wider text-[#17352D]">
                          Property supply
                        </p>
                        <p className="font-body text-[9px] text-[#17352D]/50">
                          Branding available
                        </p>
                      </div>
                    </div>
                    <span className="font-body text-[9px] font-bold uppercase tracking-widest text-[#B99A5B]">
                      Premium
                    </span>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-6 lg:p-12">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center rounded-md bg-[#B99A5B]/10 px-2.5 py-1 font-body text-[9px] font-bold uppercase tracking-[0.18em] text-[#B99A5B]">
                        {selectedProduct.range}
                      </span>

                      <div className="flex items-center gap-2 rounded-full bg-[#F7F6F1] px-3 py-1.5">
                        <Star
                          size={13}
                          className="fill-[#B99A5B] text-[#B99A5B]"
                        />
                        <span className="font-body text-xs font-semibold">
                          {activeStats.rating.toFixed(1)}
                        </span>
                        <span className="font-body text-[10px] text-[#17352D]/45">
                          {activeStats.reviewCount} reviews
                        </span>
                      </div>
                    </div>

                    <h2 className="mt-5 max-w-xl font-heading text-3xl font-normal leading-tight sm:text-5xl">
                      {selectedProduct.title}
                    </h2>

                    <div className="mt-5 flex flex-wrap items-baseline gap-2">
                      <span className="font-heading text-3xl font-semibold sm:text-4xl">
                        {formatPrice(selectedProduct.price)}
                      </span>
                      <span className="font-body text-xs text-[#17352D]/50">
                        {selectedProduct.unit}
                      </span>
                    </div>

                    <p className="mt-5 max-w-xl font-body text-sm font-light leading-7 text-[#17352D]/70">
                      {selectedProduct.description}
                    </p>

                    {"highlights" in selectedProduct &&
                      Array.isArray(selectedProduct.highlights) && (
                        <div className="mt-6 flex flex-wrap gap-2">
                          {selectedProduct.highlights.map(
                            (highlight: string) => (
                              <span
                                key={highlight}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#17352D]/10 bg-[#F7F6F1]/70 px-3 py-2 font-body text-[10px] text-[#17352D]/70"
                              >
                                <CheckCircle2
                                  size={12}
                                  className="text-[#B99A5B]"
                                />
                                {highlight}
                              </span>
                            )
                          )}
                        </div>
                      )}

                    <div className="mt-7 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[#17352D]/10 bg-[#F7F6F1]/60 p-4">
                        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-[#17352D]/40">
                          Minimum order
                        </p>
                        <p className="mt-2 font-heading text-xl">
                          {selectedProduct.moq}
                        </p>
                        <p className="mt-0.5 font-body text-[10px] text-[#17352D]/45">
                          units
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#17352D]/10 bg-[#F7F6F1]/60 p-4">
                        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-[#17352D]/40">
                          Batch increment
                        </p>
                        <p className="mt-2 font-heading text-xl">
                          +{selectedProduct.step}
                        </p>
                        <p className="mt-0.5 font-body text-[10px] text-[#17352D]/45">
                          units
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FEEDBACK */}
                  <div className="mt-8 border-t border-[#17352D]/10 pt-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-[#17352D]/40">
                          Guest feedback
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toggleReaction(selectedProduct.id, "like")
                            }
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-body text-xs transition-all ${
                              selectedReaction === "like"
                                ? "border-[#17352D] bg-[#17352D] text-white"
                                : "border-[#17352D]/10 hover:bg-[#F7F6F1]"
                            }`}
                          >
                            <ThumbsUp size={14} />
                            {activeStats.likes}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              toggleReaction(selectedProduct.id, "dislike")
                            }
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-body text-xs transition-all ${
                              selectedReaction === "dislike"
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-[#17352D]/10 hover:bg-[#F7F6F1]"
                            }`}
                          >
                            <ThumbsDown size={14} />
                            {activeStats.dislikes}
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-body text-[9px] font-semibold uppercase tracking-[0.18em] text-[#17352D]/40">
                          {selectedRating ? "Your rating" : "Rate this item"}
                        </p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const current =
                              hoverRating || selectedRating;

                            return (
                              <button
                                key={star}
                                type="button"
                                aria-label={`Rate ${star} out of 5`}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() =>
                                  rateProduct(selectedProduct.id, star)
                                }
                                className="p-0.5 transition-transform hover:scale-125"
                              >
                                <Star
                                  size={17}
                                  className={
                                    star <= current
                                      ? "fill-[#B99A5B] text-[#B99A5B]"
                                      : "text-[#17352D]/15"
                                  }
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* PRIMARY ACTIONS */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => toggleEnquiry(selectedProduct.id)}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] transition-all ${
                          enquiryItems.includes(selectedProduct.id)
                            ? "border-[#17352D] bg-[#17352D] text-white"
                            : "border-[#17352D]/15 bg-white hover:bg-[#F7F6F1]"
                        }`}
                      >
                        <Package size={14} />
                        {enquiryItems.includes(selectedProduct.id)
                          ? "Added to enquiry"
                          : "Add to enquiry"}
                      </button>

                      <a
                        href="#contact"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B99A5B] px-5 py-3.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-[#17352D] transition-all hover:bg-[#caba79] hover:shadow-lg"
                      >
                        Request quotation
                        <ArrowRight size={14} />
                      </a>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={shareCatalogue}
                        className="inline-flex items-center gap-2 font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-[#17352D]/45 transition-colors hover:text-[#B99A5B]"
                      >
                        <Share2 size={13} />
                        {shareCopied ? "Link copied" : "Share catalogue"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-[#17352D]/45 hover:text-[#B99A5B]"
                      >
                        View enquiry bag
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* COLLECTION GRID */}
        <section className="container mx-auto px-4 pb-28 sm:px-6 lg:px-8">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-body text-[9px] font-semibold uppercase tracking-[0.2em] text-[#B99A5B]">
                The collection
              </p>
              <h3 className="mt-1 font-heading text-2xl sm:text-3xl">
                Explore the collection
              </h3>
            </div>

            <p className="font-body text-xs text-[#17352D]/45">
              {visibleProducts.length} item
              {visibleProducts.length === 1 ? "" : "s"} shown
            </p>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProducts.map((product, index) => {
                const isSelected = product.id === selectedProduct.id;
                const productStat = stats[product.id] ?? fallbackStats;
                const isInEnquiry = enquiryItems.includes(product.id);

                return (
                  <motion.article
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => selectProduct(product)}
                    className={`group cursor-pointer rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-1 ${
                      isSelected
                        ? "border-[#B99A5B] bg-white shadow-xl ring-2 ring-[#B99A5B]/15"
                        : "border-[#17352D]/10 bg-white hover:border-[#17352D]/20 hover:shadow-lg"
                    }`}
                  >
                    <div className="relative aspect-[0.95] overflow-hidden rounded-xl bg-[#F7F6F1]">
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 backdrop-blur-md">
                        <span className="font-body text-[8px] font-bold uppercase tracking-wider text-[#B99A5B]">
                          {product.range}
                        </span>
                      </div>

                      <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-md">
                        <Star
                          size={10}
                          className="fill-[#B99A5B] text-[#B99A5B]"
                        />
                        <span className="font-body text-[9px] font-semibold">
                          {productStat.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleEnquiry(product.id);
                          }}
                          className={`w-full rounded-xl px-3 py-2.5 font-body text-[9px] font-semibold uppercase tracking-[0.15em] shadow-lg backdrop-blur-md ${
                            isInEnquiry
                              ? "bg-[#17352D] text-white"
                              : "bg-white/90 text-[#17352D]"
                          }`}
                        >
                          {isInEnquiry
                            ? "Added to enquiry"
                            : "Add to enquiry"}
                        </button>
                      </div>
                    </div>

                    <div className="px-1 pb-1 pt-4">
                      <h4 className="min-h-[42px] font-heading text-base font-medium leading-5">
                        {product.title}
                      </h4>

                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="font-heading text-lg font-semibold">
                            {formatPrice(product.price)}
                          </p>
                          <p className="font-body text-[9px] text-[#17352D]/40">
                            {product.unit} · MOQ {product.moq}
                          </p>
                        </div>

                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F6F1] text-[#17352D] transition-all group-hover:bg-[#17352D] group-hover:text-white">
                          <ArrowRight size={14} />
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#17352D]/8 pt-3">
                        <div className="flex items-center gap-2 font-body text-[9px] text-[#17352D]/40">
                          <span className="inline-flex items-center gap-1">
                            <ThumbsUp size={10} />
                            {productStat.likes}
                          </span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <ThumbsDown size={10} />
                            {productStat.dislikes}
                          </span>
                        </div>

                        <span className="font-body text-[8px] font-semibold uppercase tracking-[0.16em] text-[#17352D]/45 transition-colors group-hover:text-[#B99A5B]">
                          View details
                        </span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#17352D]/15 bg-white p-12 text-center">
              <Search className="mx-auto text-[#B99A5B]" size={22} />
              <h4 className="mt-4 font-heading text-xl">
                No products found
              </h4>
              <p className="mt-2 font-body text-xs text-[#17352D]/50">
                Try another search term or select a different collection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-xl bg-[#17352D] px-5 py-3 font-body text-[9px] font-semibold uppercase tracking-widest text-white"
              >
                Reset collection
              </button>
            </div>
          )}
        </section>
      </main>

      {/* FLOATING ENQUIRY BAR */}
      <AnimatePresence>
        {enquiryItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-3xl rounded-2xl border border-[#B99A5B]/30 bg-[#17352D]/95 p-3 text-white shadow-2xl backdrop-blur-xl sm:bottom-6 sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B99A5B]/15">
                  <Package size={18} className="text-[#B99A5B]" />
                </div>
                <div>
                  <p className="font-body text-[10px] font-semibold uppercase tracking-[0.16em]">
                    Enquiry list
                  </p>
                  <p className="font-body text-[9px] text-white/50">
                    {enquiryItems.length} product
                    {enquiryItems.length === 1 ? "" : "s"} selected for
                    quotation
                  </p>
                </div>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B99A5B] px-5 py-3 font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-[#17352D] transition-all hover:bg-[#caba79]"
              >
                Request quotation
                <ArrowRight size={13} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Catalogue;