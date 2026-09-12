import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ChevronDown,
  Sparkles,
  Crown,
  ArrowRight,
  Upload,
  Check,
  Hotel,
  Sun,
  Moon,
  Eye,
  RotateCcw,
  Palette,
  Tag,
  Building,
  Type,
  Box,
} from "lucide-react";

import heroBg from "@/assets/hero-bg.jpg";

const trackEvent = (action: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: "engagement",
    });
  }
};

const audienceTags = [
  "Hotels",
  "Airbnbs",
  "Lodges",
  "Guesthouses",
  "Resorts",
];

// Available Bottle & Sticker Color Configurations
const BOTTLE_COLORS = [
  {
    id: "onyx",
    name: "Onyx Black",
    bgGradient: "from-[#211b15] to-[#0c0a08]",
    labelBg: "bg-[#141210]/95 border-[#d4af37]/40 text-[#f8f5f0]",
    border: "border-[#d4af37]/60",
    swatchHex: "#1f1a14",
    accentText: "text-[#d4af37]",
    subText: "text-[#f3e3a1]",
  },
  {
    id: "amber",
    name: "Amber Glass",
    bgGradient: "from-[#3d2109] to-[#1a0e03]",
    labelBg: "bg-[#2a1708]/95 border-[#e59b37]/40 text-[#fef3c7]",
    border: "border-[#e59b37]/70",
    swatchHex: "#8b4513",
    accentText: "text-[#f59e0b]",
    subText: "text-[#fde68a]",
  },
  {
    id: "frosted",
    name: "Frosted White",
    bgGradient: "from-[#dedad6] to-[#a39e98]",
    labelBg: "bg-[#f8f9fa]/95 border-neutral-300 text-neutral-900",
    border: "border-white/80",
    swatchHex: "#e8e5e1",
    accentText: "text-neutral-800",
    subText: "text-neutral-900",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    bgGradient: "from-[#0c2b18] to-[#041209]",
    labelBg: "bg-[#061a0f]/95 border-[#34d399]/40 text-[#ecfdf5]",
    border: "border-[#34d399]/60",
    swatchHex: "#0d5c3a",
    accentText: "text-[#34d399]",
    subText: "text-[#a7f3d0]",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    bgGradient: "from-[#0a1e3b] to-[#030a17]",
    labelBg: "bg-[#051124]/95 border-[#60a5fa]/40 text-[#eff6ff]",
    border: "border-[#60a5fa]/60",
    swatchHex: "#123b70",
    accentText: "text-[#60a5fa]",
    subText: "text-[#bfdbfe]",
  },
];

const PRODUCT_TYPES = [
  "Nourishing Shampoo",
  "Body Wash",
  "Hydrating Conditioner",
  "Body Lotion",
  "Hand Wash",
];

const FONT_STYLES = [
  { id: "serif", name: "Serif Luxury", class: "font-serif" },
  { id: "sans", name: "Modern Clean", class: "font-sans" },
  { id: "mono", name: "Monospace", class: "font-mono" },
];

const SIZES = ["35ml", "50ml", "100ml"];

/* =========================================================
    TYPEWRITER ANIMATED TEXT COMPONENT (MOBILE OPTIMIZED)
========================================================== */
const PHRASES = [
  "Customize Your Supply",
  "Insert Logo on Product",
  "Elevate Guest Experience",
];

const TypewriterText = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex];
    let typingSpeed = isDeleting ? 35 : 75;

    if (!isDeleting && displayText === currentPhrase) {
      const pauseTimeout = setTimeout(() => setIsDeleting(true), 2200);
      return () => clearTimeout(pauseTimeout);
    }

    if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % PHRASES.length);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText((prev) =>
        isDeleting
          ? currentPhrase.substring(0, prev.length - 1)
          : currentPhrase.substring(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex]);

  return (
    <span className="inline-flex items-center">
      <span className="font-serif italic text-[#d4af37] text-[0.78em] sm:text-[0.88em]">
        {displayText}
      </span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
        className="ml-1 inline-block h-[0.8em] w-[2px] rounded-full bg-[#d4af37] align-middle"
      />
    </span>
  );
};

