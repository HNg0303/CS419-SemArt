import { ArtImage } from "../types/Type"
import { ArtCard } from './ArtCard';

interface ArtGalleryProps {
  artworks: ArtImage[];
}

export function ArtGallery({ artworks }: ArtGalleryProps) {
  if (artworks.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">No artworks found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <ArtCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
