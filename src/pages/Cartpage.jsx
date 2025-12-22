import React, { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Minus, Plus, Trash } from "lucide-react";

const Cart = () => {
  const { items, updateQty, removeItem, getSubTotal, itemCount } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [zip, setZip] = useState("");

  // Checkout functionality
  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/acct", { state: { from: "/cart" } });
    }
    navigate("/checkout");
  };

  // Empty state (visual polish only)
  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-6">
            Shopping Cart
          </h1>

          <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-sm">
            <p className="text-lg text-gray-700">Your cart is empty</p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-md bg-black text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="bg-[url('/placeholders/bg_hero.svg')] bg-cover bg-center">
        <div className="bg-black/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <nav className="text-sm text-white/80 mb-2">
              Home / Shopping Cart
            </nav>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Shopping Cart
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 12-col grid to mirror Figma (8 / 4 split on lg+) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Cart table */}
          <section className="lg:col-span-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Header row */}
              <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 border-b border-gray-200 px-6 py-3">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="grid grid-cols-12 gap-4 px-6 py-6"
                  >
                    {/* Item info */}
                    <div className="col-span-12 md:col-span-6 flex items-start gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-md bg-gray-50 border border-gray-200"
                      />
                      <div className="flex-1">
                        <Link
                          to={`/products/${item.sku}`}
                          className="text-base md:text-lg font-medium text-gray-900 hover:underline"
                        >
                          {item.name}
                        </Link>

                        {/* Meta (as in Figma: muted, small, tidy) */}
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[13px] text-gray-500">
                            <span className="text-gray-700 font-semibold">
                              Size:
                            </span>{" "}
                            29
                          </p>
                          <p className="text-[13px] text-gray-500">
                            <span className="text-gray-700 font-semibold">
                              Color:
                            </span>{" "}
                            Green
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.sku)}
                          className="group inline-flex items-center gap-1 mt-3 text-xs text-red-600 hover:text-red-700"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-6 md:col-span-2 md:text-right">
                      <div className="text-sm md:text-base font-semibold text-gray-900">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>

                    {/* Qty control */}
                    <div className="col-span-6 md:col-span-2 flex items-center justify-start md:justify-center">
                      <div className="inline-flex items-center rounded-md border border-gray-300 overflow-hidden">
                        <button
                          onClick={() =>
                            updateQty(item.sku, Math.max(0, item.qty - 1))
                          }
                          className="px-2 py-2 hover:bg-gray-50"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateQty(
                              item.sku,
                              Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className="w-16 text-center text-sm py-2 outline-none focus:ring-0 border-x border-gray-300"
                        />
                        <button
                          onClick={() => updateQty(item.sku, item.qty + 1)}
                          className="px-2 py-2 hover:bg-gray-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Line subtotal */}
                    <div className="col-span-12 md:col-span-2 md:text-right">
                      <div className="text-sm md:text-base font-semibold text-gray-900">
                        ${(item.price * item.qty).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon + Update actions */}
              <div className="px-6 py-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  {/* Apply code */}
                  <div className="w-full md:max-w-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Apply Discount Code
                    </p>
                    <div className="flex">
                      <input
                        type="text"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        placeholder="SALE2020"
                        className="flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      />
                      <button
                        className="rounded-r-md bg-black text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                        type="button"
                      >
                        Apply Discount
                      </button>
                    </div>
                  </div>

                  {/* Update cart */}
                  <button
                    onClick={() => navigate("/checkout")}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 transition"
                  >
                    Update Shopping Cart
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Summary */}
          <aside className="lg:col-span-4">
            <div className="bg-[#F5F5F5] border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Summary
              </h2>

              {/* Estimate Shipping and Tax (collapsed style header) */}
              <div className="mb-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-800"
                >
                  <span>Estimate Shipping and Tax</span>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>

                {/* Form */}
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="Please select a region"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Zip/Postal Code
                    </label>
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="200100"
                    />
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="text-sm text-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ${getSubTotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Order Total</span>
                  <span className="font-semibold">
                    ${getSubTotal().toFixed(2)}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-4 mt-4 flex items-center justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>${getSubTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleCheckout}
                className="mt-6 w-full rounded-md bg-[#39B54A] text-white py-3 text-sm font-semibold hover:opacity-95 transition"
              >
                Proceed to Checkout
              </button>

              <small className="mt-3 block text-center text-gray-400 text-xs underline underline-offset-2">
                Check Out with Multiple Addresses
              </small>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
