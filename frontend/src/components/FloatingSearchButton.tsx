import React from 'react';

interface FloatingSearchButtonProps {
  onClick: () => void;
}

import { Search } from 'lucide-react';

export const FloatingSearchButton: React.FC<FloatingSearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 flex items-center justify-center z-40 group touch-manipulation active:scale-95"
      aria-label="店舗を検索"
    >
      <Search className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
};
