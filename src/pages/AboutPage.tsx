import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowRight,
  BadgeCheck,
  Crown,
  Package,
  Palette,
  Sparkles,
  Truck,
  ShieldCheck,
  Gem,
  Building2,
  ChevronRight,
  Star,
  Sparkle,
  Sun,
  Moon,
  Eye,
  Upload,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";

import Header from "@/components/Navbar";
import Footer from "@/components/Footer";

// -----------------------------------------------------
// MOBILE DETECTION
// -----------------------------------------------------
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// -----------------------------------------------------
// BRAND THEMES
// -----------------------------------------------------
const brandThemes = [
  {
    id: "obsidian",
    name: "Obsidian & Gold",
    shortName: "Obsidian",
    bg: "bg-[#141210]",
    border: "border-[#d4af37]/60",
    text: "text-[#f3e3a1]",
    bottleBg: "from-[#211b15] to-[#0c0a08]",
    accentColor: "#d4af37",
    tagline: "Ultra-luxury dark aesthetic for moody, opulent suites.",
  },
  {
    id: "champagne",
    name: "Champagne Cream",
    shortName: "Champagne",
    bg: "bg-[#f8f5f0]",
    border: "border-[#c9a227]/80",
    text: "text-[#1a1815]",
    bottleBg: "from-[#ffffff] to-[#eee8dc]",
    accentColor: "#b88e28",
    tagline: "Crisp, airy elegance tailored for refined boutique retreats.",
  },
  {
    id: "emerald",
    name: "Imperial Emerald",
    shortName: "Emerald",
    bg: "bg-[#0b1a13]",
    border: "border-[#d4af37]/60",
    text: "text-[#f3e3a1]",
    bottleBg: "from-[#112a1f] to-[#06120d]",
    accentColor: "#e5c158",
    tagline: "Rich botanical heritage tones for distinguished luxury estates.",
  },
  {
    id: "sapphire",
    name: "Royal Sapphire",
    shortName: "Sapphire",
    bg: "bg-[#0a111f]",
    border: "border-[#d4af37]/60",
    text: "text-[#f3e3a1]",
    bottleBg: "from-[#101b30] to-[#060a14]",
    accentColor: "#e5c158",
    tagline: "Regal maritime grandeur for sophisticated waterfront resorts.",
  },
];

// Finish Options
const finishOptions = [
  { id: "gold", name: "Metallic Gold", capClass: "from-[#9f7620] via-[#f0d779] to-[#a77b20]" },
  { id: "silver", name: "Polished Silver", capClass: "from-[#8a9199] via-[#e2e8f0] to-[#717882]" },
  { id: "rosegold", name: "Rose Gold", capClass: "from-[#b76e79] via-[#f7d6d0] to-[#a85c67]" },
  { id: "matte", name: "Matte Black", capClass: "from-[#2b2b2b] via-[#404040] to-[#1a1a1a]" },
];

// -----------------------------------------------------
// PRODUCTS
// -----------------------------------------------------
const products = [
  {
    name: "Nourishing Shampoo",
    category: "Hair Atelier",
    size: "35ml",
    description: "A refined cleansing essential for the guest bathroom.",
  },
  {
    name: "Revitalizing Shower Gel",
    category: "Body Atelier",
    size: "35ml",
    description: "A fresh, luxurious shower experience for every stay.",
  },
  {
    name: "Velvet Body Lotion",
    category: "Skin Elixir",
    size: "35ml",
    description: "A finishing touch designed to leave skin feeling cared for.",
  },
  {
    name: "Artisan Guest Soap",
    category: "Pure Essential",
    size: "35g",
    description: "A beautifully presented everyday essential.",
  },
];

