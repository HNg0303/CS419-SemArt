'use client';
import { useState, useRef } from 'react';
import { Search, Upload, X, ImageIcon, Sparkles, TrendingUp } from 'lucide-react';
import type { ArtImage } from '../types/Type';
import { ArtGallery } from '../components/ArtGallery';
import { SearchBar } from '../components/SearchBar';
import { StatsBar } from '../components/StatsBar';

// Mock art database
const artDatabase: ArtImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1681235014294-588fea095706?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhaW50aW5nJTIwYXJ0fGVufDF8fHx8MTc2NTg0Njg2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Abstract Composition',
    artist: 'Modern Artist',
    style: 'Abstract',
    tags: ['abstract', 'colorful', 'modern', 'geometric', 'vibrant']
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1572625259591-a99f7ff63a9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW5haXNzYW5jZSUyMHBhaW50aW5nJTIwbXVzZXVtfGVufDF8fHx8MTc2NTk1MTg2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Renaissance Portrait',
    artist: 'Classical Master',
    style: 'Renaissance',
    tags: ['renaissance', 'portrait', 'classical', 'museum', 'historic']
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1762291495547-718905bf2c70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzY3VscHR1cmUlMjBhcnR8ZW58MXx8fHwxNzY1ODk5MzI2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Modern Sculpture',
    artist: 'Contemporary Sculptor',
    style: 'Contemporary',
    tags: ['sculpture', 'modern', 'contemporary', '3d', 'installation']
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1765814142756-ea0dfa141bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbXByZXNzaW9uaXN0JTIwbGFuZHNjYXBlJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzY1OTUxODY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Impressionist Landscape',
    artist: 'French Impressionist',
    style: 'Impressionism',
    tags: ['impressionism', 'landscape', 'nature', 'pastoral', 'light']
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1647792845543-a8032c59cbdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcnQlMjBnYWxsZXJ5fGVufDF8fHx8MTc2NTkyMzk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Gallery Installation',
    artist: 'Installation Artist',
    style: 'Contemporary',
    tags: ['contemporary', 'installation', 'gallery', 'modern', 'minimalist']
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1700608277944-98b04da666ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmNvbG9yJTIwcGFpbnRpbmclMjBmbG93ZXJzfGVufDF8fHx8MTc2NTk1MTg2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Watercolor Flowers',
    artist: 'Botanical Artist',
    style: 'Watercolor',
    tags: ['watercolor', 'flowers', 'botanical', 'delicate', 'nature']
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1763070605752-fe349372a651?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBwb3J0cmFpdCUyMHBhaW50aW5nfGVufDF8fHx8MTc2NTk1MTg2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Classical Portrait',
    artist: 'Portrait Master',
    style: 'Classical',
    tags: ['portrait', 'classical', 'realistic', 'traditional', 'figure']
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1628522994788-53bc1b1502c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBhcnQlMjBncmFmZml0aXxlbnwxfHx8fDE3NjU5MDMzMzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Street Art',
    artist: 'Urban Artist',
    style: 'Street Art',
    tags: ['street art', 'graffiti', 'urban', 'contemporary', 'colorful']
  },
  {
    id: '9',
    url: 'https://images.unsplash.com/photo-1649513137940-daacab3ee11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0d29ya3xlbnwxfHx8fDE3NjU4ODE3NTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Minimalist Composition',
    artist: 'Minimalist',
    style: 'Minimalism',
    tags: ['minimalist', 'simple', 'clean', 'modern', 'geometric']
  },
  {
    id: '10',
    url: 'https://images.unsplash.com/photo-1762860498297-4b6c3591b041?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRyYWRpdGlvbmFsJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzY1ODU0ODY2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Traditional Asian Art',
    artist: 'Eastern Master',
    style: 'Traditional Asian',
    tags: ['asian', 'traditional', 'calligraphy', 'ink', 'cultural']
  },
  {
    id: '11',
    url: 'https://images.unsplash.com/photo-1614278092029-5a4c98659375?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJyZWFsaXN0JTIwYXJ0JTIwcGFpbnRpbmd8ZW58MXx8fHwxNzY1OTUxODY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Surrealist Vision',
    artist: 'Surrealist',
    style: 'Surrealism',
    tags: ['surrealism', 'dreamlike', 'abstract', 'imaginative', 'fantasy']
  },
  {
    id: '12',
    url: 'https://images.unsplash.com/photo-1725347740942-c5306e3c970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2NTkxNjE4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    title: 'Digital Illustration',
    artist: 'Digital Artist',
    style: 'Digital Art',
    tags: ['digital', 'illustration', 'modern', 'creative', 'technology']
  }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ArtImage[]>(artDatabase);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate search with text
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    setTimeout(() => {
      if (!query.trim()) {
        setSearchResults(artDatabase);
      } else {
        const lowerQuery = query.toLowerCase();
        const filtered = artDatabase.filter(
          (art) =>
            art.title.toLowerCase().includes(lowerQuery) ||
            art.artist.toLowerCase().includes(lowerQuery) ||
            art.style.toLowerCase().includes(lowerQuery) ||
            art.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
        setSearchResults(filtered.length > 0 ? filtered : artDatabase);
      }
      setIsSearching(false);
    }, 500);
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        simulateImageSearch();
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate image-based search
  const simulateImageSearch = () => {
    setIsSearching(true);
    setSearchQuery('');
    
    setTimeout(() => {
      // Randomly shuffle results to simulate image similarity search
      const shuffled = [...artDatabase].sort(() => Math.random() - 0.5);
      setSearchResults(shuffled);
      setIsSearching(false);
    }, 800);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    setSearchResults(artDatabase);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Logo and Title Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-4 rounded-2xl shadow-xl">
                  <img src="icon.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-slate-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Art Retrieval System
                  </h1>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-slate-600">Discover and explore artworks with AI-powered search</p>
              </div>
            </div>
            
            <StatsBar totalArtworks={artDatabase.length} resultsCount={searchResults.length} />
          </div>

          {/* Search Controls */}
          <div className="space-y-4">
            <SearchBar onSearch={handleSearch} value={searchQuery} />

            {/* Upload Section */}
            <div className="flex flex-wrap items-center gap-4">
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
                  <span className="text-slate-500 text-xs">Search by similarity</span>
                </div>
              </label>

              {uploadedImage && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg animate-fadeIn">
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-12 h-12 object-cover rounded-lg ring-2 ring-white/50"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-white block">Searching with your image</span>
                    <span className="text-purple-100 text-xs">AI similarity detection active</span>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        {isSearching ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-transparent border-t-pink-600 rounded-full animate-spin-slow"></div>
              </div>
              <p className="text-slate-900 mb-2">Analyzing artworks...</p>
              <p className="text-slate-500 text-sm">Finding the perfect matches for you</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-slate-600">
                  Found{' '}
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    {searchResults.length}
                  </span>{' '}
                  artwork{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ArtGallery artworks={searchResults} />
          </>
        )}
      </main>
    </div>
  );
}