import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";

const ProductDetailsPage = () => {
  // Use the SKU to find the product in the context
  const { sku } = useParams();
  // Bring in the contexts values
  const { products, loading, error, getProductById } = useProducts();

  // Loading UI
  if (loading)
    return (
      <div className="flex justify-center items-center h-64 bg-slate-200">
        Loading...
      </div>
    );

  // Error UI
  if (error)
    return (
      <div className="text-red-500 text-center h-64 px-20 flex justify-center items-center font-bold text-xl capitalize">
        Error Occured Try Again Later
      </div>
    );

  // Allowing check/lookup for both _id, and sku
  const product = getProductById(sku) || products.find((p) => p.sku === sku);

  if (!product) {
    return (
      <div className="text-red-500 text-center h-64 px-20 flex justify-center items-center font-bold text-xl capitalize">
        <p className="text-red-500">Product Not Found</p>
        <Link to="/" className="underline underline-offset-2">
          Go Back To Homepage
        </Link>
      </div>
    );
  }

  // Image Gallery
  const images = useMemo(() => {
    const provided = (product.images || []).filter(Boolean).map((img, i) => ({
      url: img.url,
      alt: img.alt || `${product.name}`,
    }));

    const desired = Math.max(4, provided.length || 1);

    const q = encodeURIComponent(
      [product.category || "furniture", product.collections, product.name]
        .filter(Boolean)
        .join(", ")
    );

    const fallbacks = [];
    for (let i = 0; i < desired - provided.length; i++) {
      // use lightweight stock image as our fallback (vary with sig)
      fallbacks.push({
        url: `https://source.unsplash.com/800x800/?${q}&sig=${i + 1}`,
        alt: `${product.name}`,
      });
    }

    const result = [...provided, ...fallbacks];

    if (result.length === 0) {
      result.push({
        url: "https://source.unsplash.com/random/300x300",
        alt: product.name,
      });
    }

    return result;
    // Only recompute when the product's relevant fields change *---->>>>Subject to change>>>>>>>
  }, [product.images, product.name, product.category, product.collections]);

  // States for the page
  const [index, setIndex] = useState(0);
  const current = images[index] || images[0];

  return <div className="bg-red-500 min-h-screen">ProductDetailsPage</div>;
};

export default ProductDetailsPage;
