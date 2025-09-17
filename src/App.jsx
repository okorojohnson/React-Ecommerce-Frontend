import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import Cataloguepage from "./pages/Cataloguepage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProductsProvider } from "./context/ProductsContext";

const App = () => {
  return (
    <div>
      <ProductsProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="Catalogue" element={<Cataloguepage />} />
          </Routes>
          <Footer />
        </Router>
      </ProductsProvider>
    </div>
  );
};

export default App;
