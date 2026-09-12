import { useEffect } from "react";
import Layout from "@/components/Layout";
import Products from "@/components/Products";
import TrustIndicators from "@/components/TrustIndicators";

const ProductsPage = () => {
  useEffect(() => {
    document.title = "Bulk Guest Amenities in Eswatini | Milan_sz Products";
  }, []);

  return (
    <Layout>
      <Products />
      <TrustIndicators />
    </Layout>
  );
};

export default ProductsPage;