// -----------------------------------------------------
// BENEFITS & DETAILS
// -----------------------------------------------------
const benefits = [
  {
    icon: Palette,
    number: "01",
    title: "Tailored Brand Identity",
    description:
      "Your property's visual identity becomes part of the amenity itself through custom labels, colors and insignia.",
  },
  {
    icon: Sparkles,
    number: "02",
    title: "Signature Experience",
    description:
      "Create a consistent sensory experience that complements the atmosphere and positioning of your property.",
  },
  {
    icon: Package,
    number: "03",
    title: "Curated Packaging",
    description:
      "Select a refined presentation that fits naturally into your guest rooms, suites and hospitality spaces.",
  },
  {
    icon: Truck,
    number: "04",
    title: "Reliable Supply",
    description:
      "Build an ongoing amenity supply solution around your property's operational and restocking requirements.",
  },
];

const AboutPage = () => {
  const [selectedTheme, setSelectedTheme] = useState(brandThemes[0]);
  const [selectedFinish, setSelectedFinish] = useState(finishOptions[0]);
  const [propertyName, setPropertyName] = useState("GRAND HOTEL");
  const [propertySub, setPropertySub] = useState("RESORT & SPA");
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [ambientLighting, setAmbientLighting] = useState<"dark" | "light">("light");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // ---------------------------------------------------
  // LOGO UPLOAD HANDLER
  // ---------------------------------------------------
  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ---------------------------------------------------
  // 3D PRODUCT PREVIEW
  // ---------------------------------------------------
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["14deg", "-14deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-14deg", "14deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // ---------------------------------------------------
  // ANIMATION VARIANTS
  // ---------------------------------------------------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.06 : 0.12,
        delayChildren: isMobile ? 0.05 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isMobile ? 12 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: isMobile ? 0.45 : 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfbf9] text-[#1a1815] selection:bg-[#c9a227]/30">
      <Header />

      <main>
        {/* HERO / BRAND STUDIO */}
        <section
          id="about"
          className="relative overflow-hidden bg-[#fcfbf9] py-7 sm:py-16 md:py-28 lg:py-36"
        >
          {/* Ambient Background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.12, 1],
                opacity: [0.2, 0.38, 0.2],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(201,162,39,0.18)_0%,_transparent_70%)] blur-[80px] sm:h-[700px] sm:w-[800px] md:blur-[110px]"
            />

            <div className="absolute inset-0 opacity-[0.018]">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(#c9a227 1px, transparent 1px), linear-gradient(90deg, #c9a227 1px, transparent 1px)",
                  backgroundSize: isMobile ? "55px 55px" : "90px 90px",
                }}
              />
            </div>
          </div>

          <div className="container relative mx-auto w-full max-w-7xl px-3.5 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 15 : 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-6xl"
            >
              <div className="relative overflow-hidden rounded-[1.4rem] border border-[#c9a227]/25 bg-white/90 shadow-[0_15px_45px_-20px_rgba(201,162,39,0.18)] backdrop-blur-xl sm:rounded-[2.5rem]">
                {/* Top Glowing Gold Accent Line */}
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                  {/* ================================================= */}
                  {/* CONTROLS COLUMN */}
                  {/* ================================================= */}
                  <div className="flex flex-col items-center p-4.5 text-center sm:p-8 md:p-12 lg:items-start lg:p-16 lg:text-left">
                    
                    {/* Animated High-Engagement Teaser Prompt */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c9a227]/40 bg-[#c9a227]/10 px-3 py-1 shadow-sm"
                    >
                      <Sparkles size={13} className="animate-spin text-[#b88e28]" />
                      <span className="font-serif text-[9px] uppercase tracking-[0.2em] font-semibold text-[#8c6712]">
                        Live Branding Playground
                      </span>
                    </motion.div>

                    {/* Heading */}
                    <h2 className="max-w-md font-serif text-[1.65rem] font-light leading-[1.08] text-[#1a1815] sm:text-4xl md:text-5xl">
                      Customize your{" "}
                      <span className="block italic text-[#b88e28]">
                        signature amenity.
                      </span>
                    </h2>

                    <p className="mt-3 max-w-md font-sans text-[11px] font-light leading-5 text-[#625b52] sm:mt-4 sm:text-sm sm:leading-7">
                      Upload your logo, adjust text, and pick luxury finishes to see your custom brand come to life instantly.
                    </p>

                    {/* ================================================= */}
                    {/* LOGO UPLOAD COMPONENT */}
                    {/* ================================================= */}
                    <div className="mt-5 w-full space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <label className="font-serif text-[8px] uppercase tracking-[0.22em] text-[#9b741c] sm:text-[10px]">
                          1. Upload Brand Logo
                        </label>
                        <span className="text-[8px] text-[#aaa095]">PNG, JPG, SVG</span>
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-[#c9a227]/50 bg-[#faf8f4] px-4 py-2.5 transition-all hover:border-[#c9a227] hover:bg-white shadow-inner"
                        >
                          <Upload size={13} className="text-[#b88e28]" />
                          <span className="font-sans text-xs font-medium text-[#4a433a]">
                            {customLogo ? "Change Logo Image" : "Upload Logo Image"}
                          </span>
                        </button>

                        {customLogo && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="flex items-center justify-center rounded-xl border border-[#e4ddd2] bg-[#faf8f4] p-2.5 text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all"
                            title="Reset to default logo"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* REAL-TIME TYPING INPUTS */}
                    {/* ================================================= */}
                    <div className="mt-4 w-full space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-serif text-[8px] uppercase tracking-[0.22em] text-[#9b741c] sm:text-[10px]">
                          2. Enter Property Name
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={propertyName}
                            onChange={(e) => setPropertyName(e.target.value.toUpperCase())}
                            maxLength={20}
                            placeholder="PROPERTY NAME"
                            className="w-full rounded-xl border border-[#c9a227]/30 bg-[#faf8f4] px-3 py-2.5 text-xs font-serif tracking-widest text-[#1a1815] outline-none focus:border-[#c9a227] focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={propertySub}
                            onChange={(e) => setPropertySub(e.target.value.toUpperCase())}
                            maxLength={22}
                            placeholder="SUBTITLE (E.G. RESORT)"
                            className="w-full rounded-xl border border-[#c9a227]/30 bg-[#faf8f4] px-3 py-2.5 text-xs font-sans tracking-widest text-[#1a1815] outline-none focus:border-[#c9a227] focus:bg-white transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* THEME SELECTOR */}
                    {/* ================================================= */}
                    <div className="mt-4 w-full">
                      <div className="mb-2 flex w-full items-center justify-between">
                        <p className="font-serif text-[8px] uppercase tracking-[0.22em] text-[#9b741c] sm:text-[10px]">
                          3. Select Palette Style
                        </p>
                      </div>

                      <div className="grid w-full grid-cols-4 gap-1.5 sm:gap-2.5">
                        {brandThemes.map((theme) => {
                          const isSelected = selectedTheme.id === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setSelectedTheme(theme)}
                              className={`group relative flex min-h-[64px] touch-manipulation flex-col items-center justify-center rounded-xl border p-2 transition-all duration-300 sm:min-h-[75px] ${
                                isSelected
                                  ? "border-[#c9a227] bg-[#c9a227]/[0.08] shadow-sm"
                                  : "border-[#e4ddd2] bg-[#faf8f4] hover:border-[#c9a227]/50"
                              }`}
                            >
                              <div className={`h-5 w-5 rounded-full ${theme.bg} border border-[#c9a227]/40 shadow-inner sm:h-6 sm:w-6`} />
                              <span className="mt-1 line-clamp-1 font-sans text-[7.5px] font-medium text-[#2d2924] sm:text-[9.5px]">
                                {theme.shortName}
                              </span>
                              {isSelected && (
                                <motion.div
                                  layoutId="selectedPalette"
                                  className="pointer-events-none absolute inset-0 rounded-xl border-2 border-[#c9a227]"
                                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* FINISH/CAP SELECTOR */}
                    {/* ================================================= */}
                    <div className="mt-4 w-full">
                      <p className="mb-2 font-serif text-[8px] uppercase tracking-[0.22em] text-[#9b741c] sm:text-[10px]">
                        4. Cap Metallic Accent
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {finishOptions.map((finish) => (
                          <button
                            key={finish.id}
                            onClick={() => setSelectedFinish(finish)}
                            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${
                              selectedFinish.id === finish.id
                                ? "border-[#c9a227] bg-white shadow-sm"
                                : "border-[#e4ddd2] bg-[#faf8f4]"
                            }`}
                          >
                            <div className={`h-2.5 w-7 rounded-full bg-gradient-to-r ${finish.capClass}`} />
                            <span className="text-[7.5px] font-sans text-neutral-700">{finish.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <motion.a
                      href="/products"
                      whileHover={isMobile ? {} : { scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="group mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b88e28] via-[#d4af37] to-[#a77c1d] px-5 py-3 font-sans text-[9px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_10px_25px_rgba(184,142,40,0.25)] sm:w-auto sm:px-7 sm:py-4 sm:text-[10px]"
                    >
                      Request Sample Box
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </motion.a>
                  </div>

                  {/* ================================================= */}
                  {/* PREVIEW VIEWPORT WITH LIGHTING CONTROLS */}
                  {/* ================================================= */}
                  <div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`relative flex min-h-[420px] items-center justify-center overflow-hidden transition-colors duration-500 border-t border-[#c9a227]/15 px-4 py-7 text-center sm:min-h-[540px] sm:px-12 sm:py-12 lg:min-h-[620px] lg:border-l lg:border-t-0 ${
                      ambientLighting === "dark" 
                        ? "bg-gradient-to-b from-[#121110] to-[#1c1916]" 
                        : "bg-gradient-to-b from-[#f9f7f2] to-[#eee8dc]"
                    }`}
                    style={{ perspective: 1000 }}
                  >
                    {/* Lighting Ambience Toggle */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-full bg-white/80 p-1 backdrop-blur-md border border-[#c9a227]/30 shadow-md">
                      <button
                        onClick={() => setAmbientLighting("light")}
                        className={`p-1.5 rounded-full transition-colors ${ambientLighting === "light" ? "bg-[#c9a227] text-white" : "text-neutral-600"}`}
                        title="Sunlit Suite Mode"
                      >
                        <Sun size={12} />
                      </button>
                      <button
                        onClick={() => setAmbientLighting("dark")}
                        className={`p-1.5 rounded-full transition-colors ${ambientLighting === "dark" ? "bg-[#121110] text-amber-400" : "text-neutral-600"}`}
                        title="Dark Marble Mode"
                      >
                        <Moon size={12} />
                      </button>
                    </div>

                    {/* Dynamic Radial Glow */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute h-[210px] w-[210px] rounded-full bg-[radial-gradient(circle,_rgba(201,162,39,0.3)_0%,_transparent_70%)] blur-2xl sm:h-[400px] sm:w-[400px] sm:blur-3xl"
                    />

                    {/* Product Preview Card Container */}
                    <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
                      <div className="mb-2 text-center sm:mb-6">
                        <p className="font-serif text-[8px] uppercase tracking-[0.3em] text-[#9b741c] sm:text-[10px]">
                          Interactive 3D Render
                        </p>
                        <h3 className={`mt-1 font-serif text-lg font-light transition-colors ${ambientLighting === "dark" ? "text-white" : "text-[#2a251f]"} sm:text-2xl`}>
                          Your Amenity, <span className="italic text-[#b88e28]">Custom Branded.</span>
                        </h3>
                      </div>

                      {/* Animated Bottle */}
                      <motion.div
                        style={{
                          rotateX: isMobile ? 0 : rotateX,
                          rotateY: isMobile ? 0 : rotateY,
                          transformStyle: "preserve-3d",
                        }}
                        className="relative flex justify-center"
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`${selectedTheme.id}-${selectedFinish.id}-${customLogo ? "logo" : "nologo"}`}
                            initial={{ scale: 0.9, opacity: 0, rotateY: -15, y: 10 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, rotateY: 15, y: -10 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className="relative h-[255px] w-[130px] sm:h-[370px] sm:w-[180px]"
                          >
                            {/* Shadow */}
                            <div className="absolute bottom-0 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full bg-black/30 blur-lg sm:h-8 sm:w-40 sm:blur-xl" />

                            {/* Main Bottle Shell */}
                            <div
                              className={`absolute inset-x-0 bottom-0 h-[230px] rounded-t-[3rem] rounded-b-[1.4rem] border-2 ${selectedTheme.border} bg-gradient-to-b ${selectedTheme.bottleBg} p-3 shadow-[0_20px_40px_rgba(0,0,0,0.35),inset_0_2px_12px_rgba(255,255,255,0.2)] sm:h-[335px] sm:rounded-t-[4rem] sm:rounded-b-[2rem] sm:p-6`}
                            >
                              {/* Dynamic Metallic Cap */}
                              <div className={`absolute -top-1 left-1/2 h-6 w-16 -translate-x-1/2 rounded-b-md border-x border-b border-[#c9a227]/60 bg-gradient-to-r ${selectedFinish.capClass} shadow-md sm:h-9 sm:w-24 sm:rounded-b-xl`} />

                              {/* Light Shimmer Sweep */}
                              <motion.div
                                animate={{ x: ["-180%", "300%"] }}
                                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
                                className="pointer-events-none absolute inset-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              />

                              {/* Label Content */}
                              <div className="relative flex h-full flex-col items-center justify-between py-4 text-center sm:py-10">
                                <div className="flex flex-col items-center">
                                  {/* Custom Logo or Default Crown */}
                                  {customLogo ? (
                                    <motion.div
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#d4af37]/60 bg-[#d4af37]/10 p-1 sm:h-12 sm:w-12"
                                    >
                                      <img
                                        src={customLogo}
                                        alt="Custom Hotel Logo"
                                        className="h-full w-full object-contain filter drop-shadow-sm"
                                      />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      animate={{ scale: [1, 1.08, 1] }}
                                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/60 bg-[#d4af37]/15 sm:h-11 sm:w-11"
                                    >
                                      <Crown size={13} className="text-[#e5c158] sm:size-[15px]" />
                                    </motion.div>
                                  )}

                                  {/* Dynamic User Custom Text */}
                                  <p className={`mt-2.5 font-serif text-[9px] uppercase tracking-[0.18em] font-semibold sm:mt-4 sm:text-sm sm:tracking-[0.22em] ${selectedTheme.text}`}>
                                    {propertyName || "GRAND HOTEL"}
                                  </p>

                                  <p className="mt-0.5 font-sans text-[5px] uppercase tracking-[0.25em] text-[#d4af37]/80 sm:text-[7px] sm:tracking-[0.3em]">
                                    {propertySub || "RESORT & SPA"}
                                  </p>
                                </div>

                                <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent sm:w-20" />

                                <div className="flex flex-col items-center">
                                  <p className={`font-serif text-[9px] italic sm:text-xs ${selectedTheme.text}`}>
                                    Nourishing Shampoo
                                  </p>
                                  <p className="mt-0.5 font-sans text-[5px] uppercase tracking-[0.24em] text-[#d4af37]/70 sm:mt-1 sm:text-[7px]">
                                    35ml e 1.18 fl. oz.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      {/* Interactive Badge */}
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#c9a227]/30 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-md sm:mt-5">
                        <Eye size={11} className="text-[#b88e28]" />
                        <span className="font-sans text-[8px] text-[#776d61] sm:text-[10px]">
                          Previewing: <strong className="text-[#2d2822]">{selectedTheme.shortName} / {selectedFinish.name}</strong>
                          {customLogo && " (Custom Logo Active)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* COLLECTION INTRO */}
            <motion.div
              initial={{ opacity: 0, y: isMobile ? 10 : 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="mx-auto mt-12 flex max-w-3xl flex-col items-center text-center sm:mt-24"
            >
              <div className="flex items-center justify-center gap-2.5 sm:gap-4">
                <span className="h-px w-7 bg-[#c9a227]/40 sm:w-12" />
                <Package size={14} className="text-[#b88e28] sm:size-[16px]" />
                <span className="h-px w-7 bg-[#c9a227]/40 sm:w-12" />
              </div>

              <p className="mt-3 font-serif text-[8px] uppercase tracking-[0.32em] text-[#9b741c] sm:mt-6 sm:text-[10px] sm:tracking-[0.4em]">
                Curated Guest Essentials
              </p>

              <h2 className="mt-1.5 font-serif text-[1.65rem] font-light text-[#1a1815] sm:mt-3 sm:text-4xl md:text-5xl">
                The 35ml Luxury Collection
              </h2>

              <p className="mx-auto mt-2.5 max-w-xl font-sans text-[11px] font-light leading-5 text-[#756c60] sm:mt-5 sm:text-sm sm:leading-7">
                A refined collection of guest-room essentials created to balance functionality, presentation and brand consistency.
              </p>
            </motion.div>

            {/* PRODUCTS GRID */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="mt-6 grid w-full grid-cols-2 gap-2.5 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
            >
              {products.map((product) => (
                <motion.div
                  key={product.name}
                  variants={itemVariants}
                  whileHover={isMobile ? {} : { y: -8 }}
                  className="group relative flex flex-col overflow-hidden rounded-[1.15rem] border border-[#dcd4c7] bg-white p-3.5 text-center shadow-[0_8px_22px_rgba(40,30,20,0.025)] transition-all duration-300 sm:rounded-3xl sm:p-6"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c9a227]/25 bg-[#c9a227]/10 sm:h-11 sm:w-11 sm:rounded-2xl">
                      <Package size={14} className="text-[#b88e28] sm:size-[17px]" />
                    </div>
                    <span className="rounded-full bg-[#f8f5ef] px-2 py-1 font-sans text-[7px] uppercase tracking-wider text-[#8b8071] sm:px-2.5 sm:text-[9px]">
                      {product.size}
                    </span>
                  </div>

                  <p className="mt-4 font-serif text-sm font-light leading-tight text-[#1a1815] sm:mt-7 sm:text-xl">
                    {product.name}
                  </p>
                  <p className="mt-1 font-sans text-[6.5px] uppercase tracking-[0.18em] text-[#b88e28] sm:text-[9px]">
                    {product.category}
                  </p>
                  <p className="mt-2.5 line-clamp-3 font-sans text-[9px] font-light leading-4 text-[#80766a] sm:mt-4 sm:text-xs">
                    {product.description}
                  </p>

                  <div className="mt-3.5 flex w-full items-center justify-center gap-1 border-t border-[#eee8df] pt-3 sm:mt-6 sm:gap-2">
                    <BadgeCheck size={10} className="text-[#c9a227] sm:size-[13px]" />
                    <span className="font-sans text-[6.5px] uppercase tracking-wider text-[#847a6d] sm:text-[9px]">
                      Custom insignia
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-center gap-0.5 font-sans text-[7px] font-medium uppercase tracking-wider text-[#9b741c] sm:mt-4 sm:text-[10px]">
                    View collection
                    <ChevronRight size={10} className="transition-transform group-hover:translate-x-1 sm:size-[13px]" />
                  </div>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#b88e28] to-[#e2c45b] transition-all duration-500 group-hover:w-full" />
                </motion.div>
              ))}
            </motion.div>

            {/* BENEFITS */}
            <div className="mt-12 flex w-full flex-col items-center sm:mt-24">
              <div className="mb-5 flex w-full flex-col items-center text-center sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:text-left">
                <div>
                  <p className="font-serif text-[8px] uppercase tracking-[0.3em] text-[#9b741c] sm:text-[10px]">
                    Why Milan_sz
                  </p>
                  <h2 className="mt-1.5 font-serif text-2xl font-light text-[#1a1815] sm:text-3xl md:text-4xl">
                    Designed around your property.
                  </h2>
                </div>
                <p className="mt-2 max-w-md font-sans text-[10px] leading-4.5 text-[#81776b] sm:mt-0 sm:text-xs sm:leading-6">
                  From visual identity to ongoing supply, every part of the collection is designed with hospitality in mind.
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="grid w-full gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
              >
                {benefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      whileHover={isMobile ? {} : { y: -6 }}
                      className="group relative overflow-hidden rounded-[1.15rem] border border-[#ddd5c9] bg-white p-4 shadow-[0_8px_22px_rgba(0,0,0,0.02)] sm:rounded-3xl sm:p-7"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#c9a227]/25 bg-[#c9a227]/10 sm:h-11 sm:w-11">
                          <Icon size={14} className="text-[#b88e28] sm:size-[17px]" />
                        </div>
                        <span className="font-serif text-xl font-light text-[#c9a227]/25 sm:text-3xl">
                          {item.number}
                        </span>
                      </div>

                      <h3 className="mt-4 font-serif text-sm font-normal leading-tight text-[#1a1815] sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 font-sans text-[9px] font-light leading-4 text-[#756c61] sm:text-xs">
                        {item.description}
                      </p>
                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#c9a227] transition-all duration-500 group-hover:w-full" />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* TRUST STRIP */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-10 w-full rounded-2xl border border-[#c9a227]/20 bg-[#f7f3eb] p-4 sm:mt-20 sm:rounded-3xl sm:py-8"
            >
              <div className="grid gap-0 md:grid-cols-3">
                <div className="flex items-center gap-3 border-b border-[#dcd3c5] px-1 py-3.5 sm:gap-4 sm:px-4 md:border-b-0 md:border-r">
                  <ShieldCheck size={19} className="shrink-0 text-[#b88e28]" />
                  <div>
                    <p className="font-serif text-xs text-[#2d2822] sm:text-sm">Hospitality Focused</p>
                    <p className="mt-0.5 font-sans text-[8px] text-[#82776a] sm:text-[10px]">Designed for accommodation businesses</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-b border-[#dcd3c5] px-1 py-3.5 sm:gap-4 sm:px-4 md:border-b-0 md:border-r">
                  <Building2 size={19} className="shrink-0 text-[#b88e28]" />
                  <div>
                    <p className="font-serif text-xs text-[#2d2822] sm:text-sm">Your Property</p>
                    <p className="mt-0.5 font-sans text-[8px] text-[#82776a] sm:text-[10px]">Built around your brand identity</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1 py-3.5 sm:gap-4 sm:px-4">
                  <Gem size={19} className="shrink-0 text-[#b88e28]" />
                  <div>
                    <p className="font-serif text-xs text-[#2d2822] sm:text-sm">Premium Detail</p>
                    <p className="mt-0.5 font-sans text-[8px] text-[#82776a] sm:text-[10px]">Elevate the everyday guest experience</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BRAND PHILOSOPHY */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mx-auto mt-12 w-full max-w-5xl sm:mt-28"
            >
              <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-[#c9a227]/30 bg-gradient-to-b from-white via-[#fdfbf7] to-[#f5eee3] px-5 py-10 text-center shadow-[0_20px_55px_rgba(201,162,39,0.08)] sm:rounded-[2.5rem] sm:px-16 sm:py-20">
                <div className="absolute left-1/2 top-0 h-[2px] w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent sm:w-48" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 sm:h-12 sm:w-12">
                  <Star size={15} className="text-[#b88e28] sm:size-[18px]" />
                </div>

                <h3 className="mt-4 font-serif text-[1.65rem] font-light text-[#1a1815] sm:text-4xl">
                  Crafting memorable guest stays.
                </h3>

                <p className="mx-auto mt-3 max-w-2xl font-sans text-[10px] font-light text-[#6a6155] sm:text-sm">
                  Every touchpoint in luxury hospitality is an opportunity to tell your story. Our amenity collection combines exquisite formulation with customizable luxury presentation.
                </p>

                <div className="mt-6 flex justify-center gap-1 text-[#c9a227] sm:mt-8">
                  {[...Array(5)].map((_, i) => (
                    <Sparkle key={i} size={12} className="fill-[#c9a227] sm:size-[14px]" />
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="h-10 sm:h-20" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;