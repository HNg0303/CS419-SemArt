// lib/api.ts
import type { ArtImage } from "@/types/Type";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export type BackendImageItem = {
  IMAGE_ID: string;
  IMAGE_FILE: string;
  TITLE?: string;
  AUTHOR?: string;
  TYPE?: string;
  IMAGE_URL: string; // "/images/xxx.jpg"
};

export type ImagesResponse = {
  images: BackendImageItem[];
  total: number;
  scrolled: number;
};

export type TextSearchResultItem = {
  rank: number;
  score: number;
  image_id: string;
  image_file: string;
  title?: string;
  author?: string;
  type?: string;
  technique?: string;
  description?: string;
  image_url: string; // "/images/xxx.jpg"
};

export type TextSearchResponse = {
  query: string;
  returned: number;
  results: TextSearchResultItem[];
};

export async function getImagesPage(offset: number, limit: number) {
  const res = await fetch(
    `${API_BASE}/api/images/?offset=${offset}&limit=${limit}`,
  );
  if (!res.ok) throw new Error("Failed to load images");
  return (await res.json()) as ImagesResponse;
}

export async function retrieveByImage(file: File) {
  const form = new FormData();
  form.append("file", file); // phải là "file" đúng như backend

  const res = await fetch(`${API_BASE}/api/retrieve/`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Image retrieve failed");
  return (await res.json()) as { images: BackendImageItem[] };
}

export async function searchByText(query: string) {
  const params = new URLSearchParams({ query });
  const res = await fetch(`${API_BASE}/api/search/?${params.toString()}`);
  if (!res.ok) throw new Error("Text search failed");
  return (await res.json()) as TextSearchResponse;
}

export function mapBackendImageToArtImage(item: BackendImageItem): ArtImage {
  return {
    id: `${item.IMAGE_ID}_${item.IMAGE_FILE}`,
    url: `${API_BASE}${item.IMAGE_URL}`,
    title: item.TITLE ?? "",
    artist: item.AUTHOR ?? "",
    style: item.TYPE ?? "",
    tags: [],
  };
}

export function mapTextResultToArtImage(item: TextSearchResultItem): ArtImage {
  return {
    id: `${item.image_id}_${item.image_file}`,
    url: `${API_BASE}${item.image_url}`,
    title: item.title ?? "",
    artist: item.author ?? "",
    style: item.type ?? "",
    tags: item.technique ? [item.technique] : [],
  };
}
