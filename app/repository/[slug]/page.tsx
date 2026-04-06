import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FolderSearch, ExternalLink } from 'lucide-react';

type RepositoryItem = {
  title: string;
  description: string;
  folderId: string;
};

const repositoryData: Record<string, RepositoryItem> = {
  'lingkungan-pendukung': {
    title: 'Lingkungan Pendukung Pariwisata Jawa Barat',
    description: 'Informasi komprehensif mengenai profil ekosistem, sosial, budaya, serta kesiapan lingkungan dari berbagai wilayah di seluruh kabupaten dan kota Jawa Barat. Data ini dirancang untuk mengukur daya saing wilayah dan kesiapan ruang publik dalam mendukung ekosistem wisata alam, buatan, dan keberlanjutan investasi industri pariwisata secara terpadu.',
    folderId: '18-cqqPeRgD-hnKFJDH06KtFE2_r3XYql'
  },
  'kondisi-kebijakan': {
    title: 'Kondisi dan Kebijakan yang Mendukung Kepariwisataan Jawa Barat',
    description: 'Kumpulan peraturan tata kelola pemerintah daerah (governance), perizinan investasi, standar operasional (SOP), pengembangan destinasi prioritas, hingga kebijakan pelestarian pariwisata budaya yang menciptakan iklim positif serta kepastian hukum pelindung keselamatan wisatawan.',
    folderId: '17EFg1pdpEjZy3xdejApaZcBtVUQH-6Xw'
  },
  'infrastruktur-pelayanan': {
    title: 'Infrastruktur dan Pelayanan Jawa Barat',
    description: 'Pusat data fasilitas dan infrastruktur pariwisata yang mencakup ketersediaan hotel akomodasi, indeks kemantapan jalan tol dan jalan lokal, kelengkapan transportasi darat dan udara, sarana olahraga, hingga rasio fasilitas pelayanan kesehatan medis darurat di sekitar destinasi pariwisata andalan.',
    folderId: '1O0QP5CqbgqX6s4QeZlYq5yOEYAx5sX9M'
  },
  'pendorong-permintaan': {
    title: 'Pendorong Permintaan Perjalanan dan Pariwisata Jawa Barat',
    description: 'Katalog daya tarik digital meliputi wisata kuliner ikonik, program desa wisata tematik (rintisan hingga mandiri), ekonomi kreatif, agenda pertunjukan budaya internasional, dan promosi media kreatif yang berperan sebagai pemicu utama lonjakan permintaan angka kunjungan turis domestik nusantara dan mancanegara ke The Smiling West Java.',
    folderId: '1c1kTnrAQcu4fwqdsJMyYpuMM-cEVSyUp'
  },
  'keberlanjutan-lingkungan': {
    title: 'Keberlanjutan Lingkungan Dalam Kepariwisataan Jawa Barat',
    description: 'Laporan dan pangkalan data pengelolaan pariwisata berkelanjutan (Green Tourism) dan upaya pelestarian. Pemantauan dampak tata guna lahan, efisiensi penanganan sampah, ekowisata, hingga mitigasi kerentanan terhadap risiko perubahan alam di titik pariwisata provinsi Jawa Barat.',
    folderId: '10tDI1drMyCAqTKpd2QuR3YG9TbsQnvGN'
  }
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const data = repositoryData[params.slug];
  if (!data) return { title: 'Not Found' };
  
  return {
    title: `${data.title} | Repositori Kepariwisataan Jawa Barat`,
    description: data.description,
  };
}

export default async function RepositoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = repositoryData[params.slug];
  
  if (!data) {
    notFound();
  }

  const driveUrl = `https://drive.google.com/drive/folders/${data.folderId}?usp=drive_link`;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="bg-gradient-to-r from-[#2645cf] to-blue-500 p-10 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                <FolderSearch size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 relative z-10">
              {data.title}
            </h1>
          </div>

          <div className="p-6 md:p-10 text-center bg-white flex flex-col items-center">
            <p className="text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto font-medium">
              {data.description}
            </p>

            <div className="w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-4 shadow-inner">
              <iframe 
                src={`https://drive.google.com/embeddedfolderview?id=${data.folderId}#list`} 
                width="100%" 
                height="100%" 
                title={data.title}
                className="w-full h-full border-none"
              ></iframe>
            </div>

            <a 
              href={driveUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#2645cf] hover:text-[#1e37a8] font-semibold text-sm gap-2 transition-colors mt-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl"
            >
              <ExternalLink size={18} />
              <span>Buka tab baru ke Google Drive jika folder tidak termuat</span>
            </a>
          </div>
          
        </div>
      </div>

      <Footer />
    </main>
  );
}
