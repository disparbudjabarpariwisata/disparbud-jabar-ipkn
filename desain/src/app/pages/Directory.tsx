import { ExternalLink, MapPin, Globe, Info } from "lucide-react";
import { useState } from "react";

interface DirectoryItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  icon: string;
}

export default function Directory() {
  const directoryItems: DirectoryItem[] = [
    {
      id: "1",
      name: "Disparbud Jawa Barat",
      description: "Dinas Pariwisata dan Kebudayaan Provinsi Jawa Barat - Informasi resmi destinasi wisata",
      url: "https://disparbud.jabarprov.go.id",
      category: "Pemerintah",
      icon: "🏛️",
    },
    {
      id: "2",
      name: "Visit West Java",
      description: "Portal resmi pariwisata Jawa Barat dengan informasi destinasi, event, dan akomodasi",
      url: "https://visitwestjava.com",
      category: "Portal Wisata",
      icon: "🗺️",
    },
    {
      id: "3",
      name: "Wonderful Indonesia - Jawa Barat",
      description: "Informasi wisata Jawa Barat dari Kementerian Pariwisata Indonesia",
      url: "https://www.indonesia.travel",
      category: "Portal Wisata",
      icon: "🌏",
    },
    {
      id: "4",
      name: "Bandung Tourism",
      description: "Panduan wisata lengkap untuk Kota Bandung dan sekitarnya",
      url: "https://bandungtourism.com",
      category: "Kota",
      icon: "🏙️",
    },
    {
      id: "5",
      name: "Taman Nasional Gunung Gede Pangrango",
      description: "Website resmi Taman Nasional Gunung Gede Pangrango",
      url: "https://tnggp.id",
      category: "Taman Nasional",
      icon: "⛰️",
    },
    {
      id: "6",
      name: "Museum Konferensi Asia Afrika",
      description: "Informasi Museum Konferensi Asia Afrika Bandung",
      url: "https://mkaa.kemlu.go.id",
      category: "Museum",
      icon: "🏛️",
    },
    {
      id: "7",
      name: "Pantai Pangandaran",
      description: "Portal informasi wisata Pantai Pangandaran dan sekitarnya",
      url: "https://pangandaran.go.id",
      category: "Pantai",
      icon: "🏖️",
    },
    {
      id: "8",
      name: "Kawah Putih Ciwidey",
      description: "Informasi dan reservasi tiket Kawah Putih",
      url: "https://kawahputihciwidey.com",
      category: "Wisata Alam",
      icon: "🌋",
    },
    {
      id: "9",
      name: "Trans Studio Bandung",
      description: "Theme park indoor terbesar di Indonesia",
      url: "https://transstudiobandung.com",
      category: "Hiburan",
      icon: "🎢",
    },
  ];

  const categories = [
    "Semua",
    "Pemerintah",
    "Portal Wisata",
    "Kota",
    "Taman Nasional",
    "Museum",
    "Pantai",
    "Wisata Alam",
    "Hiburan",
  ];

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = directoryItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-white min-h-screen py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-4xl md:text-5xl text-black mb-4">
            Direktori Website Pariwisata
          </h1>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)]">
            Kumpulan link website terpercaya tentang pariwisata Jawa Barat
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari website..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#2645cf] focus:outline-none font-['Inter:Medium',sans-serif] font-medium text-base"
            />
            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-12 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-[#2645cf] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#2645cf] hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{item.icon}</div>
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-[#2645cf] transition-colors" />
              </div>
              <div className="mb-2">
                <span className="text-xs font-medium text-[#2645cf] bg-blue-50 px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-2 group-hover:text-[#2645cf] transition-colors">
                {item.name}
              </h3>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-sm text-[rgba(0,0,0,0.55)] line-clamp-2">
                {item.description}
              </p>
              <div className="mt-4 text-xs text-gray-400 truncate">
                {item.url.replace("https://", "")}
              </div>
            </a>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20">
            <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)]">
              Tidak ada website yang ditemukan
            </p>
          </div>
        )}
      </div>
    </main>
  );
}