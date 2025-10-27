import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const { items, updateQty, removeItem, getSubtotal, itemCount } = useCart();

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

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>

          <div className="bg-white p-8 rounded shadow text-center">
            <p className="text-lg">Your Cart Is Empty</p>
            <Link to="/" className="mt-4 inline-block text-green-500 underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="text-sm text-gray-600 mb-2">Home / Shopping Cart</nav>
          <h1 className="text-4xl font-semibold">Shopping Cart</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white p-6 rounded shadow">
              <div className="hidden md:grid grid-cols-12 gap-4 text-sm text-gray-500 border-b pb-3 mb-4">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">SubTotal</div>
              </div>

              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.sku}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-12 md:col-span-6 flex items-start gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-28 h-28 object-cover rounded bg-gray-50"
                      />
                    </div>
                    <Link
                      to={`/products/${item.sku}`}
                      className="text-lg font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
