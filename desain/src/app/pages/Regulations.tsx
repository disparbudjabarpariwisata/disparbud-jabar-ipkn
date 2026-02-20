import { useState } from "react";
import { FileText, Download, Calendar, Search } from "lucide-react";

interface Regulation {
  id: string;
  title: string;
  number: string;
  year: string;
  category: string;
  description: string;
  date: string;
  fileUrl: string;
}

export default function Regulations() {
  const regulations: Regulation[] = [
    {
      id: "1",
      title: "Peraturan Daerah tentang Rencana Induk Pembangunan Kepariwisataan",
      number: "Perda No. 15",
      year: "2023",
      category: "Peraturan Daerah",
      description:
        "Peraturan mengenai perencanaan dan pengembangan pariwisata di Jawa Barat",
      date: "15 Januari 2023",
      fileUrl: "#",
    },
    {
      id: "2",
      title: "Peraturan Gubernur tentang Standar Pelayanan Minimal Bidang Pariwisata",
      number: "Pergub No. 28",
      year: "2023",
      category: "Peraturan Gubernur",
      description:
        "Standar minimal pelayanan untuk destinasi wisata dan pengelola pariwisata",
      date: "20 Maret 2023",
      fileUrl: "#",
    },
    {
      id: "3",
      title: "Keputusan Bupati tentang Penetapan Kawasan Strategis Pariwisata",
      number: "Kepbup No. 45",
      year: "2023",
      category: "Keputusan Bupati",
      description:
        "Penetapan kawasan-kawasan yang menjadi prioritas pengembangan pariwisata",
      date: "10 April 2023",
      fileUrl: "#",
    },
    {
      id: "4",
      title: "Peraturan Daerah tentang Retribusi Tempat Rekreasi dan Olahraga",
      number: "Perda No. 8",
      year: "2022",
      category: "Peraturan Daerah",
      description:
        "Ketentuan retribusi untuk tempat rekreasi dan objek wisata",
      date: "5 Juni 2022",
      fileUrl: "#",
    },
    {
      id: "5",
      title: "Peraturan Gubernur tentang Pedoman Penyelenggaraan Homestay",
      number: "Pergub No. 52",
      year: "2022",
      category: "Peraturan Gubernur",
      description:
        "Pedoman dan standar penyelenggaraan homestay di Jawa Barat",
      date: "18 Agustus 2022",
      fileUrl: "#",
    },
    {
      id: "6",
      title: "Surat Edaran tentang Protokol Kesehatan di Objek Wisata",
      number: "SE No. 12",
      year: "2023",
      category: "Surat Edaran",
      description:
        "Panduan protokol kesehatan untuk pengelola dan pengunjung objek wisata",
      date: "25 Februari 2023",
      fileUrl: "#",
    },
    {
      id: "7",
      title: "Peraturan Daerah tentang Pelestarian Budaya Lokal",
      number: "Perda No. 22",
      year: "2022",
      category: "Peraturan Daerah",
      description:
        "Perlindungan dan pelestarian budaya lokal dalam pengembangan pariwisata",
      date: "30 November 2022",
      fileUrl: "#",
    },
    {
      id: "8",
      title: "Keputusan Gubernur tentang Penetapan Kalender Event Pariwisata",
      number: "Kepgub No. 33",
      year: "2023",
      category: "Keputusan Gubernur",
      description:
        "Kalender resmi event dan festival pariwisata Jawa Barat tahun 2023",
      date: "15 Desember 2022",
      fileUrl: "#",
    },
  ];

  const categories = [
    "Semua",
    "Peraturan Daerah",
    "Peraturan Gubernur",
    "Keputusan Bupati",
    "Keputusan Gubernur",
    "Surat Edaran",
  ];

  const years = ["Semua", "2023", "2022", "2021", "2020"];

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedYear, setSelectedYear] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegulations = regulations.filter((reg) => {
    const matchesCategory =
      selectedCategory === "Semua" || reg.category === selectedCategory;
    const matchesYear = selectedYear === "Semua" || reg.year === selectedYear;
    const matchesSearch =
      searchQuery === "" ||
      reg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesYear && matchesSearch;
  });

  return (
    <main className="bg-white min-h-screen py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-4xl md:text-5xl text-black mb-4">
            Peraturan & Regulasi
          </h1>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)]">
            Repositori peraturan dan informasi hukum terkait pariwisata Jawa Barat
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari peraturan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#2645cf] focus:outline-none font-['Inter:Medium',sans-serif] font-medium text-base"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-12">
          {/* Category Filter */}
          <div className="mb-4">
            <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-sm text-black mb-3">
              Kategori
            </h3>
            <div className="flex flex-wrap gap-3">
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
          </div>

          {/* Year Filter */}
          <div>
            <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-sm text-black mb-3">
              Tahun
            </h3>
            <div className="flex flex-wrap gap-3">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedYear === year
                      ? "bg-[#2645cf] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Regulations List */}
        <div className="space-y-4">
          {filteredRegulations.map((regulation) => (
            <div
              key={regulation.id}
              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#2645cf] hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-[#2645cf]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-[#2645cf] bg-blue-50 px-3 py-1 rounded-full">
                          {regulation.category}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {regulation.number} • {regulation.year}
                        </span>
                      </div>
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-2">
                        {regulation.title}
                      </h3>
                      <p className="font-['Inter:Medium',sans-serif] font-medium text-sm text-[rgba(0,0,0,0.55)] mb-3">
                        {regulation.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{regulation.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => window.open(regulation.fileUrl, "_blank")}
                  className="flex items-center gap-2 bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRegulations.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)]">
              Tidak ada peraturan yang ditemukan
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
          <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-lg text-black mb-2">
            Informasi
          </h3>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-sm text-[rgba(0,0,0,0.55)]">
            Data peraturan dan regulasi ini merupakan informasi umum. Untuk informasi
            lengkap dan versi resmi, silakan kunjungi website Dinas Pariwisata dan
            Kebudayaan Provinsi Jawa Barat atau JDIH (Jaringan Dokumentasi dan
            Informasi Hukum) Provinsi Jawa Barat.
          </p>
        </div>
      </div>
    </main>
  );
}
