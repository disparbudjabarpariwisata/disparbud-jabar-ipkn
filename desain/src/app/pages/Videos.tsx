import { Play } from "lucide-react";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  thumbnail: string;
  category: string;
}

export default function Videos() {
  // Mock data - Replace with real YouTube video IDs
  const videos: Video[] = [
    {
      id: "1",
      title: "Keindahan Wisata Alam Jawa Barat",
      description:
        "Jelajahi destinasi wisata alam terbaik di Jawa Barat mulai dari Tangkuban Perahu hingga Kawah Putih",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1671525178137-14bd5d867cdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGluZG9uZXNpYXxlbnwxfHx8fDE3NzE1ODQ4MjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Wisata Alam",
    },
    {
      id: "2",
      title: "Kuliner Khas Sunda yang Wajib Dicoba",
      description:
        "Mengenal berbagai kuliner khas Sunda dari nasi timbel, pepes ikan, hingga lotek",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1680345576151-bbc497ba969e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRvbmVzaWFuJTIwdHJhZGl0aW9uYWwlMjBmb29kfGVufDF8fHx8MTc3MTU4Nzc3MHww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Kuliner",
    },
    {
      id: "3",
      title: "Festival Budaya Jawa Barat",
      description:
        "Dokumentasi berbagai festival dan perayaan budaya yang ada di Jawa Barat",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1693649112690-b986c896185c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdWx0dXJhbCUyMGZlc3RpdmFsJTIwaW5kb25lc2lhfGVufDF8fHx8MTc3MTU4Nzc3MHww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Budaya",
    },
    {
      id: "4",
      title: "Wisata Sejarah Bandung",
      description:
        "Menelusuri jejak sejarah Kota Bandung melalui bangunan-bangunan bersejarah",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1734374170781-ee13a3a13fb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b3JpYyUyMGJ1aWxkaW5nJTIwYmFuZHVuZ3xlbnwxfHx8fDE3NzE1ODc3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Sejarah",
    },
    {
      id: "5",
      title: "Pantai-Pantai Indah di Jawa Barat",
      description:
        "Kunjungi pantai-pantai tersembunyi yang memukau di pesisir selatan Jawa Barat",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1658249292069-b2d88d3782e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwaW5kb25lc2lhfGVufDF8fHx8MTc3MTU4Nzc3MXww&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Wisata Alam",
    },
    {
      id: "6",
      title: "Kerajinan Tangan Tradisional",
      description:
        "Mengenal berbagai kerajinan tangan khas Jawa Barat dan proses pembuatannya",
      youtubeId: "dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1646282998141-8e038879b7c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmFkaXRpb25hbCUyMGNyYWZ0JTIwaGFuZG1hZGV8ZW58MXx8fHwxNzcxNTg3NzcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      category: "Budaya",
    },
  ];

  const categories = ["Semua", "Wisata Alam", "Kuliner", "Budaya", "Sejarah"];
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filteredVideos =
    selectedCategory === "Semua"
      ? videos
      : videos.filter((video) => video.category === selectedCategory);

  return (
    <main className="bg-white min-h-screen py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-4xl md:text-5xl text-black mb-4">
            Video Pariwisata Jawa Barat
          </h1>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)]">
            Koleksi video informatif dan menarik tentang pariwisata Jawa Barat
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
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

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="group cursor-pointer"
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeId}`, "_blank")}
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                  <div className="bg-white rounded-full p-4 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-[#2645cf]" fill="#2645cf" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {video.category}
                </div>
              </div>
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-lg text-black mb-2 group-hover:text-[#2645cf] transition-colors">
                {video.title}
              </h3>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-sm text-[rgba(0,0,0,0.55)] line-clamp-2">
                {video.description}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)]">
              Tidak ada video untuk kategori ini
            </p>
          </div>
        )}
      </div>
    </main>
  );
}