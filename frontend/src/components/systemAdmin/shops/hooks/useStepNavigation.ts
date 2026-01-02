/**
 * ステップ遷移ロジックフック
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseStepNavigationReturn {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  canGoNext: boolean;
  canGoBack: boolean;
  goToStep: (step: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  markStepCompleted: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
}

/**
 * ステップ遷移ロジックを管理するフック
 * 
 * 次のステップへ進む、前のステップに戻る、完了したステップの記録を行います。
 * 
 * @param totalSteps 総ステップ数
 * @param initialStep 初期ステップ（デフォルト: 1）
 * 
 * @example
 * ```tsx
 * const {
 *   currentStep,
 *   goToNext,
 *   goToPrevious,
 *   markStepCompleted
 * } = useStepNavigation(6);
 * ```
 */
export function useStepNavigation(
  totalSteps: number,
  initialStep: number = 1
): UseStepNavigationReturn {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // 次のステップに進めるか
  const canGoNext = useMemo(
    () => currentStep < totalSteps,
    [currentStep, totalSteps]
  );

  // 前のステップに戻れるか
  const canGoBack = useMemo(() => currentStep > 1, [currentStep]);

  // 特定のステップに移動
  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  // 次のステップへ進む
  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentStep((prev) => {
        const next = prev + 1;
        // 現在のステップを完了として記録
        setCompletedSteps((prevCompleted) => {
          if (!prevCompleted.includes(prev)) {
            return [...prevCompleted, prev];
          }
          return prevCompleted;
        });
        return next;
      });
    }
  }, [canGoNext]);

  // 前のステップに戻る
  const goToPrevious = useCallback(() => {
    if (canGoBack) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [canGoBack]);

  // ステップを完了として記録
  const markStepCompleted = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCompletedSteps((prev) => {
        if (!prev.includes(step)) {
          return [...prev, step].sort((a, b) => a - b);
        }
        return prev;
      });
    }
  }, [totalSteps]);

  // ステップが完了しているか
  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.includes(step);
    },
    [completedSteps]
  );

  return {
    currentStep,
    totalSteps,
    completedSteps,
    canGoNext,
    canGoBack,
    goToStep,
    goToNext,
    goToPrevious,
    markStepCompleted,
    isStepCompleted,
  };
}

