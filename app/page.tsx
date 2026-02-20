import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';

function FeatureCard({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex flex-col gap-6 md:gap-8 flex-1 min-w-[280px] md:min-w-[336px] max-w-[388px]">
      <div className="aspect-[327/436] md:aspect-[363/483] rounded-2xl overflow-hidden relative">
        <Image
          alt={title}
          className="object-cover"
          src={image}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h5 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-xl md:text-2xl text-black tracking-tight leading-tight">
          {title}
        </h5>
        <p className="font-['Inter:Medium',sans-serif] font-medium text-lg text-[rgba(0,0,0,0.55)] tracking-tight leading-snug">
          {description}
        </p>
      </div>
    </li>
  );
}

export default function Home() {
  const features = [
    {
      image: "/e723a3a921b7364a9fd5c9987650e639e5e37b99.png",
      title: "Keindahan Alam",
      description:
        "Jelajahi keindahan alam Jawa Barat dari pegunungan hingga pantai yang memukau.",
    },
    {
      image: "/4c364980273eb285a6b98bd2ce5d58313866c189.png",
      title: "Budaya & Tradisi",
      description:
        "Kenali kekayaan budaya dan tradisi yang masih lestari di Jawa Barat.",
    },
    {
      image: "/385737d7a5d62e174796a599ef23edf3d6bc4011.png",
      title: "Kuliner Khas",
      description:
        "Nikmati berbagai kuliner khas Sunda yang menggugah selera.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />

      {/* Feature Cards Section */}
      <section className="px-6 md:px-16 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <ul className="flex flex-col md:flex-row gap-12 md:gap-8 justify-center items-stretch">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </ul>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="px-6 md:px-16 py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-3xl md:text-5xl text-black mb-6">
            Selamat Datang di Portal Pariwisata Jawa Barat
          </h2>
          <p className="font-['Inter:Medium',sans-serif] font-medium text-lg md:text-xl text-[rgba(0,0,0,0.55)] leading-relaxed">
            Temukan informasi lengkap tentang destinasi wisata, kuliner, budaya, dan berbagai
            aktivitas menarik yang dapat Anda nikmati di Provinsi Jawa Barat.
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
