import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useLocation, useNavigate } from "react-router-dom";

// all orders stored
const ORDERS_STORAGE_KEY = "sw_orders_v1";
// last order
const LAST_ORDER_KEY = "sw_last_order_v1";
// Shipping details
const SHIPPING_STORAGE_KEY = "sw_shipping_v1";
// Delay in milliseconds before placing an order
const PLACE_ORDER_DELAY = 1500;
// Delay need for the sadhboard page: tbi
const AUTO_DASHBOARD_DELAY = 60000;

const SHIPPING_FORM_TEMPLATE = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  address1: "",
  address2: "",
  city: "",
  country: "",
  state: "",
  zip: "",
  shippingMethod: "best",
  phone: "",
};

// directly from cal;/fetch
// directly from call/fetch
const splitFullName = (fullName = "") => {
  if (!fullName?.trim()) return { first: "", last: "" };

  const parts = fullName.trim().split(/\s+/);

  const [first, ...rest] = parts;

  return { first: first || "", last: rest.join(" ").trim() };
};

// to get user details especially splitted and normalized name
const getUserProfileFields = (user) => {
  if (!user) return { firstName: "", lastName: "", email: "" };

  const derived =
    user.firstName || user.lastName
      ? { first: user.firstName || "", last: user.lastName || "" }
      : splitFullName(user.name);

  return {
    firstName: derived.first || "",
    lastName: derived.last || "",
    email: user.email || "",
  };
};

// json
const safeReadJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const readStoredOrders = () => safeReadJson(ORDERS_STORAGE_KEY, []);

const readLastOrderSnapshot = () => {
  const last = safeReadJson(LAST_ORDER_KEY, null);
  if (last) return last;
  const orders = readStoredOrders();
  return orders[0] || null;
};

