'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function LiquidAnimation() {
    const [blobs, setBlobs] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

    useEffect(() => {
        const initialBlobs = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 200 + 100,
        }));
        setBlobs(initialBlobs);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {blobs.map((blob) => (
                <motion.div
                    key={blob.id}
                    className="absolute rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                        filter: 'blur(40px)',
                        width: blob.size,
                        height: blob.size,
                    }}
                    initial={{ x: `${blob.x}%`, y: `${blob.y}%` }}
                    animate={{
                        x: [
                            `${blob.x}%`,
                            `${(blob.x + 20) % 100}%`,
                            `${(blob.x + 40) % 100}%`,
                            `${blob.x}%`,
                        ],
                        y: [
                            `${blob.y}%`,
                            `${(blob.y + 30) % 100}%`,
                            `${(blob.y + 15) % 100}%`,
                            `${blob.y}%`,
                        ],
                        scale: [1, 1.2, 0.9, 1],
                    }}
                    transition={{
                        duration: 20 + blob.id * 5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}