const Hero = () => {
  // Customization State
  const [propertyMark, setPropertyMark] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("ROYAL SUITE");
  const [productName, setProductName] = useState("Nourishing Shampoo");
  const [selectedColor, setSelectedColor] = useState(BOTTLE_COLORS[0]);
  const [selectedFont, setSelectedFont] = useState(FONT_STYLES[0]);
  const [selectedSize, setSelectedSize] = useState("35ml");
  const [ambientLighting, setAmbientLighting] = useState<"dark" | "light">("light");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3D Parallax Tilt Effect for Preview Card
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPropertyMark(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPropertyMark(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section
      id="home"
      className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-[#141210] text-[#f8f5f0] lg:h-screen lg:max-h-[1080px]"
    >
      {/* BACKGROUND IMAGE & OVERLAYS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={heroBg}
          alt="Luxury Guest Amenities Background"
          className="h-full w-full object-cover object-center opacity-40"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#141210]/90 via-[#141210]/75 to-[#141210]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#141210_100%)]" />

        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.22)_0%,_transparent_70%)] blur-[90px] sm:h-[750px] sm:w-[850px] md:blur-[120px]"
        />

        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(#d4af37 1px, transparent 1px), linear-gradient(90deg, #d4af37 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>
      </div>

      {/* Spacer / Top Margin Offset for Header */}
      <div className="mt-[5rem] sm:mt-0 h-4 shrink-0 sm:h-16" />

      {/* MAIN CONTENT CONTAINER */}
      <div
        className="
          container
          relative
          z-10
          mx-auto
          flex
          flex-1
          items-center
          px-4
          py-4
          sm:px-6
          lg:px-8
          lg:py-1
        "
      >
        <div
          className="
            grid
            w-full
            max-w-7xl
            items-center
            gap-6
            lg:grid-cols-12
            lg:gap-8
          "
        >
          {/* LEFT COLUMN — HERO TEXT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="
              flex
              flex-col
              items-center
              text-center
              lg:col-span-6
              lg:items-start
              lg:text-left
            "
          >
            {/* EYEBROW BADGE */}
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-0.5 shadow-sm backdrop-blur-md"
            >
              <Sparkles size={11} className="animate-spin text-[#f3e3a1]" />
              <span className="font-serif text-[8.5px] uppercase tracking-[0.2em] font-semibold text-[#f3e3a1] sm:text-[9.5px]">
                Premium Accommodation Amenities · Eswatini
              </span>
            </motion.div>

            {/* MAIN HEADING */}
            <h1
              className="
                mt-2.5
                max-w-4xl
                font-serif
                text-[2.1rem]
                font-light
                leading-[1.05]
                tracking-[-0.02em]
                text-[#f8f5f0]
                sm:text-4xl
                md:text-5xl
                lg:text-[3.4rem]
                xl:text-[3.9rem]
              "
            >
              Brand Your
              <br />
              Guest Amenities.
              <span className="mt-1.5 block min-h-[1.3em] leading-tight">
                <TypewriterText />
              </span>
            </h1>

            {/* DECORATIVE ACCENT LINE */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <span className="h-px w-10 bg-gradient-to-r from-[#d4af37] to-transparent" />
              <span className="h-1.5 w-1.5 rotate-45 bg-[#d4af37]" />
              <span className="h-px w-5 bg-[#d4af37]/60" />
            </div>

            {/* SUPPORTING COPY */}
            <p
              className="
                mt-2.5
                max-w-xl
                font-sans
                text-xs
                font-light
                leading-5
                text-[#d0c8be]
                sm:text-sm
              "
            >
              Simulate bottle finishes, sticker labels, typography, and custom property insignias in real-time for your hotel, Airbnb, or luxury resort.
            </p>

            {/* CTA BUTTONS */}
            <div
              className="
                mt-4
                flex
                w-full
                flex-col
                gap-2.5
                sm:w-auto
                sm:flex-row
              "
            >
              <a
                href="#contact"
                onClick={() => trackEvent("hero_brand_amenities_click")}
                className="
                  group
                  inline-flex
                  min-h-[40px]
                  items-center
                  justify-center
                  gap-2.5
                  rounded-full
                  bg-gradient-to-r
                  from-[#b88e28]
                  via-[#d4af37]
                  to-[#a77c1d]
                  px-6
                  py-2
                  font-sans
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-white
                  shadow-[0_8px_20px_rgba(212,175,55,0.25)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_14px_30px_rgba(212,175,55,0.35)]
                  active:translate-y-0
                "
              >
                Order Custom Batch
                <ArrowRight
                  size={13}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a>

              <a
                href="#products"
                onClick={() => trackEvent("hero_view_collection_click")}
                className="
                  group
                  inline-flex
                  min-h-[40px]
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-[#d4af37]/40
                  bg-[#141210]/60
                  px-6
                  py-2
                  font-sans
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-[#f3e3a1]
                  shadow-sm
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:border-[#d4af37]
                  hover:bg-[#d4af37]/15
                "
              >
                View Collection
                <ChevronDown
                  size={12}
                  className="-rotate-90 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </div>

            {/* TRUST FOOTER */}
            <div className="mt-5 w-full border-t border-[#d4af37]/20 pt-2.5">
              <div className="flex flex-col items-center gap-1.5 lg:flex-row lg:items-center">
                <div className="flex items-center gap-1.5 text-[#b8ad9e]">
                  <Hotel size={12} strokeWidth={1.6} className="text-[#d4af37]" />
                  <span className="font-sans text-[8px] font-semibold uppercase tracking-[0.16em]">
                    Built for hospitality
                  </span>
                </div>

                <div className="hidden h-3 w-px bg-[#d4af37]/25 lg:block" />

                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 lg:justify-start">
                  {audienceTags.map((tag, idx) => (
                    <div key={tag} className="flex items-center gap-2">
                      <span className="font-sans text-[8px] font-medium uppercase tracking-[0.14em] text-[#a09485]">
                        {tag}
                      </span>
                      {idx < audienceTags.length - 1 && (
                        <span className="h-1 w-1 rounded-full bg-[#d4af37]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN — INTERACTIVE BRAND SIMULATION */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="
              relative
              flex
              w-full
              items-center
              justify-center
              lg:col-span-6
              my-2
              lg:my-0
              lg:pr-[25px]
            "
          >
            {/* Ambient Backlight Halo */}
            <div className="absolute h-[320px] w-[320px] rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 blur-2xl sm:h-[380px] sm:w-[380px]" />

            {/* STUDIO CONTAINER CARD */}
            <div className="relative w-full max-w-[400px]">
              <div
                className="
                  overflow-hidden
                  rounded-[1.3rem]
                  border
                  border-[#d4af37]/35
                  bg-[#1a1815]/90
                  p-3
                  shadow-[0_15px_45px_-10px_rgba(0,0,0,0.7)]
                  backdrop-blur-xl
                  sm:p-3.5
                "
              >
                {/* Glowing Top Gold Accent Bar */}
                <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

                {/* CARD HEADER & LIGHTING TOGGLE */}
                <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2">
                  <div>
                    <p className="font-sans text-[7px] font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                      Milan_sz Simulator
                    </p>
                    <p className="font-serif text-[10.5px] font-medium uppercase tracking-[0.1em] text-[#f8f5f0]">
                      Try Out Our Brand Studio
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Dark/White Light Mode Switcher */}
                    <div className="flex items-center gap-0.5 rounded-full border border-[#d4af37]/30 bg-[#141210] p-0.5 shadow-inner">
                      <button
                        onClick={() => setAmbientLighting("light")}
                        className={`rounded-full p-1 transition-all ${
                          ambientLighting === "light"
                            ? "bg-[#d4af37] text-[#141210]"
                            : "text-[#a09485] hover:text-[#f8f5f0]"
                        }`}
                        title="White Light Mode"
                      >
                        <Sun size={9} />
                      </button>
                      <button
                        onClick={() => setAmbientLighting("dark")}
                        className={`rounded-full p-1 transition-all ${
                          ambientLighting === "dark"
                            ? "bg-[#28231d] text-[#f3e3a1]"
                            : "text-[#a09485] hover:text-[#f8f5f0]"
                        }`}
                        title="Dark Onyx Mode"
                      >
                        <Moon size={9} />
                      </button>
                    </div>

                    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/15">
                      <Crown size={11} className="text-[#e5c158]" />
                    </div>
                  </div>
                </div>

                {/* 3D PRODUCT VIEWPORT */}
                <div
                  ref={cardRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={`relative flex h-[190px] items-center justify-center overflow-hidden rounded-xl transition-colors duration-500 my-2 border border-[#d4af37]/25 ${
                    ambientLighting === "dark"
                      ? "bg-[#0c0a08]"
                      : "bg-white shadow-inner"
                  }`}
                  style={{ perspective: 1000 }}
                >
                  {/* Subtle Light Reflection */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute h-[140px] w-[140px] rounded-full blur-2xl ${
                      ambientLighting === "dark"
                        ? "bg-[radial-gradient(circle,_rgba(212,175,55,0.3)_0%,_transparent_70%)]"
                        : "bg-[radial-gradient(circle,_rgba(212,175,55,0.18)_0%,_transparent_70%)]"
                    }`}
                  />

                  {/* Bottle Shadow */}
                  <div
                    className={`absolute bottom-2 h-3.5 w-24 rounded-full blur-md ${
                      ambientLighting === "dark" ? "bg-black/80" : "bg-neutral-900/30"
                    }`}
                  />

                  {/* BOTTLE RENDER */}
                  <motion.div
                    style={{
                      rotateX,
                      rotateY,
                      transformStyle: "preserve-3d",
                    }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    className="relative flex h-40 w-21 items-center justify-center"
                  >
                    <div
                      className={`relative h-full w-full rounded-[1.1rem] rounded-t-[2rem] border-2 ${selectedColor.border} bg-gradient-to-b ${selectedColor.bgGradient} p-1.5 shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-500`}
                    >
                      {/* Metallic Cap */}
                      <div className="absolute -top-1 left-1/2 z-20 h-4.5 w-10 -translate-x-1/2 rounded-b-md border-x border-b border-[#d4af37]/70 bg-gradient-to-r from-[#9f7620] via-[#f0d779] to-[#a77b20] shadow-md" />

                      {/* Shimmer Effect */}
                      <motion.div
                        animate={{ x: ["-180%", "300%"] }}
                        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
                        className="pointer-events-none absolute inset-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      />

                      {/* STICKER LABEL CONTAINER */}
                      <div
                        className={`relative flex h-full flex-col items-center justify-between rounded-lg border p-1 text-center shadow-sm transition-colors duration-500 ${selectedColor.labelBg}`}
                      >
                        {/* Custom Logo / Crown Insignia */}
                        <div className="flex h-8 w-full items-center justify-center">
                          <AnimatePresence mode="wait">
                            {propertyMark ? (
                              <motion.img
                                key="custom-logo"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                src={propertyMark}
                                alt="Custom Property Logo"
                                className="max-h-7 max-w-[85%] object-contain filter drop-shadow-sm"
                              />
                            ) : (
                              <motion.div
                                key="default-logo"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d4af37]/60 bg-[#d4af37]/15">
                                  <Crown size={9} className="text-[#e5c158]" />
                                </div>
                                <span className={`mt-0.5 font-serif text-[5.5px] uppercase tracking-[0.16em] ${selectedColor.accentText}`}>
                                  YOUR LOGO
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Company / Property Name with Selected Font */}
                        <div className="w-full">
                          <p className={`truncate text-[7.5px] font-semibold uppercase tracking-[0.12em] ${selectedFont.class} ${selectedColor.subText}`}>
                            {companyName || "COMPANY NAME"}
                          </p>
                          <p className={`mt-0.5 font-sans text-[4.5px] uppercase tracking-[0.2em] opacity-80 ${selectedColor.accentText}`}>
                            Guest Amenities
                          </p>
                        </div>

                        {/* Product Detail & Size */}
                        <div className="w-full border-t border-current/20 pt-0.5 opacity-90">
                          <p className={`truncate text-[5.5px] italic ${selectedFont.class} ${selectedColor.subText}`}>
                            {productName}
                          </p>
                          <p className={`mt-0.5 font-sans text-[4px] uppercase tracking-[0.1em] opacity-70 ${selectedColor.accentText}`}>
                            {selectedSize} e
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* ADVANCED E-COMMERCE BRANDING CONTROLS */}
                <div className="space-y-2 rounded-xl border border-[#d4af37]/20 bg-[#141210]/90 p-2 shadow-inner">
                  
                  {/* 1. BOTTLE & STICKER COLOR SELECTOR */}
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Palette size={10} className="text-[#d4af37]" />
                      <span className="font-serif text-[7.5px] font-semibold uppercase tracking-[0.14em] text-[#d4af37]">
                        Bottle & Sticker Finish: <span className="text-[#f8f5f0]">{selectedColor.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {BOTTLE_COLORS.map((col) => (
                        <button
                          key={col.id}
                          onClick={() => setSelectedColor(col)}
                          className={`h-5 w-5 rounded-full border transition-all ${
                            selectedColor.id === col.id
                              ? "scale-110 border-[#d4af37] ring-2 ring-[#d4af37]/40"
                              : "border-white/20 opacity-70 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: col.swatchHex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 2. COMPANY NAME & PRODUCT TYPE */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Building size={9} className="text-[#d4af37]" />
                        <span className="font-serif text-[7px] uppercase tracking-[0.12em] text-[#a09485]">
                          Company Name
                        </span>
                      </div>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
                        placeholder="ROYAL SUITE"
                        maxLength={22}
                        className="
                          w-full
                          rounded-md
                          border
                          border-[#d4af37]/30
                          bg-[#1a1815]
                          px-2
                          py-1
                          font-serif
                          text-[9.5px]
                          tracking-wider
                          text-[#f8f5f0]
                          outline-none
                          focus:border-[#d4af37]
                        "
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Tag size={9} className="text-[#d4af37]" />
                        <span className="font-serif text-[7px] uppercase tracking-[0.12em] text-[#a09485]">
                          Product Item
                        </span>
                      </div>
                      <select
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="
                          w-full
                          rounded-md
                          border
                          border-[#d4af37]/30
                          bg-[#1a1815]
                          px-1.5
                          py-1
                          font-serif
                          text-[9.5px]
                          text-[#f8f5f0]
                          outline-none
                          focus:border-[#d4af37]
                        "
                      >
                        {PRODUCT_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-[#141210] text-[#f8f5f0]">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. TYPOGRAPHY & VOLUME SIZE SELECTORS */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Type size={9} className="text-[#d4af37]" />
                        <span className="font-serif text-[7px] uppercase tracking-[0.12em] text-[#a09485]">
                          Font Style
                        </span>
                      </div>
                      <select
                        value={selectedFont.id}
                        onChange={(e) =>
                          setSelectedFont(FONT_STYLES.find((f) => f.id === e.target.value) || FONT_STYLES[0])
                        }
                        className="
                          w-full
                          rounded-md
                          border
                          border-[#d4af37]/30
                          bg-[#1a1815]
                          px-1.5
                          py-1
                          font-sans
                          text-[9px]
                          text-[#f8f5f0]
                          outline-none
                          focus:border-[#d4af37]
                        "
                      >
                        {FONT_STYLES.map((f) => (
                          <option key={f.id} value={f.id} className="bg-[#141210] text-[#f8f5f0]">
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <Box size={9} className="text-[#d4af37]" />
                        <span className="font-serif text-[7px] uppercase tracking-[0.12em] text-[#a09485]">
                          Volume Size
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {SIZES.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`flex-1 rounded-md border py-0.5 font-sans text-[8px] transition-all ${
                              selectedSize === size
                                ? "border-[#d4af37] bg-[#d4af37]/20 text-[#f3e3a1]"
                                : "border-[#d4af37]/20 bg-[#1a1815] text-[#a09485]"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 4. LOGO UPLOAD CONTROL */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="
                        flex
                        flex-1
                        cursor-pointer
                        items-center
                        justify-center
                        gap-1.5
                        rounded-md
                        border
                        border-dashed
                        border-[#d4af37]/50
                        bg-[#1a1815]
                        px-2
                        py-1
                        font-sans
                        text-[8px]
                        font-medium
                        uppercase
                        tracking-[0.1em]
                        text-[#d0c8be]
                        transition-all
                        hover:border-[#d4af37]
                        hover:bg-[#d4af37]/10
                      "
                    >
                      <Upload size={10} className="text-[#d4af37]" />
                      <span>{propertyMark ? "Change Logo" : "Upload Brand Logo"}</span>
                    </button>

                    {propertyMark && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="flex items-center justify-center rounded-md border border-[#d4af37]/30 bg-[#1a1815] p-1 text-neutral-400 hover:border-red-400 hover:bg-red-950/30 hover:text-red-400 transition-all"
                        title="Reset logo"
                      >
                        <RotateCcw size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* BOTTOM PREVIEW FOOTER */}
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <Eye size={10} className="text-[#d4af37]" />
                  <span className="font-sans text-[7.5px] font-medium uppercase tracking-[0.12em] text-[#a09485]">
                    Interactive Live Render · Milan_sz Atelier
                  </span>
                </div>
              </div>

              {/* FLOATING QUALITY BADGE */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="
                  absolute
                  -right-2
                  top-6
                  hidden
                  rounded-xl
                  border
                  border-[#d4af37]/35
                  bg-[#141210]/95
                  px-2.5
                  py-1.5
                  shadow-[0_8px_20px_rgba(0,0,0,0.5)]
                  backdrop-blur-xl
                  sm:block
                "
              >
                <div className="flex items-center gap-1">
                  <Check size={9} className="text-[#d4af37]" />
                  <p className="font-sans text-[6px] font-semibold uppercase tracking-[0.14em] text-[#d4af37]">
                    Hospitality Standard
                  </p>
                </div>
                <p className="mt-0.5 font-serif text-[9px] font-light text-[#f8f5f0]">
                  Full Bespoke Batch
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        className="
          relative
          py-2
          z-10
          flex
          shrink-0
          justify-center
        "
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <a
          href="#products"
          aria-label="Scroll to collection"
          className="group flex flex-col items-center gap-0.5"
        >
          <span className="font-sans text-[6px] font-semibold uppercase tracking-[0.2em] text-[#a09485] transition-colors group-hover:text-[#d4af37]">
            Explore
          </span>
          <ChevronDown
            size={13}
            className="text-[#a09485] transition-colors group-hover:text-[#d4af37]"
          />
        </a>
      </motion.div>
    </section>
  );
};

export default Hero;