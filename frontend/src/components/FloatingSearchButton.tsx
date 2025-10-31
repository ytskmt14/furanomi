import React from 'react';

interface FloatingSearchButtonProps {
  onClick: () => void;
}

import { Search } from 'lucide-react';

export const FloatingSearchButton: React.FC<FloatingSearchButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
    >
      <Search className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
};
