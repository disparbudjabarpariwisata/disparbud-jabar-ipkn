import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { TentangIPKN } from '@/components/TentangIPKN';
import { IPKNJabarTabs } from '@/components/IPKNJabarTabs';
import { KategoriSubIndeks } from '@/components/KategoriSubIndeks';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <TentangIPKN />
      <IPKNJabarTabs />
      <KategoriSubIndeks />

      {/* Target dan Program Section - Placeholder */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-inter">
            Target dan Program
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Program strategis untuk pencapaian target IPKN Jawa Barat
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Peningkatan Infrastruktur', value: '50+', desc: 'Destinasi Prioritas' },
              { title: 'Digitalisasi Pariwisata', value: '100%', desc: 'Akses Online' },
              { title: 'Pelatihan SDM', value: '1000+', desc: 'Pelaku Pariwisata' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">{item.value}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kampanye Utama Section - Placeholder */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-inter">
            Kampanye Utama
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Kampanye pariwisata berkelanjutan Jawa Barat
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { title: 'Visit West Java', desc: 'Promosi destinasi wisata unggulan' },
              { title: 'Eco-Tourism Initiative', desc: 'Pariwisata ramah lingkungan' },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-10 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
