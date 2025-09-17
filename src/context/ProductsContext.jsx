import { createContext, useContext, useEffect, useState } from "react";

// Create context with default value to avoid undefined access
const ProductsContext = createContext(null);

// Custom hook for accessing context
export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};

// Provider component
export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://e-commerce-backend-five-iota.vercel.app/api/products/"
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || data);
    } catch (err) {
      setError(err.message || "Failed to load products");
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Utility functions
  const getProductsByCategory = (category) =>
    products.filter(
      (product) => product.category?.toLowerCase() === category.toLowerCase()
    );

  const searchProducts = (searchTerm) =>
    products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getCategories = () => {
    const categories = products
      .map((product) => product.category)
      .filter(Boolean);
    return [...new Set(categories)];
  };

  const refetch = async () => {
    setError(null);
    await loadProducts();
  };

  const value = {
    products,
    loading,
    error,
    getProductsByCategory,
    getCategories,
    searchProducts,
    refetch,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};
