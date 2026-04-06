import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PlayCircle, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Galeri Video Pariwisata Jawa Barat | Smiling West Java',
  description: 'Kumpulan galeri video resmi promosi, event kreatif, dan pesona destinasi pariwisata luar biasa di Provinsi Jawa Barat. Tonton sekarang untuk inspirasi liburan Anda!',
};

export default function VideosPage() {
  const driveUrl = 'https://drive.google.com/drive/folders/18-cqqPeRgD-hnKFJDH06KtFE2_r3XYql?usp=drive_link';

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Spacer for fixed header if any, though Header handles its own positioning usually. Adding safe padding. */}
      <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#2645cf] to-blue-500 p-10 md:p-16 text-center text-white relative overflow-hidden">
             {/* Decorative background circle */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <PlayCircle size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
              Video Gallery
            </h1>
            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-xl mx-auto relative z-10">
              Jelajahi keindahan dan kemeriahan pariwisata Jawa Barat melalui koleksi video dokumenter dan promosi eksklusif kami.
            </p>
          </div>

          <div className="p-10 md:p-14 text-center bg-white">
            <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Seluruh aset video dokumentasi destinasi wisata, acara kebudayaan, sport tourism, dan pariwisata kreatif Jawa Barat tersimpan rapi pada direktori cloud resmi kami. Anda dapat menonton dan mengunduhnya secara langsung melalui Google Drive.
            </p>

            <a 
              href={driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#2645cf] hover:bg-[#1e37a8] text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full md:w-auto group"
            >
              <span>Buka Folder Video di Google Drive</span>
              <ExternalLink size={20} className="group-hover:translate-x-1 sm:transition-transform" />
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
