import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const COMPARE_KEY = "sw_compare_v1";
const WISHLIST_KEY = "sw_wishlist_v1";

const sampleProducts = Array.from({ length: 24 }).map((_, i) => ({
  id: `p-${i + 1}`,
  title: `Classic Chair ${i + 1}`,
  price: +(30 + (i % 8) * 12 + Math.round(Math.random() * 10)).toFixed(2),
  category: ["Chairs", "Tables", "Storage"][i % 3],
  color: ["Natural", "White", "Dark"][i % 3],
  rating: (3 + (i % 3)).toFixed(1),
  image: `https://via.placeholder.com/400x360?text=Chair+${i + 1}`,
  badges: i % 6 === 0 ? ["sale"] : [],
}));

const uniq = (arr) => Array.from(new Set(arr));

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const Cataloguepage = () => {
  const { addItem } = useCart() || {};
  const [products] = useState(sampleProducts);

  // filters / ui
  const [showFilters, setShowFilters] = useState(false); // mobile toggle
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [view, setView] = useState("grid"); // grid | list
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(9);

  // compare & wishlist
  const [compare, setCompare] = useState(() => readJson(COMPARE_KEY, []));
  const [wishlist, setWishlist] = useState(() => readJson(WISHLIST_KEY, []));

  useEffect(() => writeJson(COMPARE_KEY, compare), [compare]);
  useEffect(() => writeJson(WISHLIST_KEY, wishlist), [wishlist]);

  const categories = useMemo(
    () => uniq(products.map((p) => p.category)),
    [products]
  );
  const colors = useMemo(() => uniq(products.map((p) => p.color)), [products]);
  const maxPrice = useMemo(
    () => Math.max(...products.map((p) => p.price)),
    [products]
  );

  // filtering & sorting
  const filtered = useMemo(() => {
    let list = products.slice();

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (category) list = list.filter((p) => p.category === category);
    if (color) list = list.filter((p) => p.color === color);
    if (priceMax) {
      const max = Number(priceMax) || maxPrice;
      list = list.filter((p) => p.price <= max);
    }

    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest") list.sort((a, b) => (a.id < b.id ? 1 : -1));

    return list;
  }, [products, query, category, color, priceMax, sortBy, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // actions
  const toggleCompare = (id) => {
    setCompare((prev) => {
      const exists = prev.includes(id);
      const next = exists
        ? prev.filter((p) => p !== id)
        : [id, ...prev].slice(0, 3);
      return next;
    });
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      return exists ? prev.filter((p) => p !== id) : [id, ...prev];
    });
  };

  const handleAddToCart = (p) => {
    if (typeof addItem === "function") addItem({ ...p, quantity: 1 });
    else console.warn("addItem not available from CartContext");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">Catalogue</h1>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <label className="text-sm text-gray-600">View</label>
              <button
                onClick={() => setView("grid")}
                className={`px-2 py-1 rounded ${
                  view === "grid" ? "bg-swGreen text-white" : "bg-gray-100"
                }`}
                aria-pressed={view === "grid"}
              >
                🔳
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-2 py-1 rounded ${
                  view === "list" ? "bg-swGreen text-white" : "bg-gray-100"
                }`}
                aria-pressed={view === "list"}
              >
                📋
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-gray-100"
                onClick={() => {
                  setCompare(readJson(COMPARE_KEY, []));
                  setWishlist(readJson(WISHLIST_KEY, []));
                }}
                title="Refresh lists"
              >
                🔁 Refresh
              </button>

              <div className="text-sm text-gray-600">
                Compare: {compare.length}
              </div>
              <div className="text-sm text-gray-600">
                Wishlist: {wishlist.length}
              </div>
            </div>

            <button
              className="sm:hidden px-3 py-1 rounded bg-gray-100"
              onClick={() => setShowFilters((s) => !s)}
            >
              {showFilters ? "Close" : "Filters"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar / Filters */}
          <aside
            className={`md:col-span-3 ${
              showFilters ? "block" : "hidden"
            } md:block bg-white border rounded p-4 shadow-sm`}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Search products..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max price (${priceMax || Math.ceil(maxPrice)})
              </label>
              <input
                type="range"
                min="0"
                max={Math.ceil(maxPrice)}
                value={priceMax || Math.ceil(maxPrice)}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low &rarr; High</option>
                <option value="price-desc">Price: High &rarr; Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("");
                  setColor("");
                  setPriceMax("");
                  setSortBy("featured");
                }}
                className="px-3 py-2 bg-gray-100 rounded text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-3 py-2 bg-swGreen text-white rounded text-sm"
              >
                Apply
              </button>
            </div>
          </aside>

          {/* Product grid/list */}
          <section className="md:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Showing {filtered.length} result
                {filtered.length !== 1 ? "s" : ""}
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Per page</label>
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paged.map((p) => (
                  <article
                    key={p.id}
                    className="border rounded overflow-hidden shadow-sm bg-white"
                  >
                    <Link to={`/product/${p.id}`} className="block">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-56 object-cover"
                      />
                    </Link>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">{p.title}</h3>
                        <div className="text-sm text-gray-500">
                          ${p.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {p.category} · {p.color} · ⭐ {p.rating}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddToCart(p)}
                          className="flex-1 px-3 py-2 bg-swGreen text-white rounded text-sm"
                        >
                          🛒 Add
                        </button>
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`px-3 py-2 rounded border text-sm ${
                            wishlist.includes(p.id)
                              ? "bg-red-50 border-red-300"
                              : "bg-white"
                          }`}
                          aria-pressed={wishlist.includes(p.id)}
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className={`px-3 py-2 rounded border text-sm ${
                            compare.includes(p.id)
                              ? "bg-yellow-50 border-yellow-300"
                              : "bg-white"
                          }`}
                        >
                          🔁
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paged.map((p) => (
                  <article
                    key={p.id}
                    className="flex gap-4 border rounded p-3 items-center"
                  >
                    <Link
                      to={`/product/${p.id}`}
                      className="w-32 flex-shrink-0"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-24 object-cover rounded"
                      />
                    </Link>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{p.title}</h3>
                      <div className="text-sm text-gray-500">
                        {p.category} · {p.color}
                      </div>
                      <p className="text-sm mt-2">${p.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(p)}
                        className="px-3 py-2 bg-swGreen text-white rounded text-sm"
                      >
                        🛒 Add
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className="px-3 py-2 border rounded text-sm"
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => toggleCompare(p.id)}
                          className="px-3 py-2 border rounded text-sm"
                        >
                          🔁
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* pagination */}
            <footer className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        page === i + 1
                          ? "bg-swGreen text-white"
                          : "bg-white border"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cataloguepage;
