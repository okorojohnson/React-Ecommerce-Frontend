import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { PlusIcon } from "lucide-react";

const ProductGrid = () => {
  // Context values
  const { products, loading, error } = useProducts();
  const items = Array.isArray(products) ? products : products?.data ?? [];

  // Pagination constants
  const INITIAL_COUNT = 10;
  const STEP = 10;

  // State management
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [showPrice, setShowPrice] = useState(null);

  // Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-slate-200">
        <div className="text-gray-600 font-medium">Loading products...</div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="text-red-500 text-center h-64 px-20 flex justify-center items-center font-bold text-xl">
        Error occurred. Try again later.
      </div>
    );
  }

  // Empty state
  if (!items || items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
        No products available
      </div>
    );
  }

  // Get products to display
  const displayedProducts = items.slice(0, visibleCount);
  const canSeeMore = visibleCount < items.length;

  // Handle plus icon click to show/hide price
  const handlePlusClick = (productSku) => {
    setShowPrice(showPrice === productSku ? null : productSku);
  };

  // Handle see more / see less button
  const handleSeeMore = () => {
    if (canSeeMore) {
      setVisibleCount((c) => Math.min(c + STEP, items.length));
    } else {
      setVisibleCount(INITIAL_COUNT);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Product Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {displayedProducts.map((product) => (
            <div key={product.sku} className="break-inside-avoid mb-4 sm:mb-6">
              {/* Product Image Card */}
              <Link to={`/products/${product.sku}`} className="block">
                <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={
                      product.images?.[0]?.url || "/placeholders/bg_hero.svg"
                    }
                    alt={product.images?.[0]?.alt || product.name}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>

              {/* Product Info Below Card */}
              <div className="mt-3 flex items-center justify-start gap-3">
                {/* Plus Icon Button */}
                <button
                  type="button"
                  onClick={() => handlePlusClick(product.sku)}
                  className="flex-shrink-0 w-6 h-6 bg-[#7DB800] hover:bg-[#7DB800]/80 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  aria-label={`${
                    showPrice === product.sku ? "Hide" : "Show"
                  } price for ${product.name}`}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>

                {/* Product Name */}
                <h3 className="text-sm font-light text-gray-900 flex-1 mr-2">
                  <Link
                    to={`/products/${product.sku}`}
                    className="hover:underline line-clamp-2"
                  >
                    {product.name}
                  </Link>
                </h3>
              </div>

              {/* Price Display (shows when plus is clicked) */}
              {showPrice === product.sku && (
                <div className="mt-2 p-3 bg-gray-100 rounded">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900">
                      ${product.price?.toFixed(2) || "0.00"}
                    </span>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <span className="text-xs text-gray-600 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    <span
                      className={`text-xs font-semibold ${
                        product.inStock ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* See More / See Less Button */}
        {items.length > INITIAL_COUNT && (
          <div className="text-center mt-8">
            <button
              type="button"
              onClick={handleSeeMore}
              className="inline-flex items-center justify-center gap-2 bg-[#7DB800] hover:bg-[#7DB800]/80 text-white px-6 sm:px-8 py-3 rounded font-semibold transition-all duration-300 drop-shadow-lg"
              aria-label={
                canSeeMore ? "See more products" : "Collapse products"
              }
            >
              {canSeeMore ? "See More" : "See Less"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
