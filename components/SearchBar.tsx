import { Search } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  value: string;
}

export function SearchBar({ onSearch, value }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Real-time search as user types
    onSearch(newValue);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${isFocused ? 'opacity-30' : ''}`}></div>
      <div className="relative">
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-purple-600' : 'text-slate-400'}`} />
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search by title, artist, style, or keywords..."
          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-lg shadow-slate-200/50 transition-all duration-300 text-slate-900 placeholder:text-slate-400"
        />
      </div>
    </form>
  );
}