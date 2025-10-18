import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Minus,
  Plus,
  Heart,
  Mail,
} from "lucide-react";

// Local Fallbacks
const HARD_FALLBACK_BY_CATEGORY = {
  Chairs: "/placeholders/bg_hero.svg",
  Sofas: "/placeholders/bg_hero.svg",
  Desks: "/placeholders/bg_hero.svg",
  Tables: "/placeholders/bg_hero.svg",
  Lighting: "/placeholders/bg_hero.svg",
  Shelves: "/placeholders/bg_hero.svg",
  Beds: "/placeholders/bg_hero.svg",
  Storage: "/placeholders/bg_hero.svg",
  Stools: "/placeholders/bg_hero.svg",
  "Side Tables": "/placeholders/bg_hero.svg",
  Benches: "/placeholders/bg_hero.svg",
  "TV Stands": "/placeholders/bg_hero.svg",
  Outdoor: "/placeholders/bg_hero.svg",
};

const DEFAULT_HARD_FALLBACK = "/placeholders/bg_hero.svg";

const ProductDetailsPage = () => {
  // Get URL parameters
  const params = useParams();
  const sku = params.sku ?? params.id ?? params.productId ?? "";
  const location = useLocation();
  const navigate = useNavigate();

  // Contexts
  const { products, loading, error } = useProducts();
  const { items, addItem, updateQty, removeItem } = useCart();
  const { show: showToast } = useToast?.() || { show: () => {} };

  // Safely handle products array
  const list = Array.isArray(products) ? products : products?.data ?? [];

  // Find product by SKU
  const product = useMemo(() => {
    if (!sku) return null;
    return list.find((p) => p.sku === sku) || null;
  }, [list, sku]);

  // Get hard fallback image for category
  const hardFallback =
    HARD_FALLBACK_BY_CATEGORY[product?.category] || DEFAULT_HARD_FALLBACK;

  // Parse image index from query string or location state
  const qsIndex = Number(new URLSearchParams(location.search).get("img"));
  const stateIndex = Number(location.state?.imageIndex);
  const requestedIndex = Number.isFinite(qsIndex)
    ? qsIndex
    : Number.isFinite(stateIndex)
    ? stateIndex
    : 0;

  // Build images array with fallbacks
  const images = useMemo(() => {
    if (!product) return [];

    const provided = (product.images || []).filter(Boolean).map((img) => ({
      url: img.url,
      alt: img.alt || product.name,
    }));

    const desired = Math.max(4, provided.length || 1);

    // Generate pretty fallback URLs using picsum
    const prettySeed =
      product.category || product.collections || product.name || "furniture";
    const pretty = (i) =>
      `https://picsum.photos/seed/${encodeURIComponent(
        `${prettySeed}-${i + 1}`
      )}/800/800`;

    const fallbacks = Array.from(
      { length: desired - provided.length },
      (_, i) => ({
        url: pretty(i),
        alt: product.name,
      })
    );

    const result = [...provided, ...fallbacks];
    if (result.length === 0) {
      result.push({ url: pretty(0), alt: product.name });
    }

    return result;
  }, [product?.images, product?.name, product?.category, product?.collections]);

  // Image index state
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, requestedIndex), Math.max(0, images.length - 1))
  );

  // Update index when product or images change
  useEffect(() => {
    const safe = Math.min(
      Math.max(0, requestedIndex),
      Math.max(0, images.length - 1)
    );
    setIndex(safe);
  }, [product?.sku, images.length, requestedIndex]);

  const current = images[index] || images[0];

  // Quantity state
  const [qty, setQty] = useState(1);

  // Sync local quantity with cart when product items change
  useEffect(() => {
    if (!product) return;

    const existing = items.find((i) => i.sku === product.sku);
    if (existing) {
      setQty(existing.qty);
    } else {
      setQty(1);
    }
  }, [product?.sku, items]);

  // Increment quantity
  const handleInc = () => {
    const existing = items.find((i) => i.sku === product.sku);

    if (existing) {
      const next = existing.qty + 1;
      updateQty(product.sku, next);
      setQty(next);
      showToast?.(`${product.name} quantity updated: ${next}`);
    } else {
      addItem(product, 1);
      setQty(1);
      showToast?.(`${product.name} added to cart`);
    }
  };

  // Decrement quantity
  const handleDec = () => {
    const existing = items.find((i) => i.sku === product.sku);

    if (existing) {
      const next = existing.qty - 1;
      if (next <= 0) {
        removeItem(product.sku);
        setQty(1);
        showToast?.(`${product.name} removed from cart`);
      } else {
        updateQty(product.sku, next);
        setQty(next);
        showToast?.(`${product.name} quantity updated: ${next}`);
      }
    } else {
      setQty((q) => Math.max(1, q - 1));
    }
  };

  // Generate star rating
  const stars = useMemo(() => {
    const avg = Math.round(product?.rating?.average ?? 0);
    return Array.from({ length: 5 }, (_, i) => (i < avg ? "★" : "☆")).join("");
  }, [product?.rating?.average]);

  // Find related products
  const related = useMemo(() => {
    if (!product) return [];

    return list
      .filter(
        (p) =>
          p.sku !== product.sku &&
          (p.category === product.category ||
            p.collections === product.collections)
      )
      .slice(0, 4);
  }, [list, product]);

  // Navigation functions
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  // Loading UI
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-slate-200">
        <div className="text-gray-600 font-medium">Loading product...</div>
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

  // Not Found UI
  if (!product) {
    return (
      <div className="text-red-500 text-center h-64 px-20 flex flex-col gap-2 justify-center items-center font-bold text-xl">
        <p>Product not found</p>
        <Link
          to="/"
          className="underline underline-offset-2 font-normal text-base"
        >
          Go back to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-700 mb-10">
          <Link to="/" className="text-gray-400 hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <span className="text-gray-400">{product.category}</span>
              <span className="mx-2">/</span>
            </>
          )}
          {product.collections && (
            <span className="text-gray-700">{product.collections}</span>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Image Gallery */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm relative">
              <img
                src={current?.url || hardFallback}
                alt={current?.alt || product.name}
                className="w-full h-auto object-contain aspect-square"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.src !== hardFallback) {
                    e.currentTarget.src = hardFallback;
                  }
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black w-10 h-10 rounded-full shadow flex items-center justify-center transition"
                    onClick={prev}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black w-10 h-10 rounded-full shadow flex items-center justify-center transition"
                    onClick={next}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.url || idx}
                    type="button"
                    onClick={() => setIndex(idx)}
                    className={`border rounded overflow-hidden focus:outline-none transition ${
                      idx === index
                        ? "ring-2 ring-black"
                        : "hover:ring-1 hover:ring-gray-700"
                    }`}
                    aria-label={`Image ${idx + 1} for ${product.name}`}
                  >
                    <img
                      src={img.url || hardFallback}
                      alt={img.alt || product.name}
                      className="w-full h-20 object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        if (e.currentTarget.src !== hardFallback) {
                          e.currentTarget.src = hardFallback;
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-black mb-4">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="mt-2 flex items-center gap-3 text-sm mb-6">
              <span className="text-yellow-500" aria-hidden>
                {stars}
              </span>
              <span className="text-gray-700">
                {product.rating?.average?.toFixed?.(1) || "0.0"}
              </span>
              <span className="text-gray-500">
                ({product.rating?.count || 0} reviews)
              </span>
            </div>

            {/* Price & Stock */}
            <div className="mt-8 flex items-center justify-between border-b border-gray-200 pb-6 mb-6">
              <div>
                <p className="uppercase text-gray-500 text-xs tracking-wider">
                  as low as
                </p>
                <p className="text-3xl font-semibold text-black">
                  ${product.price?.toFixed(2) || "0.00"}
                </p>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <p className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </p>
                  )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  {product.inStock ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">In stock</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-red-600" />
                      <span className="text-red-700">Out of stock</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">SKU: {product.sku}</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-700 mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-6 mb-8">
              <label className="block text-sm font-medium text-black mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={handleDec}
                    className="p-2 hover:bg-gray-100 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[2rem] text-center font-medium select-none">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={handleInc}
                    className="p-2 hover:bg-gray-100 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <AddToCartButton product={product} qty={qty} />
              </div>
            </div>

            {/* Additional Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600 border-t pt-6">
              <button
                type="button"
                className="inline-flex items-center gap-2 hover:text-black transition"
                aria-label="Add to waitlist"
              >
                <Heart className="w-4 h-4" />
                Add to waitlist
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 hover:text-black transition"
                aria-label="Add to compare"
              >
                Add to compare
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 hover:text-black transition"
                aria-label="Email product"
              >
                <Mail className="w-4 h-4" />
                Email
              </button>
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <Accordion product={product} />

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-12 pt-8">
            <h2 className="text-center text-2xl font-semibold mb-8">
              Related Products
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <Link
                  key={p.sku}
                  to={`/products/${p.sku}`}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group"
                >
                  <div className="bg-gray-100 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition">
                    <img
                      src={p.images?.[0]?.url || hardFallback}
                      alt={p.images?.[0]?.alt || p.name}
                      className="w-full h-40 object-cover group-hover:opacity-80 transition"
                      onError={(e) => {
                        if (e.currentTarget.src !== hardFallback) {
                          e.currentTarget.src = hardFallback;
                        }
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-black group-hover:underline line-clamp-2">
                      {p.name}
                    </p>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {p.originalPrice && p.originalPrice > p.price && (
                      <span className="text-gray-400 line-through text-sm">
                        ${p.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="font-semibold text-black">
                      ${p.price?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-yellow-500" aria-hidden>
                      {stars}
                    </span>
                    <span className="text-gray-700">
                      {p.rating?.average?.toFixed?.(1) || "0.0"}
                    </span>
                    <span className="text-gray-500">
                      ({p.rating?.count || 0})
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Accordion = ({ product }) => {
  const [open, setOpen] = useState(0);

  const sections = [
    {
      title: "Details",
      content: product.description || "No details available",
    },
    {
      title: "Sizes",
      content: product.dimensions
        ? `Height: ${product.dimensions.height} | Width: ${
            product.dimensions.width
          } | Depth: ${product.dimensions.depth} ${
            product.dimensions.unit || "cm"
          }`
        : "Dimensions not available",
    },
    {
      title: "Care Instructions",
      content: product.careInstructions || "No care instructions provided",
    },
    {
      title: "Materials",
      content: product.materials?.length
        ? product.materials.join(", ")
        : "Material information not available",
    },
    {
      title: "Packing Information",
      content: "Ships in standard packaging",
    },
    {
      title: "Product Availability",
      content: product.inStock ? "Currently in stock" : "Out of stock",
    },
    {
      title: "Reviews",
      content: `${product.rating?.count || 0} customer reviews`,
    },
  ];

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 divide-y">
      {sections.map((section, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-start py-4 text-left gap-4 hover:bg-gray-50 transition"
          >
            <span className="text-black text-2xl font-light flex-shrink-0">
              {open === i ? "−" : "+"}
            </span>
            <span className="text-black font-semibold text-lg">
              {section.title}
            </span>
          </button>
          {open === i && (
            <div className="pb-4 pl-10 font-light text-gray-700 leading-relaxed">
              {section.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AddToCartButton = ({ product, qty }) => {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { show: showToast } = useToast?.() || { show: () => {} };

  const handleAddToCart = () => {
    addItem(product, qty);
    showToast?.(`${product.name} added to cart`);
    navigate("/cart");
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={!product.inStock}
      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition-colors"
      aria-label={`Add ${product.name} to cart`}
    >
      {product.inStock ? "Add to Cart" : "Out of Stock"}
    </button>
  );
};

export default ProductDetailsPage;
