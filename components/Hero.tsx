'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Aurora from './Aurora';

const images = [
    "/img-hero-1_t7jpua.png",
    "/img-hero-2_dk8hmk.png",
    "/img-hero-3_rz0d8f.png",
    "/img-home-april.jpg"
];

export function Hero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative h-screen min-h-screen w-full overflow-hidden bg-black -mt-[214px] md:-mt-[104px] pt-[214px] md:pt-[104px]">
            {/* Image Slider */}
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

                {/* Dark Overlay to help Aurora blend and text readable */}
                <div className="absolute inset-0 bg-black/50 z-10" />
            </div>

            {/* Aurora Animation Overlay */}
            <div className="absolute inset-0 z-20 mix-blend-screen opacity-80 pointer-events-none">
                <Aurora
                    colorStops={["#1b2864", "#c29c14", "#085920"]}
                    speed={0.5}
                    blend={0.8}
                    amplitude={1.2}
                />
            </div>


            {/* Empty content as per Figma (The "Smiling West Java" title is in the Header) */}
        </section>
    );
}
