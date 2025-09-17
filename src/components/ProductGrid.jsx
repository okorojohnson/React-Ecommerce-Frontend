import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { Plus } from "lucide-react";

const ProductGrid = () => {
  // Bring in the context values
  const { products, loading, error } = useProducts();
  const [showPrice, setShowPrice] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        Loading Products ...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        Error: {error}
      </div>
    );
  }

  // Show only the first 7
  const displayProducts = products.data.slice(0, 7);

  const handlePlusClick = (productSku) => {
    setShowPrice(showPrice === productSku ? null : productSku);
  };

  return (
    <section className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 2-column masonry */}
        <div className="columns-2 gap-4 space-y-4">
          {displayProducts.map((product) => (
            <div className="break-inside-avoid mb-4" key={product.sku}>
              {/* Product card image */}
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <img
                  src={product.images[0]?.url || ""}
                  alt={product.images[0]?.alt || "Random alt"}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>

              {/* Product info below card */}
              <div className="mt-3 items-center justify-center">
                <h3 className="text-sm font-medium text-gray-900 flex-1 mr-2">
                  {product.name}
                </h3>
              </div>

              {/* Plus icon */}
              <button onClick={() => handlePlusClick(product.sku)}>
                <Plus />
              </button>

              {/* Conditional Price Display */}
              {showPrice === product.sku && (
                <div className="mt-2 bg-gray-100 rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">
                      ${product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span>${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button>See More</button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
