/**
 * 画像圧縮カスタムフック
 * 画像をリサイズして Base64 エンコード
 */

import { useCallback } from 'react';

/**
 * useImageCompression の戻り値
 */
export interface UseImageCompressionReturn {
  /** 画像を圧縮して Base64 エンコード */
  compressImage: (file: File) => Promise<string>;
}

/**
 * 画像圧縮フック
 *
 * @param maxWidth - 最大幅（デフォルト: 800）
 * @param maxHeight - 最大高さ（デフォルト: 600）
 * @param quality - JPEG 品質（デフォルト: 0.8）
 * @returns 画像圧縮機能
 *
 * @example
 * ```tsx
 * const { compressImage } = useImageCompression();
 * const compressedDataUrl = await compressImage(file);
 * ```
 */
export function useImageCompression(
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8
): UseImageCompressionReturn {
  const compressImage = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          let { width, height } = img;

          // アスペクト比を保持しながらリサイズ
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // 画像を描画
          ctx?.drawImage(img, 0, 0, width, height);

          // JPEG 形式で圧縮
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
      });
    },
    [maxWidth, maxHeight, quality]
  );

  return { compressImage };
}
