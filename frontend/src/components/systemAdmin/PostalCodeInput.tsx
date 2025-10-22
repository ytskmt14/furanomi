import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { apiService } from '../../services/api';

interface PostalCodeInputProps {
  value: string;
  onChange: (postalCode: string) => void;
  onAddressSelect: (address: {
    prefecture: string;
    city: string;
    town: string;
    fullAddress: string;
  }) => void;
}

export const PostalCodeInput: React.FC<PostalCodeInputProps> = ({
  value,
  onChange,
  onAddressSelect
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  
  const handleSearch = async () => {
    if (!value || value.length < 7) {
      setError('郵便番号を正しく入力してください');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      const data = await apiService.searchPostalCode(value);
      
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        
        // 候補が1つの場合は自動選択
        if (data.results.length === 1) {
          const result = data.results[0];
          onAddressSelect({
            prefecture: result.prefecture,
            city: result.city,
            town: result.town,
            fullAddress: `${result.prefecture}${result.city}${result.town}`
          });
        }
      } else {
        setError('該当する住所が見つかりませんでした');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || '郵便番号検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResultSelect = (result: any) => {
    onAddressSelect({
      prefecture: result.prefecture,
      city: result.city,
      town: result.town,
      fullAddress: `${result.prefecture}${result.city}${result.town}`
    });
    setResults([]);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="postal_code">郵便番号</Label>
      <div className="flex gap-2">
        <Input
          id="postal_code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="123-4567"
          maxLength={8}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? '検索中...' : '住所検索'}
        </Button>
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {results.length > 1 && (
        <div className="border rounded-md p-2 space-y-1 bg-white">
          <p className="text-sm font-medium">候補を選択してください:</p>
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleResultSelect(result)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
            >
              {result.prefecture}{result.city}{result.town}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
