import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ProductGallery = ({
  images = [],
  name,
  outOfStock,
  currentIndex,
  setCurrentIndex,
  resolveImage,
}) => (
  <div className="lg:col-span-7 w-full flex flex-col gap-4 md:gap-6 min-w-0">

    {/* IMAGE PRINCIPALE */}
    {/* Ajustement : aspect-[1/1] sur desktop pour éviter le scroll excessif, et object-contain */}
    <div className="relative w-full aspect-square md:aspect-[4/5] lg:max-h-[600px] rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-[#F8FAFC] border border-slate-100 group">

      <img
        src={resolveImage(images[currentIndex])}
        alt={name}
        className={`w-full h-full object-contain p-4 md:p-8 transition-all duration-500 ease-in-out 
        ${outOfStock ? "grayscale opacity-50" : "opacity-100 hover:scale-105"}`}
      />

      {/* NAVIGATION (Flèches plus discrètes et modernes) */}
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <button
              onClick={() =>
                setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1))
              }
              className="pointer-events-auto p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:bg-white active:scale-90 transition-all"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-900" />
            </button>

            <button
              onClick={() =>
                setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1))
              }
              className="pointer-events-auto p-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:bg-white active:scale-90 transition-all"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-900" />
            </button>
          </div>

          {/* DOTS (Visibles uniquement sur mobile) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-8 bg-indigo-600" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>

    {/* MINIATURES (Thumbnails plus épurées) */}
    <div className="w-full">
      <div className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-hide snap-x">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 
            ${
              i === currentIndex
                ? "border-indigo-600 shadow-lg shadow-indigo-100 scale-105"
                : "border-transparent bg-gray-50 hover:bg-gray-100 opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={resolveImage(img)}
              className="w-full h-full object-contain p-2"
              alt={`Miniature ${i + 1}`}
            />
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default ProductGallery;