/**
 * 画像アップロードステップコンポーネント
 * 店舗画像をアップロードし、クライアントサイドで圧縮する
 */

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { ShopOnboardingFormData, FormErrors } from '../types';
import { useImageCompression } from '../../../shopManager/hooks/useImageCompression';

export interface ImageUploadStepProps {
  /** フォームデータ */
  formData: Pick<ShopOnboardingFormData, 'image_url'>;
  /** フィールド変更時のコールバック */
  onChange: (field: keyof ShopOnboardingFormData, value: any) => void;
  /** エラーメッセージ */
  errors: FormErrors;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

/**
 * 画像アップロードステップコンポーネント
 * 
 * 店舗画像をアップロードし、クライアントサイドで圧縮します。
 * 
 * @example
 * ```tsx
 * <ImageUploadStep
 *   formData={formData}
 *   onChange={handleChange}
 *   errors={errors}
 * />
 * ```
 */
export const ImageUploadStep: React.FC<ImageUploadStepProps> = ({
  formData,
  onChange,
  errors,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { compressImage } = useImageCompression(800, 600, 0.8);

  // ファイル選択ハンドラ
  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      return;
    }

    setError(null);
    setIsCompressing(true);

    try {
      // ファイル形式チェック
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error('JPEGまたはPNG形式の画像を選択してください');
      }

      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`ファイルサイズは5MB以下にしてください（現在：${Math.round(file.size / 1024 / 1024 * 10) / 10}MB）`);
      }

      // 画像を圧縮
      const compressedDataUrl = await compressImage(file);
      
      // フォームデータを更新
      onChange('image_url', compressedDataUrl);
    } catch (err: any) {
      const errorMessage = err.message || '画像の処理に失敗しました';
      setError(errorMessage);
      onChange('image_url', '');
    } finally {
      setIsCompressing(false);
    }
  };

  // ドラッグ&ドロップハンドラ
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // ファイル選択ダイアログを開く
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // 画像を削除
  const handleRemoveImage = () => {
    onChange('image_url', '');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ファイル選択ボタンをクリック
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          店舗画像のアップロード
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          店舗の画像をアップロードしてください。画像は自動的に圧縮されます（任意）。
        </p>
      </div>

      <div className="space-y-4">
        {/* ファイル選択エリア */}
        {!formData.image_url && (
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 transition-colors
              ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isCompressing}
            />

            <div className="text-center">
              <div className="mx-auto w-16 h-16 text-gray-400 mb-4 flex items-center justify-center">
                {isCompressing ? (
                  <Loader2 className="w-16 h-16 animate-spin" />
                ) : (
                  <Upload className="w-16 h-16" />
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {isCompressing ? (
                  <span className="text-blue-600">画像を圧縮中...</span>
                ) : (
                  <>
                    <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer" onClick={handleSelectClick}>
                      クリックしてファイルを選択
                    </span>
                    またはドラッグ&ドロップ
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                対応形式：JPEG、PNG（最大5MB）
              </p>
            </div>
          </div>
        )}

        {/* 画像プレビュー */}
        {formData.image_url && (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={formData.image_url}
                alt="店舗画像プレビュー"
                className="w-full max-w-md h-64 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="画像を削除"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectClick}
                disabled={isCompressing}
              >
                別の画像を選択
              </Button>
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {(error || errors.image_url) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              {error || errors.image_url}
            </p>
          </div>
        )}

        {/* ヘルプテキスト */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>ヒント:</strong> 画像は自動的に最大800x600ピクセルにリサイズされ、JPEG品質80%で圧縮されます。
            これにより、アップロード速度が向上し、ストレージ容量を節約できます。
          </p>
        </div>
      </div>
    </div>
  );
};

