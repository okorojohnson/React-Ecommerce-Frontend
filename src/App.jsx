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

const App = () => {
  return (
    <div>
      <AuthProvider>
        <ProductsProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/Catalogue" element={<Cataloguepage />} />
              <Route path="/account" element={<Accountpage />} />
              <Route path="/products/:id" element={<ProductDetailspage />} />
            </Routes>
            <Footer />
          </Router>
        </ProductsProvider>
      </AuthProvider>
    </div>
  );
};

export default App;
