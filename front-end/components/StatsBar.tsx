import { Database, BarChart3 } from 'lucide-react';

interface StatsBarProps {
  totalArtworks: number;
  resultsCount: number;
}

export function StatsBar({ totalArtworks, resultsCount }: StatsBarProps) {
  return (
    <div className="hidden md:flex items-center gap-6">
      <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/50">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Database className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-slate-500">Total Collection</p>
          <p className="text-slate-900">{totalArtworks}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-xs text-purple-100">Showing</p>
          <p className="text-white">{resultsCount}</p>
        </div>
      </div>
    </div>
  );
}
