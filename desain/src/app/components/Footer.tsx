import { Link } from "react-router";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* About Section */}
          <div>
            <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-2xl mb-4">
              Smiling West Java
            </h3>
            <p className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 leading-relaxed mb-6">
              Portal informasi pariwisata Provinsi Jawa Barat yang menyediakan informasi lengkap
              tentang destinasi, budaya, dan regulasi pariwisata.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#2645cf] transition-colors p-2 rounded-full"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#2645cf] transition-colors p-2 rounded-full"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#2645cf] transition-colors p-2 rounded-full"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#2645cf] transition-colors p-2 rounded-full"
                aria-label="Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-lg mb-4">
              Menu
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  to="/videos"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Video
                </Link>
              </li>
              <li>
                <Link
                  to="/directory"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Direktori
                </Link>
              </li>
              <li>
                <Link
                  to="/regulations"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Peraturan
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-lg mb-4">
              Sumber Daya
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Tentang Kami
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Kontak
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-lg mb-4">
              Kontak
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300">
                  Jl. Diponegoro No. 22, Bandung, Jawa Barat
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300">
                  (022) 123-4567
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-300">
                  info@smilingwestjava.id
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <p className="font-['Inter:Medium',sans-serif] font-medium text-sm text-gray-400 text-center">
            © 2026 Smiling West Java. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
