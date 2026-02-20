import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-white min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-9xl text-[#2645cf] mb-4">
          404
        </h1>
        <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-3xl md:text-4xl text-black mb-6">
          Halaman Tidak Ditemukan
        </h2>
        <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)] mb-12">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman tersebut telah
          dipindahkan atau tidak pernah ada.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-8 py-3 rounded-lg font-medium"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 transition-colors text-black px-8 py-3 rounded-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Halaman Sebelumnya
          </button>
        </div>
      </div>
    </main>
  );
}
