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

export default async function Home() {
  const videos = await getLatestYouTubeVideos(10);

  // Fetch map data server-side for optimal SEO
  const { data: mapData } = await supabaseAdmin
    .from('data_map')
    .select('*')
    .eq('active', true)
    .order('city_name', { ascending: true });

  const locations: MapDataItem[] = mapData || [];

  // Build JSON-LD structured data for all tourism locations
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Destinasi Wisata Jawa Barat',
    description: 'Daftar 27 kota dan kabupaten destinasi wisata di Provinsi Jawa Barat, Indonesia.',
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

      {/* Welcome Section */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-3xl md:text-5xl text-black mb-6">
            Welcome to Smiling West Java Repository Website
          </h2>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-lg md:text-xl text-[rgba(0,0,0,0.55)] leading-relaxed">
            Discover everything you need to know about tourism in West Java Province.
          </p>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="px-6 md:px-16 py-20 mb-10">
        <div className="max-w-7xl mx-auto">
          <h3 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-2xl md:text-3xl text-black mb-12 text-center">
            Discover More
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2645cf] transition-colors">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-4">
                Video Gallery
              </h4>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-[rgba(0,0,0,0.55)] mb-6">
                Watch exciting videos about West Java tourism
              </p>
              <Link
                href="/videos"
                prefetch={false}
                className="inline-block bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm"
              >
                View Videos
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2645cf] transition-colors">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-4">
                Website Directory
              </h4>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-[rgba(0,0,0,0.55)] mb-6">
                Access various tourism information resources in West Java
              </p>
              <Link
                href="/directory"
                prefetch={false}
                className="inline-block bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm"
              >
                View Directory
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2645cf] transition-colors">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-4">
                Rules & Regulations
              </h4>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-[rgba(0,0,0,0.55)] mb-6">
                Tourism-related regulations in West Java
              </p>
              <Link
                href="/regulations"
                prefetch={false}
                className="inline-block bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm"
              >
                View Regulations
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
          <h2>Informasi Wisata 27 Kota dan Kabupaten di Jawa Barat</h2>
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
            </article>
          ))}
        </section>
      )}

      <Footer />
    </main>
  );
}

