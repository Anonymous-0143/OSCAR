import React, { useRef, useId } from "react";
import { cn } from "../../lib/utils";

export const MagicCard = ({
    imageUrl,
    title,
    description,
    icon,
    className,
    gradientColor = "#262626",
    ...props
}) => {
    const cardRef = useRef(null);
    const id = useId();
    const filterId = `magic-card-blur-${id.replace(/:/g, '')}`;

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-8 text-center transition-all duration-300 hover:bg-white/10 dark:bg-black/20 dark:hover:bg-black/30",
                className
            )}
            {...props}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${gradientColor}50, transparent 40%)`,
                }}
            />
            
            <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl shadow-sm backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            </div>
        </div>
    );
};
