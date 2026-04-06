import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FolderSearch, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Direktori Pariwisata Jawa Barat | Smiling West Java',
  description: 'Akses daftar direktori lengkap, database informasi destinasi, dan kontak otoritas lembaga terkait kepariwisataan di Jawa Barat.',
};

export default function DirectoryPage() {
  const driveUrl = 'https://drive.google.com/drive/folders/1c1kTnrAQcu4fwqdsJMyYpuMM-cEVSyUp?usp=drive_link';

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <FolderSearch size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
              Website Directory
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-xl mx-auto relative z-10">
              Gerbang akses informasi terpadu dan direktori lengkap ekosistem kepariwisataan Jawa Barat.
            </p>
          </div>

          <div className="p-10 md:p-14 text-center bg-white">
            <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Temukan berbagai sumber daya informasi, tautan resmi pemerintah, dokumen profil pengembang pariwisata, hingga basis data wilayah yang telah dikatalogkan dengan rapi pada repositori publik kami.
            </p>

            <a 
              href={driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full md:w-auto group"
            >
              <span>Akses Direktori di Google Drive</span>
              <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            <p className="mt-6 text-sm text-gray-400">
              Anda akan dialihkan ke layanan eksternal (Google Drive).
            </p>
          </div>
          
        </div>
      </div>

      <Footer />
    </main>
  );
}
