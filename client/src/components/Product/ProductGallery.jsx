import React from "react";
import { ChevronLeftIcon, ChevronRightIcon, BoltIcon } from "@heroicons/react/24/outline";

const ProductGallery = ({ images, name, outOfStock, isPromoActive, currentIndex, setCurrentIndex, resolveImage }) => (
  <div className="lg:col-span-7 w-full space-y-4 md:space-y-6">
    <div className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden bg-white shadow-sm border border-gray-100 group">
      <img
        src={resolveImage(images[currentIndex])}
        alt={name}
        className={`w-full h-full object-cover transition-all duration-[2s] group-hover:scale-105 ${outOfStock ? "grayscale opacity-50" : ""}`}
      />
      
      {/* Navigation - Masquée sur petit mobile pour plus de clarté, tactile actif */}
      {images.length > 1 && (
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none md:inset-x-6">
          <button onClick={() => setCurrentIndex(i => i === 0 ? images.length - 1 : i - 1)} className="p-3 md:p-4 bg-white/90 backdrop-blur-md rounded-full shadow-xl pointer-events-auto active:scale-75 transition-all">
            <ChevronLeftIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button onClick={() => setCurrentIndex(i => i === images.length - 1 ? 0 : i + 1)} className="p-3 md:p-4 bg-white/90 backdrop-blur-md rounded-full shadow-xl pointer-events-auto active:scale-75 transition-all">
            <ChevronRightIcon className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      )}
    </div>

    {/* Miniatures avec défilement fluide sur mobile */}
    <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x px-1 py-2">
      {images.map((img, i) => (
        <button
          key={i}
          onClick={() => setCurrentIndex(i)}
          className={`relative flex-shrink-0 w-16 h-20 md:w-24 md:h-28 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all snap-start ${i === currentIndex ? "border-indigo-600 scale-105" : "border-transparent opacity-50"}`}
        >
          <img src={resolveImage(img)} className="w-full h-full object-cover" alt="" />
        </button>
      ))}
    </div>
  </div>
);

export default ProductGallery;