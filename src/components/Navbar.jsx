import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Heart,
  Search,
  User,
  Menu,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCart } from "../context/CartContext";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/elements", label: "Elements" },
  { to: "/pages", label: "Pages" },
  { to: "/shop", label: "Shop" },
  { to: "/sale", label: "Sale" },
];

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { itemCount } = useCart();

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Solid navbar state (when scrolled on home)
  const [solid, setSolid] = useState(false);

  // Bump animation state for cart
  const [bump, setBump] = useState(false);

  // Handle scroll event
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Only apply solid nav when scrolled on home page
    if (!isHome) {
      setSolid(false);
      return;
    }

    const onScroll = () => {
      setSolid(window.scrollY > 10);
    };

    // Initialize on mount
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  // Trigger bump animation when cart updates
  useEffect(() => {
    if (itemCount > 0) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 600);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Determine navbar styling based on state
  const mobileBarClass =
    mobileOpen || !isHome
      ? "bg-white text-gray-900 border-b"
      : solid
      ? "bg-white text-gray-900 border-b"
      : "bg-transparent text-white";

  const desktopBarClass = !isHome
    ? "bg-black text-white static"
    : solid
    ? "bg-white text-gray-900 border-b fixed top-0 left-0 right-0 z-40"
    : "bg-transparent text-white absolute z-40 w-full";

  const logoClass = isHome && solid ? "drop-shadow-md" : "";

  // Determine link styling
  const getLinkClass = (to) =>
    `block py-2 hover:text-green-500 hover:underline underline-offset-4 transition-colors ${
      location.pathname === to ? "text-green-500 underline" : ""
    }`;

  const getDesktopLinkClass = (to) =>
    `hover:text-green-500 hover:underline underline-offset-4 duration-300 transition-colors ${
      location.pathname === to ? "text-green-500 underline" : ""
    }`;

  return (
    <>
      {/* Mobile Navbar */}
      <nav
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${mobileBarClass}`}
      >
        <div className="mx-auto max-w-screen-2xl px-4 h-16 flex items-center justify-between">
          {/* Menu Toggle Button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 ring-1 ring-current/20 transition hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>

          {/* Logo */}
          <Link to="/" className="inline-flex items-center">
            <img src="/sm_logo.svg" alt="SimpleWood" className="h-7" />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-1 hover:bg-gray-100 rounded transition"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/cart"
              className="relative inline-flex p-1 hover:bg-gray-100 rounded transition"
              aria-label={`Cart with ${itemCount} items`}
            >
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {itemCount}
                </span>
              )}
              <ShoppingBag className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`fixed inset-0 z-50 md:hidden ${
            mobileOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          onClick={() => setMobileOpen(false)}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${
              mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Drawer */}
          <aside
            id="mobile-drawer"
            className={`absolute left-0 top-0 h-full w-72 bg-white text-gray-900 shadow-xl transform transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative flex items-center">
                <input
                  type="search"
                  className="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-green-500/50"
                  placeholder="Search"
                />
                <Search className="absolute right-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <ul className="space-y-3">
                {LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={getLinkClass(link.to)}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Footer Options */}
              <div className="mt-6 space-y-3 text-sm text-gray-700 border-t pt-4">
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                  <span>English</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900">
                  <span>USD</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Heart className="h-5 w-5 cursor-pointer hover:fill-red-500 hover:text-red-500 transition" />
                  <User className="h-5 w-5 cursor-pointer hover:text-gray-900 transition" />
                </div>
              </div>
            </nav>
          </aside>
        </div>
      </nav>

      {/* Desktop Navbar */}
      <nav
        className={`hidden md:flex min-h-[170px] px-[150px] py-[25px] flex-col transition-colors duration-300 ${desktopBarClass}`}
      >
        {/* Top Section */}
        <section className="flex items-center justify-between w-full mb-10">
          {/* Search Bar */}
          <div className="min-w-[177px] min-h-[44px] bg-white rounded-full relative flex items-center justify-center px-4 border border-gray-200 shadow-sm">
            <input
              type="search"
              className="bg-transparent placeholder:text-gray-400 border-none outline-none text-gray-900 text-sm w-[277px] focus:ring-2 focus:ring-green-500/20 rounded-full"
              placeholder="Search products..."
            />
            <Search className="h-4 w-4 absolute right-4 text-gray-400" />
          </div>

          {/* Logo */}
          <div className={logoClass}>
            <img src="/sm_logo.svg" alt="SimpleWood" className="h-10" />
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-between gap-6 text-sm">
            {/* Language Selector */}
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-500 transition">
              <span>English</span>
              <ChevronDown className="w-4 h-4 mt-0.5" />
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-2 cursor-pointer hover:text-green-500 transition">
              <span>USD</span>
              <ChevronDown className="w-4 h-4 mt-0.5" />
            </div>

            {/* Icons */}
            <Heart className="h-5 w-5 cursor-pointer hover:fill-red-500 hover:text-red-500 transition" />
            <User className="h-5 w-5 cursor-pointer hover:text-gray-900 transition" />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative inline-flex"
              aria-label={`Cart with ${itemCount} items`}
            >
              {itemCount > 0 && (
                <span
                  className={`absolute -right-2 -top-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold transition-transform ${
                    bump ? "scale-110" : "scale-100"
                  }`}
                >
                  {itemCount}
                </span>
              )}
              <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>
        </section>

        {/* Navigation Links */}
        <section className="border-t border-current/10 pt-6">
          <ul className="flex items-center justify-center gap-8">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={getDesktopLinkClass(link.to)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </nav>
    </>
  );
};

export default Navbar;
