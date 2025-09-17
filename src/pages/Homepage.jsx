import React from "react";
import { useProducts } from "../context/ProductsContext";
import Hero from "../components/Hero";
import ProductGrid from "../components/ProductGrid";

const HomePage = () => {
  const { products } = useProducts();
  console.log(products);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <ProductGrid />
    </div>
  );
};

export default HomePage;
