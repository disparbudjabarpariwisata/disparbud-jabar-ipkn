import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { YouTubeCarousel } from '@/components/YouTubeCarousel';
import { getLatestYouTubeVideos } from '@/lib/youtube';
import WestJavaMapSection from '@/components/WestJavaMapSection';
import type { MapDataItem } from '@/components/WestJavaMapSection';
import DataStorySection from '@/components/DataStorySection';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { westJavaLocations } from '@/lib/westJavaLocations';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Data Pariwisata Jawa Barat | Smiling West Java",
  description: "Eksplorasi cerita data pariwisata Jawa Barat terlengkap. Temukan insight tentang infrastruktur, ekonomi kreatif, kesehatan, dan potensi desa wisata di 27 wilayah kabupaten dan kota.",
  keywords: "data pariwisata jawa barat, cerita data pariwisata jawa barat, wajah pariwisata jawa barat, statistik wisata jabar, destinasi pariwisata jabar",
  alternates: {
    canonical: "https://smilingwestjava.official.id/"
  }
};

export default async function Home() {
  const videos = await getLatestYouTubeVideos(10);

  // Fetch map data, health metrics, and desa wisata server-side for optimal SEO
  const [mapRes, jknRes, bedRes, drRes, desaRes] = await Promise.all([
    supabaseAdmin.from('data_map').select('*').eq('active', true).order('city_name', { ascending: true }),
    supabaseAdmin.from('kesehatan_rasio_jkn').select('*'),
    supabaseAdmin.from('kesehatan_rasio_bedrs').select('*'),
    supabaseAdmin.from('kesehatan_rasio_drumum').select('*'),
    supabaseAdmin.from('desawisata_jabar').select('*').order('no', { ascending: true })
  ]);

  const mapData = mapRes.data || [];

  const locations: MapDataItem[] = mapData.map((city) => {
    const nameSearch = city.city_name.toUpperCase();
    
    const jkn = jknRes.data?.find(j => j.kabupaten_kota.toUpperCase() === nameSearch || j.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, ''));
    const bed = bedRes.data?.find(b => b.kabupaten_kota.toUpperCase() === nameSearch || b.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, ''));
    const dr = drRes.data?.find(d => d.kabupaten_kota.toUpperCase() === nameSearch || d.kabupaten_kota.toUpperCase() === nameSearch.replace(/^(KABUPATEN |KOTA )/, ''));

    const regional_health = {
        '2024': {
            jkn_percent: jkn?.persen_uhc_2024 || 0,
            bed_ratio: bed?.rasio_bed_rs_2024 || 0,
            doctor_ratio: dr?.rasio_dokter_umum_2024 || 0,
            spesialis_ratio: dr?.rasio_dokter_spesialis_2024 || 0
        },
        '2025': {
            jkn_percent: jkn?.persen_uhc_2025 || 0,
            bed_ratio: bed?.rasio_bed_rs_2025 || 0,
            doctor_ratio: dr?.rasio_dokter_umum_2025 || 0,
            spesialis_ratio: dr?.rasio_dokter_spesialis_2025 || 0
        }
    };

    // Match desa wisata by kabupaten_kota
    const desaVillages = (desaRes.data || []).filter(d => {
      const dName = d.kabupaten_kota?.toUpperCase() || '';
      return dName === nameSearch || dName === nameSearch.replace(/^(KABUPATEN |KOTA )/, '');
    }).map(d => ({
      nama: d.nama_desa_kampung_wisata,
      desa_kelurahan: d.desa_kelurahan,
      kecamatan: d.kecamatan,
      status: d.status_desa_wisata,
      potensi_alam: d.potensi_alam,
      potensi_budaya: d.potensi_budaya,
      potensi_buatan: d.potensi_buatan
    }));

    const { medical_data, desa_wisata_data: _oldDesa, ...rest } = city;
    return { ...rest, regional_health, desa_wisata_data: desaVillages };
  });

  // Build JSON-LD structured data for all tourism locations
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Destinasi Wisata Jawa Barat',
    description: 'Cerita Data Pariwisata Jawa Barat: Daftar lengkap 27 kota dan kabupaten destinasi wisata, serta statistik kesehatan, desa wisata, olahraga, dan kata kreatif di Provinsi Jawa Barat, Indonesia.',
    numberOfItems: locations.length,
    itemListElement: locations.map((loc, index) => {
      // Match with static coordinates
      const staticLoc = westJavaLocations.find(
        (s) => s.name === loc.city_name
      );
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'TouristAttraction',
          name: loc.city_name,
          description: loc.description || `Informasi wisata ${loc.city_name}, Jawa Barat.`,
          ...(loc.image_url && { image: loc.image_url }),
          ...(loc.website_url && { url: loc.website_url }),
          address: {
            '@type': 'PostalAddress',
            addressLocality: loc.city_name,
            addressRegion: 'Jawa Barat',
            addressCountry: 'ID',
          },
          ...(staticLoc && {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: staticLoc.coordinates[0],
              longitude: staticLoc.coordinates[1],
            },
          }),
          ...(loc.tourism_highlights && {
            amenityFeature: {
              '@type': 'LocationFeatureSpecification',
              name: 'Highlight Pariwisata',
              value: loc.tourism_highlights,
            },
          }),
        },
      };
    }),
  };

  return (
    <main className="min-h-screen bg-white">
      {/* JSON-LD Structured Data for Tourism Locations */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <Hero />

      {/* YouTube Video Carousel Section */}
      <YouTubeCarousel videos={videos} />

      {/* Welcome Section / SEO H1 */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-3xl md:text-5xl text-black mb-6">
            Pusat Data Pariwisata Jawa Barat
          </h1>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-lg md:text-xl text-[rgba(0,0,0,0.55)] leading-relaxed mb-4">
            Welcome to Smiling West Java Repository. Discover everything you need to know about tourism potentials, infrastructure, and analytics in West Java Province.
          </p>
        </div>
      </section>

      {/* Quick Links Section -> Repositori Data */}
      <section className="px-6 md:px-16 py-20 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-['Inter:Semi_Bold',sans-serif] font-bold text-3xl md:text-5xl text-gray-900 mb-4">
              Data Pariwisata Jawa Barat
            </h1>
            <h2 className="font-['Inter:Medium',sans-serif] font-medium text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Repositori data pendukung pengembangan pariwisata Jawa Barat
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#2645cf] hover:shadow-xl transition-all duration-300 group flex flex-col">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-bold text-xl text-gray-900 mb-4 group-hover:text-[#2645cf] transition-colors">
                Lingkungan Pendukung Pariwisata Jawa Barat
              </h3>
              <p className="font-['Inter:Medium',sans-serif] text-sm text-[rgba(0,0,0,0.65)] leading-relaxed mb-8 flex-grow">
                Informasi komprehensif mengenai profil ekosistem, sosial, budaya, serta kesiapan lingkungan dari berbagai wilayah di seluruh kabupaten dan kota Jawa Barat. Data ini dirancang untuk mengukur daya saing wilayah dan kesiapan ruang publik dalam mendukung ekosistem wisata alam, buatan, dan keberlanjutan investasi industri pariwisata secara terpadu.
              </p>
              <Link
                href="/directory"
                prefetch={false}
                className="inline-flex items-center justify-center bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-xl text-sm font-semibold"
              >
                Lihat Direktori Lingkungan
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#2645cf] hover:shadow-xl transition-all duration-300 group flex flex-col">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-bold text-xl text-gray-900 mb-4 group-hover:text-[#2645cf] transition-colors">
                Kondisi dan Kebijakan yang Mendukung Kepariwisataan Jawa Barat
              </h3>
              <p className="font-['Inter:Medium',sans-serif] text-sm text-[rgba(0,0,0,0.65)] leading-relaxed mb-8 flex-grow">
                Kumpulan peraturan tata kelola pemerintah daerah (governance), perizinan investasi, standar operasional (SOP), pengembangan destinasi prioritas, hingga kebijakan pelestarian pariwisata budaya yang menciptakan iklim positif serta kepastian hukum pelindung keselamatan wisatawan.
              </p>
              <Link
                href="/regulations"
                prefetch={false}
                className="inline-flex items-center justify-center bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-xl text-sm font-semibold"
              >
                Eksplorasi Kebijakan Wisata
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#2645cf] hover:shadow-xl transition-all duration-300 group flex flex-col">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-bold text-xl text-gray-900 mb-4 group-hover:text-[#2645cf] transition-colors">
                Infrastruktur dan Pelayanan Jawa Barat
              </h3>
              <p className="font-['Inter:Medium',sans-serif] text-sm text-[rgba(0,0,0,0.65)] leading-relaxed mb-8 flex-grow">
                Pusat data fasilitas dan infrastruktur pariwisata yang mencakup ketersediaan hotel akomodasi, indeks kemantapan jalan tol dan jalan lokal, kelengkapan transportasi darat dan udara, sarana olahraga, hingga rasio fasilitas pelayanan kesehatan medis darurat di sekitar destinasi pariwisata andalan.
              </p>
              <Link
                href="/directory"
                prefetch={false}
                className="inline-flex items-center justify-center bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-xl text-sm font-semibold"
              >
                Cek Data Infrastruktur Pelayanan
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#2645cf] hover:shadow-xl transition-all duration-300 group flex flex-col">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-bold text-xl text-gray-900 mb-4 group-hover:text-[#2645cf] transition-colors">
                Pendorong Permintaan Perjalanan dan Pariwisata Jawa Barat
              </h3>
              <p className="font-['Inter:Medium',sans-serif] text-sm text-[rgba(0,0,0,0.65)] leading-relaxed mb-8 flex-grow">
                Katalog daya tarik digital meliputi wisata kuliner ikonik, program desa wisata tematik (rintisan hingga mandiri), ekonomi kreatif, agenda pertunjukan budaya internasional, dan promosi media kreatif yang berperan sebagai pemicu utama lonjakan permintaan angka kunjungan turis domestik nusantara dan mancanegara ke The Smiling West Java.
              </p>
              <Link
                href="/videos"
                prefetch={false}
                className="inline-flex items-center justify-center bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-xl text-sm font-semibold"
              >
                Lihat Pendorong Permintaan Wisata
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 hover:border-[#2645cf] hover:shadow-xl transition-all duration-300 group flex flex-col">
              <h3 className="font-['Inter:Semi_Bold',sans-serif] font-bold text-xl text-gray-900 mb-4 group-hover:text-[#2645cf] transition-colors">
                Keberlanjutan Lingkungan Dalam Kepariwisataan Jawa Barat
              </h3>
              <p className="font-['Inter:Medium',sans-serif] text-sm text-[rgba(0,0,0,0.65)] leading-relaxed mb-8 flex-grow">
                Laporan dan pangkalan data pengelolaan pariwisata berkelanjutan (Green Tourism) dan upaya pelestarian. Pemantauan dampak tata guna lahan, efisiensi penanganan sampah, ekowisata, hingga mitigasi kerentanan terhadap risiko perubahan alam di titik pariwisata provinsi Jawa Barat.
              </p>
              <Link
                href="/directory"
                prefetch={false}
                className="inline-flex items-center justify-center bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-xl text-sm font-semibold"
              >
                Pelajari Data Keberlanjutan Wisata
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive West Java Map Section (Server-Side data for SEO) */}
      <WestJavaMapSection initialData={locations} />

      {/* Analytics Data Story Section */}
      <DataStorySection />

      {/* SEO: Crawlable semantic HTML for all tourism locations */}
      {locations.length > 0 && (
        <section
          className="sr-only"
          aria-label="Data Kepariwisataan Jawa Barat"
        >
          <h2>Informasi Wisata 27 Kota dan Kabupaten di Jawa Barat dan Daftar Desa Wisata</h2>
          {locations.map((loc) => (
            <article key={loc.city_name}>
              <h3>{loc.city_name} — {loc.city_type}</h3>
              {loc.description && <p>{loc.description}</p>}
              {loc.tourism_highlights && (
                <p>Highlight Pariwisata: {loc.tourism_highlights}</p>
              )}
              {loc.tourist_attractions && (
                <p>Destinasi Wisata: {loc.tourist_attractions}</p>
              )}
              {loc.culinary && <p>Kuliner Khas: {loc.culinary}</p>}
              {loc.accommodation && <p>Akomodasi: {loc.accommodation}</p>}
              {loc.transportation && <p>Transportasi: {loc.transportation}</p>}
              {loc.website_url && (
                <p>
                  Website Resmi:{' '}
                  <a href={loc.website_url} rel="noopener">
                    {loc.website_url}
                  </a>
                </p>
              )}
              
              {/* Data Desa Wisata agar terindeks Google */}
              {loc.desa_wisata_data && loc.desa_wisata_data.length > 0 && (
                <div>
                  <h4>Daftar Desa Wisata {loc.city_name}</h4>
                  <ul>
                    {loc.desa_wisata_data.map((desa: any, idx: number) => (
                      <li key={idx}>
                        <strong>{desa.nama}</strong> - Desa/Kelurahan: {desa.desa_kelurahan}, Kecamatan: {desa.kecamatan} (Status: {desa.status})
                        {desa.potensi_alam && ` | Potensi Alam: ${desa.potensi_alam}`}
                        {desa.potensi_budaya && ` | Potensi Budaya: ${desa.potensi_budaya}`}
                        {desa.potensi_buatan && ` | Potensi Buatan: ${desa.potensi_buatan}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      <Footer />
    </main>
  );
}

