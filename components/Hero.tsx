'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Aurora from './Aurora';
import { supabase } from '@/lib/supabaseClient';

// Fallback images if DB is empty
const FALLBACK_IMAGES = [
    "https://res.cloudinary.com/dsxpxdsc5/image/upload/v1771638831/img-hero-1_t7jpua_ape8jo.png",
    "https://res.cloudinary.com/dsxpxdsc5/image/upload/v1771638831/img-hero-2_dk8hmk_prnjdb.png",
    "https://res.cloudinary.com/dsxpxdsc5/image/upload/v1771638831/img-hero-3_rz0d8f_yxdzpb.png"
];

export function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [images, setImages] = useState<string[]>(FALLBACK_IMAGES);
    const [heroMode, setHeroMode] = useState<'slider' | 'video'>('slider');
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        const fetchHeroData = async () => {
            // Fetch hero mode from seo_settings
            const { data: seoData } = await supabase
                .from('seo_settings')
                .select('hero_mode, hero_video_url')
                .limit(1)
                .single();

            if (seoData) {
                setHeroMode(seoData.hero_mode as 'slider' | 'video');
                setVideoUrl(seoData.hero_video_url || '');
            }

            // Fetch active slides
            const { data: slides } = await supabase
                .from('hero_slides')
                .select('url')
                .eq('active', true)
                .eq('type', 'image')
                .order('sort_order', { ascending: true });

            if (slides && slides.length > 0) {
                setImages(slides.map((s) => s.url));
            }
        };

        fetchHeroData();
    }, []);

    // Auto-slide every 3 seconds
    useEffect(() => {
        if (heroMode !== 'slider' || images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [heroMode, images.length]);

    // Convert YouTube URL to embed URL
    const getEmbedUrl = (url: string) => {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?#]+)/);
        if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&controls=0&showinfo=0&rel=0`;
        return url;
    };

    return (
        <section className="relative h-screen min-h-screen w-full overflow-hidden bg-black">
            {heroMode === 'video' && videoUrl ? (
                /* Video Hero */
                <div className="absolute inset-0 z-0">
                    <iframe
                        src={getEmbedUrl(videoUrl)}
                        className="absolute inset-0 w-full h-full"
                        style={{ transform: 'scale(1.2)' }}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Hero Video"
                    />
                    <div className="absolute inset-0 bg-black/50 z-10" />
                </div>
            ) : (
                /* Image Slider */
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={images[currentIndex]}
                                alt={`Hero Image ${currentIndex + 1}`}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                priority={currentIndex === 0}
                            />
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-black/50 z-10" />
                </div>
            )}

            {/* Aurora Animation Overlay */}
            <div className="absolute inset-0 z-20 mix-blend-screen opacity-80 pointer-events-none">
                <Aurora
                    colorStops={["#1b2864", "#c29c14", "#085920"]}
                    speed={0.5}
                    blend={0.8}
                    amplitude={1.2}
                />
            </div>
        </section>
    );
}