const formatCurrency = (value) => `$${value.toFixed(2)}`;

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: "shipping", label: "Shipping" },
    { id: "review", label: "Review & Payments" },
  ];
  const currentIndex = Math.max(
    steps.findIndex((step) => step.id === currentStep),
    0
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {steps.map((step, idx) => {
        const isComplete = idx < currentIndex;
        const isActive = idx === currentIndex;
        const base =
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold";

        const stateClass = isActive
          ? "bg-swGreen text-white"
          : isComplete
          ? "bg-swGreen text-white"
          : "bg-gray-200 text-gray-500";

        return (
          <React.Fragment key={step.id}>
            <div className={`${base} ${stateClass}`}>{idx + 1}</div>
            <span
              className={`text-sm ${
                isActive ? "text-gray-900 font-semibold" : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <span className="w-12 h-px bg-gray-200" aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function Checkout() {
  const { items, clearCart, getSubTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const storedOrders = useMemo(() => readStoredOrders(), []);
  const storedLastOrder = useMemo(() => readLastOrderSnapshot(), []);

  // states
  // removed duplicate declaration and initialize properly
  const [orders, setOrders] = useState(() => storedOrders || []);
  const [orderDetails, setOrderDetails] = useState(storedLastOrder);
  const initialPhase =
    location.state?.view === "dashboard" && storedLastOrder
      ? "dashboard"
      : "shipping";

  const [phase, setPhase] = useState(initialPhase);
  const [formError, setFormError] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [autoRedirectSeconds, setAutoRedirectSeconds] = useState(
    AUTO_DASHBOARD_DELAY / 1000
  );

  // refs
  const countdownRef = useRef(null);
  const redirectRef = useRef(null);

  // functionalities on the page
  // for calling and prefilling user details on inputs
  const userProfileDefaults = useMemo(() => getUserProfileFields(user), [user]);

  // get details and help prefill
  const [form, setForm] = useState(() => {
    const stored = safeReadJson(SHIPPING_STORAGE_KEY, null);
    return stored
      ? { ...SHIPPING_FORM_TEMPLATE, ...stored }
      : { ...SHIPPING_FORM_TEMPLATE, ...userProfileDefaults };
  });

  // shipping details in the localstorage
  useEffect(() => {
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(form));
    } catch {
      // nada
    }
  }, [form]);

  useEffect(() => {
    setForm((prev) => {
      if (!prev) return prev;

      const updates = {};

      if (!prev.firstName?.trim() && userProfileDefaults.firstName) {
        updates.firstName = userProfileDefaults.firstName;
      }
      if (!prev.lastName?.trim() && userProfileDefaults.lastName) {
        updates.lastName = userProfileDefaults.lastName;
      }
      if (!prev.email?.trim() && userProfileDefaults.email) {
        updates.email = userProfileDefaults.email;
      }

      return Object.keys(updates).length ? { ...prev, ...updates } : prev;
    });
  }, [
    userProfileDefaults.firstName,
    userProfileDefaults.lastName,
    userProfileDefaults.email,
  ]);

  // Celebration / end of page logic
  useEffect(() => {
    if (phase !== "celebration" || !orderDetails) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }

      if (redirectRef.current) {
        clearTimeout(redirectRef.current);
        redirectRef.current = null;
      }
      return;
    }

    setAutoRedirectSeconds(AUTO_DASHBOARD_DELAY / 1000);

    countdownRef.current = window.setInterval(() => {
      setAutoRedirectSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    redirectRef.current = window.setTimeout(() => {
      setPhase("dashboard");
    }, AUTO_DASHBOARD_DELAY);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }

      if (redirectRef.current) {
        clearTimeout(redirectRef.current);
        redirectRef.current = null;
      }
    };
  }, [phase, orderDetails]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinueToReview = () => {
    const required = [
      "firstName",
      "lastName",
      "email",
      "address1",
      "city",
      "country",
      "zip",
    ];

    const missing = required.filter((field) => !form[field]?.trim());

    if (missing.length) {
      setFormError("Please fill all required fields before progressing...");

      return;
    }

    setFormError("");
    if (items.length === 0) {
      setFormError("Your cart is empty. Add items before progressing ...");

      return;
    }

    setPhase("review");
  };

  const buildOrderSnapshot = () => {
    const orderNumber = "ORD" + Date.now().toString().slice(-6);

    const now = new Date();
    return {
      orderNumber,
      date: now.toLocaleDateString(),
      items: items.map((i) => ({ ...i })),
      subtotal: getSubTotal(),
      shipping: { ...form },
      user: {
        name:
          user?.name ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email || "",
      },
      status: "Pending",
    };
  };

  const persistOrderSnapshot = (snapshot) => {
    setOrders((prev) => {
      const next = [snapshot, ...prev];
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // nada
      }
      return next;
    });

    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(snapshot));
    } catch {
      // nada
    }
  };

  const finalizeOrder = () => {
    const snapshot = buildOrderSnapshot();
    setOrderDetails(snapshot);
    persistOrderSnapshot(snapshot);
    setTimeout(() => {
      clearCart();
    }, PLACE_ORDER_DELAY);
    return snapshot;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate("/account", { state: { redirect: "/checkout" } });
      return;
    }
    if (items.length === 0) {
      setPhase("shipping");
      setFormError("Your cart is empty, add items before placing an order");

      return;
    }
    setPhase("placing");
    await new Promise((resolve) => setTimeout(resolve, PLACE_ORDER_DELAY));
    finalizeOrder();
    setAutoRedirectSeconds(AUTO_DASHBOARD_DELAY / 1000);
    setPhase("celebration");
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setDiscountApplied(true);
  };

  const handleViewOrder = (order) => {
    setOrderDetails(order);
    setPhase("dashboard");
    try {
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    } catch {
      // nada
    }
  };

  const handleRemoveOrder = (order) => {
    if (!orders?.length) return;

    const next = orders.filter((o) => o.orderNumber !== order.orderNumber);

    setOrders(next);
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // nada
    }

    if (orderDetails?.orderNumber === order.orderNumber) {
      const fallback = next[0] || null;
      setOrderDetails(fallback);
      if (fallback) {
        try {
          localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(fallback));
        } catch {
          // nada
        }
        setPhase("dashboard");
      } else {
        try {
          localStorage.removeItem(LAST_ORDER_KEY);
        } catch {
          // nada
        }
        setPhase("shipping");
      }
    }
  };

  const formatCityLine = (details) => {
    const parts = [details.city, details.state].filter(Boolean).join(", ");

    return `${parts}${details.zip ? ` ${details.zip}` : ""}`.trim();
  };

  const renderShippingDetails = (details) => {
    if (!details) return null;

    return (
      <div className="space-y-2 text-gray-700 leading-relaxed">
        <p className="underline text-base font-medium">
          {[details.firstName, details.lastName].filter(Boolean).join(" ")}
        </p>
        {details.company ? (
          <p className="underline text-base">{details.company}</p>
        ) : null}
        {details.address1 ? (
          <p className="underline text-base">{details.address1}</p>
        ) : null}
        {details.address2 ? (
          <p className="underline text-base">{details.address2}</p>
        ) : null}
        {details.city || details.state || details.zip ? (
          <p className="underline text-base">{formatCityLine(details)}</p>
        ) : null}
        {details.country ? (
          <p className="underline text-base">{details.country}</p>
        ) : null}
        {details.phone ? (
          <p className="underline text-base">T: {details.phone}</p>
        ) : null}
      </div>
    );
  };

  const OrderSummaryCard = () => {
    return (
      <div className="bg-swLightGray p-4 rounded">
        <h3 className="font-semibold mb-2"></h3>
      </div>
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
        <p className="text-gray-600">
          Orders saved in your browser storage are shown below.
        </p>
      </header>

      {orders?.length ? (
        <div className="space-y-5">
          {orders.map((order) => (
            <section
              key={order.orderNumber}
              className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {order.orderNumber}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-swGreen">
                    {order.status || "Pending"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 text-sm">
                <div>
                  <p className="text-gray-500">Placed</p>
                  <p className="font-medium text-gray-900">
                    {order.date || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Subtotal</p>
                  <p className="font-medium text-gray-900">
                    {order.subtotal !== undefined
                      ? formatCurrency(order.subtotal)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Items</p>
                  <p className="font-medium text-gray-900">
                    {order.items?.length || 0}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Shipping</p>
                {renderShippingDetails(order.shipping)}
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Line Items</p>
                <ul className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <li
                      key={`${item.sku || item.id || idx}-${idx}`}
                      className="flex items-center justify-between text-sm text-gray-800"
                    >
                      <span>
                        {item.name || item.title || item.sku || "Item"}{" "}
                        <span className="text-gray-500">
                          ×{item.quantity ?? item.qty ?? 1}
                        </span>
                      </span>
                      {item.price ? (
                        <span className="text-gray-700">
                          {formatCurrency(item.price)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-gray-600">No orders stored yet.</div>
      )}
    </main>
  );
}
