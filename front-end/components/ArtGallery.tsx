'use client';

import React, { useRef } from 'react';
import { ArtImage } from '../types/Type';
import { ArtCard } from './ArtCard';
import { AutoSizer, Grid } from 'react-virtualized';
import 'react-virtualized/styles.css';

const CARD_WIDTH = 280;
const CARD_HEIGHT = 540;
const GAP = 24;

export function ArtGallery({
  artworks,
  fetchMoreImages,
  hasMore,
}: ArtGalleryProps) {
  const loadingRef = useRef(false);

  return (
    <AutoSizer>
      {({ width, height }) => {
        const columnCount = Math.max(
          1,
          Math.floor((width + GAP) / (CARD_WIDTH + GAP))
        );
        const rowCount = Math.ceil(artworks.length / columnCount);

        return (
          <Grid
            width={width}
            height={height}
            columnWidth={CARD_WIDTH + GAP}
            rowHeight={CARD_HEIGHT + GAP}
            columnCount={columnCount}
            rowCount={rowCount}
            className="hide-scrollbar"
            overscanRowCount={2}
            onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
              if (
                hasMore &&
                !loadingRef.current &&
                scrollTop + clientHeight >= scrollHeight - 800
              ) {
                loadingRef.current = true;
                fetchMoreImages();
                setTimeout(() => {
                  loadingRef.current = false;
                }, 500);
              }
            }}
            cellRenderer={({ columnIndex, rowIndex, key, style }) => {
              const index = rowIndex * columnCount + columnIndex;
              if (index >= artworks.length) return null;

              return (
                <div
                  key={key}
                  style={{
                    ...style,
                    padding: GAP / 2,
                  }}
                >
                  <ArtCard artwork={artworks[index]} />
                </div>
              );
            }}
          />
        );
      }}
    </AutoSizer>
  );
}
