import { jsx as _jsx } from "react/jsx-runtime";
export const RecordingWaveform = () => (_jsx("div", { className: "absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-0.5", children: [...Array(5)].map((_, i) => (_jsx("div", { className: "w-1 bg-terracotta animate-pulse rounded-full", style: {
            height: `${Math.random() * 15 + 5}px`,
            animationDelay: `${i * 0.1}s`
        } }, i))) }));
