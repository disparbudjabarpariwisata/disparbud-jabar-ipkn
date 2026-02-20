'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'why west java ?', path: '/' },
        { label: 'where to visit ?', path: '/directory' },
        { label: 'what to do ?', path: '/videos' },
    ];

    return (
        <>
            {/* Desktop Header */}
            <header className="fixed top-0 left-0 right-0 z-50 hidden md:block pointer-events-none">
                <div className="flex justify-center px-[70px] pt-0">
                    <div
                        className={`bg-white rounded-bl-[50px] rounded-br-[50px] transition-all duration-300 pointer-events-auto shadow-md relative ${isScrolled ? 'h-[104px] w-full' : isHomePage ? 'h-[214px] w-full' : 'h-[104px] w-full'
                            }`}
                        style={{ maxWidth: '1131px' }}
                    >
                        {/* Top Section (Logos, Nav, Auth Buttons) */}
                        <div className="w-full flex justify-between items-start px-8 pt-6">
                            {/* Logos */}
                            <div className="flex items-center gap-4">
                                <Image
                                    src="/smilingwestjava.png"
                                    alt="Smiling West Java"
                                    width={60}
                                    height={60}
                                    className="h-10 w-auto"
                                    style={{ width: 'auto', height: '2.5rem' }}
                                    priority
                                />
                                <Image
                                    src="/logopemprovjabar.png"
                                    alt="Pemprov Jawa Barat"
                                    width={60}
                                    height={60}
                                    className="h-10 w-auto"
                                    style={{ width: 'auto', height: '2.5rem' }}
                                    priority
                                />
                            </div>

                            {/* Navigation Menu (Absolute centered) */}
                            <nav className="absolute left-0 right-0 flex justify-center gap-[60px] lg:gap-[100px] top-[40px] pointer-events-auto z-10">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className="font-inter font-normal text-[12px] text-black hover:text-[#2645cf] transition-colors uppercase tracking-wider"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Auth Buttons */}
                            <div className="flex items-center gap-3 z-10">
                                <Link
                                    href="/login"
                                    className="px-5 py-2 border-2 border-[#F8BC16] text-[#F8BC16] rounded-xl font-semibold hover:bg-yellow-50 transition-all text-sm"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 bg-[#F8BC16] text-white rounded-xl font-semibold hover:bg-[#F2B10C] transition-all text-sm"
                                >
                                    Registrasi
                                </Link>
                            </div>
                        </div>

                        {/* Hero Content inside Header - Only show when not scrolled and on home page */}
                        {!isScrolled && isHomePage && (
                            <div className="absolute bottom-[40px] left-[70px] right-[70px] flex items-center justify-between px-0 animate-fade-in">
                                <div className="font-['Inter:Regular',sans-serif] font-normal text-[32px] text-black">
                                    <p className="mb-0 leading-[1.1]">Smiling</p>
                                    <p className="leading-[1.1]">West Java</p>
                                </div>
                                <Link
                                    href="/videos"
                                    className="bg-[#2645cf] hover:bg-[#1e37a8] transition-colors h-[37px] rounded-[15px] w-[249px] flex items-center justify-center shadow-md active:scale-95"
                                >
                                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-white">
                                        Discover More
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden pointer-events-none">
                <div className="px-[17px] pt-0">
                    <div
                        className={`bg-white rounded-bl-[50px] rounded-br-[50px] transition-all duration-300 pointer-events-auto shadow-md relative ${isScrolled ? 'h-[104px]' : isHomePage ? 'h-[214px]' : 'h-[104px]'
                            }`}
                    >
                        {/* Mobile Top Section */}
                        <div className="flex justify-between items-center w-full px-[38px] pt-6 z-20 relative">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="h-[14px] w-[30px]"
                                aria-label="Toggle menu"
                            >
                                <svg className="block size-full" fill="none" viewBox="0 0 33 17">
                                    <path
                                        d="M1.5 1.5H31.5M1.5 8.5H31.5M1.5 15.5H31.5"
                                        stroke="#919191"
                                        strokeLinecap="round"
                                        strokeWidth="3"
                                    />
                                </svg>
                            </button>

                            {/* Logos Mobile */}
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/smilingwestjava.png"
                                    alt="Smiling West Java"
                                    width={40}
                                    height={40}
                                    className="h-8 w-auto"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Hero Content - Mobile */}
                        {!isScrolled && isHomePage && (
                            <div className="absolute bottom-[30px] w-full px-[38px] animate-fade-in">
                                <div className="font-['Inter:Regular',sans-serif] font-normal text-[28px] text-black mb-4 text-center">
                                    <p className="mb-0 leading-[1.1]">Smiling</p>
                                    <p className="leading-[1.1]">West Java</p>
                                </div>
                                <Link
                                    href="/videos"
                                    className="bg-[#2645cf] hover:bg-[#1e37a8] transition-colors h-[37px] rounded-[15px] w-full max-w-[200px] flex items-center justify-center mx-auto shadow-md active:scale-95"
                                >
                                    <span className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-white">
                                        Discover More
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="absolute top-[120px] left-[17px] right-[17px] bg-white rounded-[20px] shadow-lg p-6 pointer-events-auto animate-fade-in-up">
                        <nav className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-black hover:text-[#2645cf] transition-colors py-2 uppercase tracking-wide"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {/* Auth Mobile */}
                            <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-center px-4 py-2 border-2 border-[#F8BC16] text-[#F8BC16] rounded-xl font-semibold hover:bg-yellow-50"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full text-center px-4 py-2 bg-[#F8BC16] text-white rounded-xl font-semibold hover:bg-[#F2B10C]"
                                >
                                    Registrasi
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            {/* Spacer to prevent content from being hidden under fixed header - only for non-home pages */}
            {!isHomePage && (
                <div className="h-[104px]" />
            )}
        </>
    );
}
