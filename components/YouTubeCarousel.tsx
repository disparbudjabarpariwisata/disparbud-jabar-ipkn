'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, X, Play, Youtube } from 'lucide-react';
import type { YouTubeVideo } from '@/lib/youtube';

interface YouTubeCarouselProps {
    videos: YouTubeVideo[];
}

export function YouTubeCarousel({ videos }: YouTubeCarouselProps) {
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            slidesToScroll: 1,
            breakpoints: {
                '(min-width: 768px)': { slidesToScroll: 2 },
            },
        },
        [
            Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
            }),
        ]
    );

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedVideo) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedVideo]);

    if (!videos.length) return null;

    return (
        <>
            <section className="px-6 md:px-16 py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                        <div>
                            <p className="text-sm font-semibold text-[#F8BC16] uppercase tracking-widest mb-2">
                                West Java Tourism
                            </p>
                            <h2 className="font-inter font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">
                                Video Terbaru
                            </h2>
                        </div>
                        <a
                            href="https://www.youtube.com/@WestJava_Tourism?sub_confirmation=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 transition-colors text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg active:scale-95 w-fit"
                        >
                            <Youtube className="w-5 h-5" />
                            Subscribe Channel
                        </a>
                    </div>

                    {/* Carousel */}
                    <div className="relative group">
                        <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                            <div className="flex -ml-3 md:-ml-4">
                                {videos.map((video) => (
                                    <div
                                        key={video.id}
                                        className="flex-[0_0_50%] md:flex-[0_0_25%] min-w-0 pl-3 md:pl-4"
                                    >
                                        <button
                                            onClick={() => setSelectedVideo(video)}
                                            className="relative w-full aspect-video rounded-xl overflow-hidden group/card cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                                        >
                                            <Image
                                                src={video.thumbnail}
                                                alt={video.title}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                                            />
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-75 group-hover/card:scale-100 shadow-lg">
                                                    <Play className="w-5 h-5 text-red-600 ml-0.5" fill="currentColor" />
                                                </div>
                                            </div>
                                        </button>
                                        <p className="mt-2 text-xs md:text-sm font-medium text-gray-700 line-clamp-2 leading-snug">
                                            {video.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={scrollPrev}
                            disabled={!canScrollPrev}
                            className="absolute left-2 top-[35%] -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none opacity-0 group-hover:opacity-100"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!canScrollNext}
                            className="absolute right-2 top-[35%] -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none opacity-0 group-hover:opacity-100"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-800" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal Video Player */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                            title={selectedVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        />
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute -top-3 -right-3 md:top-3 md:right-3 w-10 h-10 bg-white text-gray-800 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 z-10"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
