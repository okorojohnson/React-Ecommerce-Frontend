import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Cataloguepage from "./pages/Cataloguepage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProductsProvider } from "./context/ProductsContext";
import { AuthProvider } from "./context/AuthContext";
import Accountpage from "./pages/Accountpage";
import ProductDetailspage from "./pages/ProductDetailspage";
import { CartProvider } from "./context/CartContext";
import { Toastprovider } from "./context/ToastContext";
import Cartpage from "./pages/Cartpage";
import Checkoutpage from "./pages/Checkoutpage";

const App = () => {
  return (
    <div>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <Toastprovider>
              <Router>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Homepage />} />
                  <Route path="/Catalogue" element={<Cataloguepage />} />
                  <Route path="/account" element={<Accountpage />} />
                  <Route
                    path="/products/:id"
                    element={<ProductDetailspage />}
                  />
                  <Route
                    path="/products/:sku"
                    element={<ProductDetailspage />}
                  />
                  <Route path="/cart" element={<Cartpage />} />
                  <Route path="/checkout" element={<Checkoutpage />} />
                </Routes>
                <Footer />
              </Router>
            </Toastprovider>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
