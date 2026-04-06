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
      
      <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-10 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <FolderSearch size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
              Website Directory
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto relative z-10">
              Gerbang akses informasi terpadu dan direktori lengkap ekosistem kepariwisataan Jawa Barat.
            </p>
          </div>

          <div className="p-6 md:p-10 text-center bg-white flex flex-col items-center">
            <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl mx-auto">
              Temukan berbagai sumber daya informasi, tautan resmi pemerintah, dokumen profil pengembang pariwisata, hingga basis data wilayah pada repositori publik kami.
            </p>

            <div className="w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-4 shadow-inner">
              <iframe 
                src="https://drive.google.com/embeddedfolderview?id=1c1kTnrAQcu4fwqdsJMyYpuMM-cEVSyUp#grid" 
                width="100%" 
                height="100%" 
                title="Google Drive Directory"
                className="w-full h-full border-none"
              ></iframe>
            </div>

            <a 
              href={driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-emerald-600 hover:text-emerald-800 font-medium text-sm gap-2 transition-colors"
            >
              <ExternalLink size={16} />
              <span>Buka tab baru jika folder tidak termuat</span>
            </a>
          </div>
          
        </div>
      </div>

      <Footer />
    </main>
  );
}
