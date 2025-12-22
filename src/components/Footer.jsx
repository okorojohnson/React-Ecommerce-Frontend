import React from "react";
import { Link } from "react-router-dom";
import { Twitter, Instagram, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* left links */}
          <nav className="md:col-span-4 flex flex-col md:flex-row md:items-center gap-3">
            <Link to="/policy" className="text-sm hover:text-white">
              Policy
            </Link>
            <Link to="/terms" className="text-sm hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link to="/help" className="text-sm hover:text-white">
              Help
            </Link>
          </nav>

          {/* center brand */}
          <div className="md:col-span-4 flex flex-col items-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/sm_logo.svg" alt="SimpleWood" className="h-8 w-auto" />
            </Link>
            <p className="text-xs text-gray-500 mt-2">
              &copy; {year} SimpleWood. All rights reserved.
            </p>
          </div>

          {/* right social */}
          <div className="md:col-span-4 flex flex-col items-start md:items-end gap-3">
            <span className="text-sm">Follow Us on Social</span>
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 rounded hover:bg-white/5"
              >
                <Twitter className="w-5 h-5 text-gray-300" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 rounded hover:bg-white/5"
              >
                <Facebook className="w-5 h-5 text-gray-300" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 rounded hover:bg-white/5"
              >
                <Instagram className="w-5 h-5 text-gray-300" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="p-2 rounded hover:bg-white/5"
              >
                <Youtube className="w-5 h-5 text-gray-300" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-4">
          <div className="text-center text-xs text-gray-500">
            Designed &amp; built with care. Use responsibly.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
