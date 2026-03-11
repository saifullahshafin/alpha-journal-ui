"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function MasonryGallery({ images }: { images: string[] }) {
    const [lightbox, setLightbox] = useState<string | null>(null);

    if (!images || images.length === 0) {
        return (
            <div className="h-32 flex items-center justify-center rounded-xl"
                style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-[#a3a3a3] text-sm">No chart screenshots attached.</p>
            </div>
        );
    }

    return (
        <>
            <div
                className="gap-3"
                style={{
                    columns: images.length === 1 ? 1 : images.length === 2 ? 2 : 3,
                    columnGap: "12px",
                }}
            >
                {images.map((url, i) => (
                    <div
                        key={i}
                        className="break-inside-avoid mb-3 rounded-xl overflow-hidden cursor-zoom-in relative group"
                        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                        onClick={() => setLightbox(url)}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={`Chart ${i + 1}`}
                            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        <div className="absolute bottom-2 right-2 text-[10px] text-white/60 bg-black/40 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to expand
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                        onClick={() => setLightbox(null)}
                    >
                        <X size={28} />
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lightbox}
                        alt="Expanded chart"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
