/**
 * ステップインジケーターコンポーネント
 * 登録フローの進捗状況を視覚的に表示する
 */

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepIndicatorProps {
  /** 現在のステップ番号（1から開始） */
  currentStep: number;
  /** 総ステップ数 */
  totalSteps: number;
  /** 完了したステップ番号の配列 */
  completedSteps: number[];
  /** ステップクリック時のコールバック（完了したステップのみ有効） */
  onStepClick?: (step: number) => void;
}

/**
 * ステップインジケーターコンポーネント
 * 
 * 登録フローの進捗状況を視覚的に表示します。
 * - 現在のステップを強調表示
 * - 完了したステップをチェックマークで表示
 * - 未完了のステップをグレーアウト
 * - ステップ番号と総ステップ数を表示
 * - 完了したステップへのクリックで戻る機能
 * 
 * @example
 * ```tsx
 * <StepIndicator
 *   currentStep={2}
 *   totalSteps={6}
 *   completedSteps={[1]}
 *   onStepClick={(step) => console.log('Step clicked:', step)}
 * />
 * ```
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  onStepClick,
}) => {
  // ステップの状態を判定する関数
  const getStepStatus = (step: number): 'completed' | 'current' | 'upcoming' => {
    if (completedSteps.includes(step)) {
      return 'completed';
    }
    if (step === currentStep) {
      return 'current';
    }
    return 'upcoming';
  };

  // ステップがクリック可能か判定
  const isStepClickable = (step: number): boolean => {
    return completedSteps.includes(step) && onStepClick !== undefined;
  };

  // ステップクリックハンドラ
  const handleStepClick = (step: number) => {
    if (isStepClickable(step)) {
      onStepClick?.(step);
    }
  };

  return (
    <div className="w-full">
      {/* モバイル用: コンパクトなステップインジケーター */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between px-2">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            const isClickable = isStepClickable(step);

            return (
              <React.Fragment key={step}>
                {/* ステップ番号/アイコン（モバイル: 小さめ） */}
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step)}
                    disabled={!isClickable}
                    className={cn(
                      'relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all touch-manipulation',
                      {
                        // 完了したステップ
                        'bg-green-500 border-green-500 text-white cursor-pointer active:bg-green-600':
                          status === 'completed',
                        // 現在のステップ
                        'bg-blue-600 border-blue-600 text-white ring-2 ring-blue-200 shadow-lg':
                          status === 'current',
                        // 未完了のステップ
                        'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed':
                          status === 'upcoming',
                      }
                    )}
                    aria-label={`ステップ ${step}`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-semibold">{step}</span>
                    )}
                  </button>
                </div>

                {/* ステップ間の接続線（モバイル: 細め） */}
                {index < totalSteps - 1 && (
                  <div
                    className={cn('flex-1 h-0.5 mx-1 transition-colors', {
                      'bg-green-500': completedSteps.includes(step),
                      'bg-gray-300': !completedSteps.includes(step),
                    })}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* デスクトップ用: 詳細なステップインジケーター */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            const isClickable = isStepClickable(step);

            return (
              <React.Fragment key={step}>
                {/* ステップ番号/アイコン */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleStepClick(step)}
                    disabled={!isClickable}
                    className={cn(
                      'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                      {
                        // 完了したステップ
                        'bg-green-500 border-green-500 text-white cursor-pointer hover:bg-green-600':
                          status === 'completed',
                        // 現在のステップ
                        'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-200':
                          status === 'current',
                        // 未完了のステップ
                        'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed':
                          status === 'upcoming',
                      }
                    )}
                    aria-label={`ステップ ${step}`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step}</span>
                    )}
                  </button>
                  {/* ステップラベル */}
                  <span
                    className={cn('mt-2 text-xs font-medium', {
                      'text-gray-900': status === 'current',
                      'text-green-600': status === 'completed',
                      'text-gray-400': status === 'upcoming',
                    })}
                  >
                    ステップ{step}
                  </span>
                </div>

                {/* ステップ間の接続線 */}
                {index < totalSteps - 1 && (
                  <div
                    className={cn('flex-1 h-0.5 mx-2 transition-colors', {
                      'bg-green-500': completedSteps.includes(step),
                      'bg-gray-300': !completedSteps.includes(step),
                    })}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

