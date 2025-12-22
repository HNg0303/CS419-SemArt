"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Upload, X, ImageIcon, Sparkles } from "lucide-react";
import type { ArtImage } from "../types/Type";
import { ArtGallery } from "../components/ArtGallery";
import { SearchBar } from "../components/SearchBar";
import { StatsBar } from "../components/StatsBar";
import {
  getImagesPage,
  retrieveByImage,
  searchByText,
  mapBackendImageToArtImage,
  mapTextResultToArtImage,
} from "@/lib/api";

// import InfiniteScroll from 'react-infinite-scroll-component';

export default function App() {
  const [inputQuery, setInputQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [artDatabase, setArtDatabase] = useState<ArtImage[]>([]);
  const [searchResults, setSearchResults] = useState<ArtImage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 100;
  const [totalArtworks, setTotalArtworks] = useState(0);

  // Update isSearching based on query or image
  useEffect(() => {
    setIsSearching(!!submittedQuery.trim() || !!uploadedImage);
  }, [submittedQuery, uploadedImage]);

  const submitSearch = (q: string) => {
    setSubmittedQuery(q.trim().toLowerCase());
  };

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/images/?offset=${offset}&limit=${limit}`,
      );
      const data = await res.json();
      const artworks = data.images.map((item: any) => ({
        id: `${item.IMAGE_ID}_${item.IMAGE_FILE}`,
        url: `http://localhost:8000${item.IMAGE_URL}`,
        title: item.TITLE || "",
        artist: item.AUTHOR || "",
        style: item.TYPE || "",
        tags: [],
      }));
      setArtDatabase((prev) => [...prev, ...artworks]);
      setOffset((prev) => prev + limit);
      if (artDatabase.length + artworks.length >= data.scrolled)
        setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreImages = async () => {
    if (submittedQuery.trim() || uploadedImage) return;
    if (!hasMore) return;

    setIsLoading(true);
    try {
      const data = await getImagesPage(offset, limit);
      setTotalArtworks(data.total ?? data.scrolled);

      const artworks = data.images.map(mapBackendImageToArtImage);

      setArtDatabase((prev) => {
        const next = [...prev, ...artworks];
        if (next.length >= (data.scrolled ?? data.total)) setHasMore(false);
        return next;
      });

      setSearchResults((prev) => [...prev, ...artworks]);
      setOffset((prev) => prev + limit);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMoreImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (uploadedImage) return;

    const t = setTimeout(() => {
      submitSearch(inputQuery);
    }, 500);

    return () => clearTimeout(t);
  }, [inputQuery, uploadedImage]);

  useEffect(() => {
    const q = submittedQuery.trim();

    if (!q) {
      setSearchResults(artDatabase);
      return;
    }

    setIsLoading(true);
    (async () => {
      try {
        const data = await searchByText(q);
        const mapped = (data.results ?? []).map(mapTextResultToArtImage);
        setSearchResults(mapped);
      } catch {
        setSearchResults(artDatabase);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [submittedQuery, artDatabase]);

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadedImage(URL.createObjectURL(file));

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);

    // Call backend retrieval API
    const res = await fetch("http://localhost:8000/api/retrieve/", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    // Map backend results to ArtImage[]
    const artworks = data.images.map((item: any) => ({
      id: `${item.IMAGE_ID}_${item.IMAGE_FILE}`,
      url: `http://localhost:8000${item.IMAGE_URL}`,
      title: item.TITLE || "",
      artist: item.AUTHOR || "",
      style: item.TYPE || "",
      tags: [],
    }));

    setSearchResults(artworks.slice(0, limit));
    setInputQuery("");
    setSubmittedQuery("");
    setIsLoading(false);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setInputQuery("");
    setSubmittedQuery("");
    setSearchResults(artDatabase);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Top Row: Logo/Title, Upload, StatsBar */}
          <div className="flex items-center justify-between mb-8 gap-6">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-4 rounded-2xl shadow-xl">
                  <img
                    src="icon.png"
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-slate-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Art Retrieval System
                  </h1>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-slate-600">
                  Discover and explore artworks with AI-powered search
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white to-purple-50/50 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300 cursor-pointer"
              >
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-slate-900 block">Upload Image</span>
                  <span className="text-slate-500 text-xs">
                    Search by similarity
                  </span>
                </div>
              </label>
              {uploadedImage && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg animate-fadeIn ml-4">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-12 h-12 object-cover rounded-lg ring-2 ring-white/50"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-white block">
                      Searching with your image
                    </span>
                    <span className="text-purple-100 text-xs">
                      AI similarity detection active
                    </span>
                  </div>
                  <button
                    onClick={clearUploadedImage}
                    className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}
            </div>

            {/* StatsBar */}
            <StatsBar
              totalArtworks={totalArtworks}
              resultsCount={isSearching ? searchResults.length : totalArtworks}
            />
          </div>

          {/* Search Bar below the top row */}
          <div className="space-y-4">
            <SearchBar
              value={inputQuery}
              onChange={setInputQuery}
              onSubmit={submitSearch} // Enter gọi ngay
            />
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main
        id="scrollableDiv"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
             pt-8 pb-12 relative
             h-[calc(100vh-160px)] overflow-hidden"
        style={{ marginTop: "0px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            {/* ...loading spinner... */}
          </div>
        ) : (
          <>
            {/* <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-slate-600">
                  Found{' '}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    {isSearching ? searchResults.length : totalArtworks}
                  </span>{' '}
                  artwork{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div> */}
            <ArtGallery
              artworks={searchResults}
              fetchMoreImages={fetchMoreImages}
              hasMore={!submittedQuery.trim() && !uploadedImage && hasMore}
            />
          </>
        )}
      </main>
    </div>
  );
}
