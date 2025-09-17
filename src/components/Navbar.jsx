import {
  LucideSearch,
  Menu,
  ShoppingBag,
  X,
  ChevronDown,
  LucideHeart,
  LucideUser,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Mock data for Links
const LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/elements", label: "Elements" },
  { to: "/pages", label: "Pages" },
  { to: "/shop", label: "Shop" },
];

const Navbar = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const lastY = useRef(0);

  const mqlRef = useRef(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 770px)")
      : {
          matches: true,
          addEventListener: () => {},
          removeEventListener: () => {},
        }
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      if (!mqlRef.current.matches || !isHome) return;

      const y = window.scrollY;
      const goingUp = y < lastY.current;

      if (goingUp && y > 10) setSolid(true);
      if (!goingUp || y <= 10) setSolid(false);

      lastY.current = y;
    };

    const onChange = () => {
      if (!isHome) {
        setSolid(false);
        lastY.current = window.scrollY || 0;
        return;
      }
      setSolid(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    mqlRef.current.addEventListener?.("change", onChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      mqlRef.current.removeEventListener?.("change", onChange);
    };
  }, [isHome]);

  const linkClass = (to) =>
    `block py-2 hover:text-smGreen hover:underline underline-offset-4 transition-colors ${
      location.pathname === to ? "text-smGreen underline" : ""
    }`;

  const mobileBar =
    open || !isHome
      ? "bg-white text-gray-900 border-b"
      : solid
      ? "bg-white text-gray-900 border-b"
      : "bg-transparent text-white";

  const desktopBar = !isHome
    ? "bg-smBlack text-white static"
    : solid
    ? "bg-white text-gray-900 border-b fixed top-0 left-0 right-0 z-40"
    : "bg-transparent text-white absolute z-40 w-full";

  const logoShadowClass = isHome && solid ? "drop-shadow-md" : "";

  return (
    <>
      {/* Mobile Nav */}
      <nav
        className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${mobileBar}`}
      >
        <div className="mx-auto max-w-screen-2xl px-4 h-16 flex items-center justify-between">
          <button
            className="inline-flex items-center justify-center rounded-lg p-2 ring-1 ring-current/20 transition"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="w-5 h-5 transition-transform duration-200 rotate-90" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-200" />
            )}
          </button>

          <Link to="/" className="inline-flex items-center">
            <img src="/sm_logo.svg" alt="SimpleWood" className="h-7" />
          </Link>

          <div className="flex items-center gap-4">
            <button aria-label="Search">
              <LucideSearch className="h-5 w-5" />
            </button>
            <Link to="/cart" className="relative inline-flex" aria-label="Cart">
              <span className="w-5 h-5 bg-smGreen text-white rounded-full flex items-center justify-center text-[10px] absolute -right-2 -top-2">
                2
              </span>
              <img src="/cart.svg" alt="Cart" className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`fixed inset-0 z-50 md:hidden ${
            open ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <div
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black/40 transition-opacity ${
              open ? "opacity-100" : "opacity-0"
            }`}
          />
          <aside
            id="mobile-drawer"
            className={`absolute left-0 top-0 h-full w-72 bg-white text-gray-900 shadow-xl transform transition-transform duration-300 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 border-b">
              <div className="relative flex items-center">
                <input
                  type="search"
                  className="w-full bg-gray-100 rounded-full px-4 py-2 pr-10 outline-none"
                  placeholder="Search"
                />
                <LucideSearch className="absolute right-3 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <nav className="p-4">
              <ul className="space-y-3">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className={linkClass(l.to)}
                      onClick={() => setOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span>English</span> <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span>USD</span> <ChevronDown className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <LucideHeart className="h-5 w-5" />
                  <LucideUser className="h-5 w-5" />
                </div>
              </div>
            </nav>
          </aside>
        </div>
      </nav>

      {/* Desktop Nav */}
      <nav
        className={`hidden md:flex min-h-[170px] px-[150px] py-[25px] flex-col transition-colors duration-300 ${desktopBar}`}
      >
        <section className="flex items-center justify-between w-full">
          <div className="min-w-[177px] min-h-[44px] bg-white rounded-full relative flex items-center justify-center px-4 border border-gray-200 shadow-sm">
            <input
              type="search"
              className="bg-transparent placeholder:text-gray-400 border-none outline-none text-smBlack text-sm w-[277px] focus:ring-2 focus:ring-green-500/20 rounded-full"
              placeholder="Search"
            />
            <LucideSearch className="text-[7px] h-4 w-4 absolute right-[16px] text-[#B5B5B5]" />
          </div>

          <div>
            <img
              src="/sm_logo.svg"
              alt="SimpleWood"
              className={logoShadowClass}
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center justify-center gap-2">
              <span>English</span> <ChevronDown className="w-4 h-4 mt-1" />
            </span>
            <span className="flex items-center justify-center gap-2">
              <span>USD</span> <ChevronDown className="w-4 h-4 mt-1" />
            </span>

            <LucideHeart className="h-4 w-4 cursor-pointer" />
            <LucideUser className="h-4 w-4 cursor-pointer" />

            <div className="relative">
              <span className="w-3 h-3 bg-smGreen text-white rounded-full flex items-center justify-center text-xs absolute -right-1 -top-1">
                2
              </span>
              <img src="/cart.svg" alt="Cart" className="h-4 w-4" />
            </div>
          </div>
        </section>

        <section>
          <ul className="space-x-[35px] w-full flex items-center justify-center mt-[40px]">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`hover:text-smGreen hover:underline underline-offset-4 duration-300 transition-colors ${
                    location.pathname === l.to ? "text-smGreen underline" : ""
                  }`}
                >
                  {l.label}
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
