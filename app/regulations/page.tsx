import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Scale, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Regulasi & Aturan Pariwisata Jawa Barat | Smiling West Java',
  description: 'Dokumen resmi perundang-undangan, SOP, dan regulasi teknis pembangunan serta operasional sektor pariwisata Provinsi Jawa Barat.',
};

export default function RegulationsPage() {
  const driveUrl = 'https://drive.google.com/drive/folders/17EFg1pdpEjZy3xdejApaZcBtVUQH-6Xw?usp=drive_link';

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-6">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <Scale size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
              Rules & Regulations
            </h1>
            <p className="text-amber-100 text-lg md:text-xl font-medium max-w-xl mx-auto relative z-10">
              Kepatuhan dan panduan resmi dalam mewujudkan lingkungan pariwisata yang tertib, lestari, dan aman.
            </p>
          </div>

          <div className="p-10 md:p-14 text-center bg-white">
            <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              Arsip perpustakaan digital ini berisi kumpulan Peraturan Daerah, Standar Operasional Prosedur (SOP), dan kebijakan teknis dari Dinas Pariwisata dan Kebudayaan yang menjadi landasan operasional pelaku kepariwisataan di Jawa Barat.
            </p>

            <a 
              href={driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 w-full md:w-auto group"
            >
              <span>Lihat Regulasi di Google Drive</span>
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
