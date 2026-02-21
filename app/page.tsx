import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import { YouTubeCarousel } from '@/components/YouTubeCarousel';
import { getLatestYouTubeVideos } from '@/lib/youtube';
import Link from 'next/link';

export default async function Home() {
  const videos = await getLatestYouTubeVideos(10);

  return (
    <main className="min-h-screen bg-white">
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
            Jelajahi Lebih Lanjut
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2645cf] transition-colors">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-4">
                Video Informasi
              </h4>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-[rgba(0,0,0,0.55)] mb-6">
                Tonton video-video menarik tentang pariwisata Jawa Barat
              </p>
              <Link
                href="/videos"
                prefetch={false}
                className="inline-block bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm"
              >
                Lihat Video
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2645cf] transition-colors">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-4">
                Direktori Website
              </h4>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-[rgba(0,0,0,0.55)] mb-6">
                Akses berbagai sumber informasi pariwisata Jawa Barat
              </p>
              <Link
                href="/directory"
                prefetch={false}
                className="inline-block bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm"
              >
                Lihat Direktori
              </Link>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#2645cf] transition-colors">
              <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl text-black mb-4">
                Peraturan & Regulasi
              </h4>
              <p className="font-['Inter:Medium',sans-serif] font-medium text-base text-[rgba(0,0,0,0.55)] mb-6">
                Informasi peraturan terkait pariwisata di Jawa Barat
              </p>
              <Link
                href="/regulations"
                prefetch={false}
                className="inline-block bg-[#2645cf] hover:bg-[#1e37a8] transition-colors text-white px-6 py-3 rounded-lg text-sm"
              >
                Lihat Peraturan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
