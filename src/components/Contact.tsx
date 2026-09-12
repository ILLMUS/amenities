import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Shield, Phone, Mail, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const trackEvent = (action: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, { event_category: "conversion" });
  }
};

const establishmentTypes = [
  "Guesthouse",
  "Airbnb",
  "Lodge",
  "Hotel",
  "Bed & Breakfast",
  "Resort",
  "Other",
];

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters").max(150, "Business name is too long"),
  phone: z.string().trim().min(7, "Phone number is too short").max(20, "Phone number is too long").regex(/^[+\d\s()-]+$/, "Invalid phone number format"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  establishmentType: z.string().min(1, "Please select an establishment type"),
  productsInterested: z.string().max(500, "Too long").optional().default(""),
  estimatedQuantity: z.string().max(100, "Too long").optional().default(""),
  message: z.string().max(2000, "Message is too long").optional().default(""),
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [honeypot, setHoneypot] = useState("");
  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    businessName: "",
    phone: "",
    email: "",
    establishmentType: "",
    productsInterested: "",
    estimatedQuantity: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactForm]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) return;

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof ContactForm;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error: fnError } = await supabase.functions.invoke("submit-quote", {
        body: result.data,
      });

      if (fnError) {
        console.error("Edge function error:", fnError);
        throw new Error("Submission failed");
      }

      try {
        const formData = new URLSearchParams();
        formData.append("form-name", "quote-request");
        Object.entries(result.data).forEach(([key, value]) => {
          formData.append(key, value);
        });
        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        });
      } catch {
        console.log("Netlify Forms submission skipped (not on Netlify)");
      }

      trackEvent("form_submission");
      toast({
        title: "Quote Request Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setForm({
        fullName: "",
        businessName: "",
        phone: "",
        email: "",
        establishmentType: "",
        productsInterested: "",
        estimatedQuantity: "",
        message: "",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border/60 bg-background/50 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm";

  const errorClass = "text-xs text-destructive mt-1 font-medium flex items-center gap-1";

  return (
    <section id="contact" className="relative overflow-hidden bg-background py-24 md:py-32">
      {/* Background Decorator Gradients */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold tracking-wider text-primary uppercase"
          >
            <Sparkles size={14} />
            <span>Get In Touch</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            Reach Out to Us
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg"
          >
            Looking to elevate your establishment? Request a custom quote today and our hospitality team will prepare a tailored solution.
          </motion.p>
        </div>

        {/* Hidden Netlify form for bot detection */}
        <form name="quote-request" data-netlify="true" data-netlify-honeypot="bot-field" hidden>
          <input type="text" name="fullName" />
          <input type="text" name="businessName" />
          <input type="tel" name="phone" />
          <input type="email" name="email" />
          <select name="establishmentType"><option value=""></option></select>
          <input type="text" name="productsInterested" />
          <input type="text" name="estimatedQuantity" />
          <textarea name="message"></textarea>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-sm"
          >
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Why Partner With Us?</h3>
              <p className="text-sm text-muted-foreground">
                We supply premier hospitality establishments with luxury textiles, amenities, and essentials.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Rapid 24-Hour Turnaround</h4>
                  <p className="text-xs text-muted-foreground">Detailed quote breakdown delivered straight to your inbox.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Commercial Wholesale Pricing</h4>
                  <p className="text-xs text-muted-foreground">Tiered discount structures based on order volume and frequency.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Custom Branding Available</h4>
                  <p className="text-xs text-muted-foreground">Bespoke embroidery, custom packaging, and tailored specifications.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Phone size={14} className="text-primary" />
                <span>+1 (800) 555-4321</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Mail size={14} className="text-primary" />
                <span>orders@supplies.com</span>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.form
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-card border border-border/60 rounded-2xl p-8 md:p-10 shadow-xl space-y-6 relative"
            noValidate
          >
            {/* Honeypot field */}
            <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
              <input
                type="text"
                name="bot-field"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground">Request a Custom Quote</h3>
              <p className="text-xs text-muted-foreground">Fill out the form below to receive a wholesale pricing proposal.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">Full Name *</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`${inputClass} ${errors.fullName ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                />
                {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">Business Name *</label>
                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  placeholder="Grand Bay Resort"
                  className={`${inputClass} ${errors.businessName ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                />
                {errors.businessName && <p className={errorClass}>{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">Phone Number *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  className={`${inputClass} ${errors.phone ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">Email Address *</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  type="email"
                  className={`${inputClass} ${errors.email ? "border-destructive ring-1 ring-destructive/30" : ""}`}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Establishment Type *</label>
              <select
                name="establishmentType"
                value={form.establishmentType}
                onChange={handleChange}
                className={`${inputClass} ${errors.establishmentType ? "border-destructive ring-1 ring-destructive/30" : ""}`}
              >
                <option value="" disabled>Select an establishment type...</option>
                {establishmentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.establishmentType && <p className={errorClass}>{errors.establishmentType}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">Products Interested In</label>
                <input
                  name="productsInterested"
                  value={form.productsInterested}
                  onChange={handleChange}
                  placeholder="e.g., Luxury Towels, Bedding"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/80 mb-1.5">Estimated Quantity</label>
                <input
                  name="estimatedQuantity"
                  value={form.estimatedQuantity}
                  onChange={handleChange}
                  placeholder="e.g., 50-100 units"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground/80 mb-1.5">Additional Details or Notes</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your requirements or custom specifications..."
                rows={4}
                className={inputClass + " resize-none"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gradient-gold flex w-full items-center justify-center gap-2 rounded-lg py-4 font-body text-sm font-semibold uppercase tracking-wider text-accent-foreground transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} className={loading ? "animate-pulse" : ""} />
              {loading ? "Submitting Quote..." : "Submit Quote Request"}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;