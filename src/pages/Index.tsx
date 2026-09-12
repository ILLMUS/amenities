import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import TrustIndicators from "@/components/TrustIndicators";
import Products from "@/components/Products";
import About from "@/components/About";
import Reviews from "@/components/Reviews";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <TrustIndicators />
      <Products />
      <About />
      <Reviews />
      <Contact />
    </Layout>
  );
};

export default Index;
