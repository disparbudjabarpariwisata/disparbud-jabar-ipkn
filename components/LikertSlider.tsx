"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { motion, AnimatePresence } from "motion/react";

interface LikertSliderProps {
    value?: number;
    onChange?: (value: number) => void;
    leftLabel?: string;
    rightLabel?: string;
    disabled?: boolean;
}

export default function LikertSlider({
    value,
    onChange,
    leftLabel = "Sangat Kurang",
    rightLabel = "Sangat Baik",
    disabled = false
}: LikertSliderProps) {
    const [currentValue, setCurrentValue] = React.useState<number>(value ?? 4);
    const [isDragging, setIsDragging] = React.useState(false);

    React.useEffect(() => {
        if (typeof value === "number") {
            setCurrentValue(value);
        }
    }, [value]);

    const handleValueChange = (vals: number[]) => {
        const next = vals[0] ?? 4;
        setCurrentValue(next);
        onChange?.(next);
    };

    return (
        <div className="w-full flex flex-col gap-8 pb-4 pt-8 px-2 sm:px-6">

            {/* Slider Track and Thumb */}
            <SliderPrimitive.Root
                className="relative flex w-full touch-none select-none items-center"
                value={[currentValue]}
                min={1}
                max={7}
                step={1}
                onValueChange={handleValueChange}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                disabled={disabled}
            >
                <SliderPrimitive.Track className="relative h-2.5 sm:h-3 w-full grow overflow-hidden rounded-full bg-slate-200">
                    <SliderPrimitive.Range className="absolute h-full bg-[#10b981] transition-all duration-300 ease-out" />
                </SliderPrimitive.Track>

                {/* Tick Marks (Visual only) */}
                <div className="absolute inset-0 flex justify-between px-[6px] pointer-events-none">
                    {[1, 2, 3, 4, 5, 6, 7].map((tick) => (
                        <div key={tick} className="h-full flex items-center justify-center">
                            <div className={
                                `h-1.5 w-1.5 rounded-full transition-colors ${tick <= currentValue ? "bg-white/70" : "bg-slate-400/40"}`
                            }></div>
                        </div>
                    ))}
                </div>

                <SliderPrimitive.Thumb className="group block h-7 w-7 sm:h-8 sm:w-8 rounded-full border-4 border-[#10b981] bg-white ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:cursor-grab active:cursor-grabbing shadow-md relative">

                    {/* Animated Tooltip following the thumb */}
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="absolute -top-12 left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#10b981] text-white font-bold text-sm shadow-lg border-2 border-white pointer-events-none"
                        >
                            {currentValue}

                            {/* Tooltip triangle indicator */}
                            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#10b981]"></div>
                        </motion.div>
                    </AnimatePresence>

                </SliderPrimitive.Thumb>
            </SliderPrimitive.Root>

            {/* Labels and Target Numbers */}
            <div className="relative w-full">
                {/* Numbers row directly under slider */}
                <div className="flex justify-between w-full text-sm font-medium text-slate-400 px-1 mb-3">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <span
                            key={num}
                            className={
                                `w-4 text-center cursor-pointer transition-colors duration-200 ${num === currentValue ? "text-[#10b981] font-bold text-base scale-110" : "hover:text-slate-600"}`
                            }
                            onClick={() => {
                                if (!disabled) {
                                    setCurrentValue(num);
                                    onChange?.(num);
                                }
                            }}
                        >
                            {num}
                        </span>
                    ))}
                </div>

                {/* Descriptive labels */}
                <div className="flex justify-between w-full text-xs sm:text-sm font-semibold text-slate-500">
                    <span className="max-w-[120px] sm:max-w-[180px] leading-snug">{leftLabel}</span>
                    <span className="max-w-[120px] sm:max-w-[180px] text-right leading-snug">{rightLabel}</span>
                </div>
            </div>

        </div>
    );
}
