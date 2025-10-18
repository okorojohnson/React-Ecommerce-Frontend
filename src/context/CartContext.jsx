import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

const STORAGE_KEY = "sw_cart_v1";

// Cart Provider Component
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Failed to load cart items:", error);
      return [];
    }
  });

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save cart items:", error);
    }
  }, [items]);

  /**
   * Add a product to cart or increase its quantity
   * @param {Object} product - Product object with sku, name, price, images
   * @param {number} qty - Quantity to add (default: 1)
   */
  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.sku === product.sku);

      // If product already exists, increment quantity
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: updated[existingIndex].qty + qty,
        };
        return updated;
      }

      // Otherwise, add new item
      const newItem = {
        sku: product.sku,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || null,
        qty: qty,
      };

      return [...prev, newItem];
    });
  };

  /**
   * Remove a product from cart by SKU
   * @param {string} sku - Product SKU
   */
  const removeItem = (sku) => {
    setItems((prev) => prev.filter((item) => item.sku !== sku));
  };

  /**
   * Update quantity of a product in cart
   * @param {string} sku - Product SKU
   * @param {number} qty - New quantity (minimum: 1)
   */
  const updateQty = (sku, qty) => {
    setItems((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  /**
   * Clear all items from cart
   */
  const clearCart = () => {
    setItems([]);
  };

  /**
   * Calculate subtotal of all items in cart
   * @returns {number} Total price of all items
   */
  const getSubTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  /**
   * Get total quantity of items in cart
   */
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  /**
   * Get total number of unique items in cart
   */
  const uniqueItemCount = items.length;

  // Context value
  const value = {
    items,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    getSubTotal,
    itemCount,
    uniqueItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
