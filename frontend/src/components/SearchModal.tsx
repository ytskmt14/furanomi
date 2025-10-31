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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h2 className="text-xl font-semibold text-gray-900 inline-flex items-center gap-2">
            <SearchIcon className="w-5 h-5" /> 店舗を検索
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategories.includes(category.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <category.Icon className="w-4 h-4" /> {category.label}
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedAvailability.includes(option.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <option.Icon className={`w-4 h-4 ${option.color}`} /> {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>


          {/* アクションボタン */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleClearFilters} variant="outline" className="flex-1">
              クリア
            </Button>
            <Button onClick={handleSearch} className="flex-1">
              検索
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
