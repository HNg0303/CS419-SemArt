import { FixedSizeGrid as Grid } from 'react-window';

export function ArtGalleryVirtual({ images }: { images: string[] }) {
   if (images.length === 0) {
      return (
         <div className="text-center py-20">
            <p className="text-slate-500">No artworks found. Try a different search.</p>
         </div>
      );
   }

   const columnCount = 4;
   const rowCount = Math.ceil(images.length / columnCount);
   const cellSize = 220;

   return (
      <Grid
         columnCount={columnCount}
         columnWidth={cellSize}
         height={800}
         rowCount={rowCount}
         rowHeight={cellSize}
         width={columnCount * cellSize}
         style={{ borderRadius: 16, overflow: 'hidden', background: 'white' }}
      >
         {({ columnIndex, rowIndex, style }) => {
            const idx = rowIndex * columnCount + columnIndex;
            if (idx >= images.length) return null;
            const img = images[idx];
            return (
               <div style={style} className="p-2">
                  <img
                     src={`http://localhost:8000/images/${img}`}
                     alt={img}
                     loading="lazy"
                     className="w-full h-full object-cover rounded-lg shadow"
                  />
               </div>
            );
         }}
      </Grid>
   );
}