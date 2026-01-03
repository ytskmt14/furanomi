import React, { useState } from 'react';
import { Shop, ShopCategory, AvailabilityStatus } from '../types/shop';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Search as SearchIcon, X, Utensils, Coffee, Wine, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  onFilteredShops: (shops: Shop[]) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, 
  onClose, 
  shops, 
  onFilteredShops 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<ShopCategory[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityStatus[]>([]);

  const categories: { value: ShopCategory; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'restaurant', label: 'レストラン', Icon: Utensils },
    { value: 'cafe', label: 'カフェ', Icon: Coffee },
    { value: 'izakaya', label: '居酒屋', Icon: Wine },
  ];

  const availabilityOptions: { value: AvailabilityStatus; label: string; Icon: React.ComponentType<{ className?: string }> ; color: string }[] = [
    { value: 'available', label: '空きあり', Icon: CheckCircle, color: 'text-green-600' },
    { value: 'busy', label: '混雑', Icon: AlertTriangle, color: 'text-yellow-600' },
    { value: 'full', label: '満席', Icon: XCircle, color: 'text-red-600' },
  ];

  const handleSearch = () => {
    let filteredShops = shops;

    // 店舗名検索
    if (searchTerm.trim()) {
      filteredShops = filteredShops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // カテゴリフィルター
    if (selectedCategories.length > 0) {
      filteredShops = filteredShops.filter(shop =>
        selectedCategories.includes(shop.category)
      );
    }

    // 空き状況フィルター
    if (selectedAvailability.length > 0) {
      filteredShops = filteredShops.filter(shop =>
        selectedAvailability.includes(shop.availability_status)
      );
    }


    onFilteredShops(filteredShops);
    onClose();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedAvailability([]);
    onFilteredShops(shops);
    onClose();
  };

  const toggleCategory = (category: ShopCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAvailability = (availability: AvailabilityStatus) => {
    setSelectedAvailability(prev =>
      prev.includes(availability)
        ? prev.filter(a => a !== availability)
        : [...prev, availability]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in-0 duration-200">
      <Card className="w-full max-w-md max-h-[90vh] sm:max-h-[80vh] overflow-y-auto animate-in zoom-in-95 duration-200 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-4 sticky top-0 bg-white z-10 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 inline-flex items-center gap-2">
            <SearchIcon className="w-5 h-5" /> 店舗を検索
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 sm:h-10 sm:w-10 p-0 touch-manipulation" aria-label="閉じる">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* 店舗名検索 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              店舗名で検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="店舗名を入力..."
              className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
            />
          </div>

          {/* カテゴリフィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => toggleCategory(category.value)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors duration-200 touch-manipulation min-h-[44px] ${
                    selectedCategories.includes(category.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <category.Icon className="w-4 h-4 sm:w-4 sm:h-4" /> {category.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 空き状況フィルター */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              空き状況
            </label>
            <div className="flex flex-wrap gap-2">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleAvailability(option.value)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors duration-200 touch-manipulation min-h-[44px] ${
                    selectedAvailability.includes(option.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5 sm:gap-2">
                    <option.Icon className={`w-4 h-4 sm:w-4 sm:h-4 ${option.color}`} /> {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>


          {/* アクションボタン */}
          <div className="flex gap-3 pt-2 sm:pt-4">
            <Button onClick={handleClearFilters} variant="outline" className="flex-1 h-11 sm:h-10 text-base sm:text-sm font-medium touch-manipulation">
              クリア
            </Button>
            <Button onClick={handleSearch} className="flex-1 h-11 sm:h-10 text-base sm:text-sm font-medium touch-manipulation">
              検索
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
