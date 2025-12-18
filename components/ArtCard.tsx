import { useState, useRef, useEffect } from 'react';
import { ArtImage } from "../types/Type"
import { Palette, Heart, Eye, Share2 } from 'lucide-react';

interface ArtCardProps {
  artwork: ArtImage;
}

export function ArtCard({ artwork }: ArtCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
 const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && img.naturalWidth) setImageLoaded(true);
    else setImageLoaded(false);
  }, [artwork.url]);

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/20 to-transparent z-10 rounded-bl-3xl"></div>
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Palette className="w-10 h-10 text-slate-300 animate-pulse" />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        )}
        <img
          ref = {imgRef}
          src={artwork.url}
          alt={artwork.title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isHovered ? 'scale-110 rotate-1' : 'scale-100 rotate-0'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Quick action buttons */}
        <div className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all hover:scale-110"
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
          </button>
          <button className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:bg-white transition-all hover:scale-110">
            <Share2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        
        {/* Overlay on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {artwork.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs border border-white/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-white/80">
              <div className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>100</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                <span>100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5">
        <h3 className="text-slate-900 mb-2 line-clamp-1 group-hover:text-purple-600 transition-colors">{artwork.title}</h3>
        <p className="text-slate-600 text-sm mb-3">{artwork.artist}</p>
        <div className="flex items-center justify-between">
          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs shadow-sm">
            {artwork.style}
          </span>
          <button className="text-slate-400 hover:text-purple-600 transition-colors">
            <Palette className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Animated border on hover */}
      <div className={`absolute inset-0 rounded-2xl border-2 border-purple-500 transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}></div>
    </div>
  );
}