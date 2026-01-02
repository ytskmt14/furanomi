/**
 * 店舗登録マルチステップフローコンポーネント
 * ステップバイステップの店舗登録フォームを管理
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { StepIndicator } from '../StepIndicator';
import { ErrorMessage } from '../../ErrorHandling';
import { useShopOnboardingForm } from './hooks/useShopOnboardingForm';
import { useStepNavigation } from './hooks/useStepNavigation';
import { validateStep, scrollToFirstError } from './utils/validation';
import { ShopBasicInfoStep } from './steps/ShopBasicInfoStep';
import { AddressLocationStep } from './steps/AddressLocationStep';
import { ShopManagerStep } from './steps/ShopManagerStep';
import { BusinessHoursStep } from './steps/BusinessHoursStep';
import { ImageUploadStep } from './steps/ImageUploadStep';
import { PreviewStep } from './steps/PreviewStep';
import { apiService } from '@/services/api';
import { Shop, ShopManager } from '@/types/shop';

export interface ShopOnboardingFlowProps {
  /** モーダルが開いているか */
  isOpen: boolean;
  /** モーダルを閉じるコールバック */
  onClose: () => void;
  /** 登録完了時のコールバック */
  onComplete: (shop: Shop) => void;
  /** 利用可能な店舗管理者リスト */
  shopManagers: ShopManager[];
}

const TOTAL_STEPS = 6;

/**
 * 店舗登録マルチステップフローコンポーネント
 * 
 * マルチステップの店舗登録フローを管理し、各ステップ間の遷移と状態管理を行います。
 * 
 * @example
 * ```tsx
 * <ShopOnboardingFlow
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onComplete={handleComplete}
 *   shopManagers={shopManagers}
 * />
 * ```
 */
export const ShopOnboardingFlow: React.FC<ShopOnboardingFlowProps> = ({
  isOpen,
  onClose,
  onComplete,
  shopManagers,
}) => {
  const {
    formData,
    errors,
    updateField,
    setErrors,
    clearErrors,
    resetForm,
  } = useShopOnboardingForm();

  const {
    currentStep,
    completedSteps,
    canGoBack,
    goToStep,
    goToNext,
    goToPrevious,
    markStepCompleted,
  } = useStepNavigation(TOTAL_STEPS);

  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdShop, setCreatedShop] = useState<Shop | null>(null);
  const [networkError, setNetworkError] = useState<Error | null>(null);

  // モーダルが閉じられた時にフォームをリセット
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setCreatedShop(null);
      setIsSubmitting(false);
      setIsCreatingManager(false);
      setNetworkError(null);
    }
  }, [isOpen, resetForm]);

  // ステップクリックハンドラ（完了したステップのみ）
  const handleStepClick = (step: number) => {
    if (completedSteps.includes(step)) {
      goToStep(step);
      clearErrors();
    }
  };

  // 次のステップへ進む（バリデーション付き）
  const handleNext = async () => {
    // 現在のステップのバリデーション
    const stepErrors = validateStep(currentStep, formData);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      scrollToFirstError(stepErrors);
      return;
    }

    // ステップ3（店舗管理者）の場合、新規作成モードならAPI呼び出し
    if (currentStep === 3 && formData.managerMode === 'new' && formData.newManagerData) {
      setIsCreatingManager(true);
      try {
        const newManager = await apiService.createShopManager({
          username: formData.newManagerData.username,
          email: formData.newManagerData.email,
          password: formData.newManagerData.password,
          first_name: formData.newManagerData.firstName,
          last_name: formData.newManagerData.lastName,
          phone: formData.newManagerData.phone || null,
          is_active: true,
        });
        
        // 作成されたマネージャーのIDを設定
        updateField('shop_manager_id', newManager.id);
        updateField('managerMode', 'existing');
      } catch (error: any) {
        setErrors({
          shop_manager_id: error.message || '店舗管理者の作成に失敗しました',
        });
        scrollToFirstError({ shop_manager_id: error.message || '店舗管理者の作成に失敗しました' });
        setIsCreatingManager(false);
        return;
      } finally {
        setIsCreatingManager(false);
      }
    }

    // バリデーション成功時のみ次のステップへ
    clearErrors();
    goToNext();
  };

  // 前のステップに戻る
  const handleBack = () => {
    clearErrors();
    goToPrevious();
  };

  // ステップ編集（該当ステップに戻る）
  const handleEdit = (step: number) => {
    clearErrors();
    goToStep(step);
  };

  // ネットワークエラーの判定
  const isNetworkError = (error: any): boolean => {
    if (!error) return false;
    // ネットワークエラーの判定
    if (error.message?.includes('ネットワーク') || 
        error.message?.includes('接続') ||
        error.message?.includes('fetch') ||
        error.message?.includes('Network') ||
        error.code === 'NETWORK_ERROR' ||
        error.name === 'NetworkError') {
      return true;
    }
    // HTTPステータスコードによる判定
    if (error.status === 0 || error.status >= 500) {
      return true;
    }
    return false;
  };

  // エラーメッセージの取得（具体的で理解しやすいメッセージ）
  const getErrorMessage = (error: any): string => {
    if (!error) return 'エラーが発生しました';
    
    // ネットワークエラー
    if (isNetworkError(error)) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認して、もう一度お試しください。';
    }
    
    // APIエラーレスポンス
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // エラーメッセージ
    if (error.message) {
      return error.message;
    }
    
    return 'エラーが発生しました。もう一度お試しください。';
  };

  // 店舗作成・公開処理
  const handlePublish = async () => {
    setIsSubmitting(true);
    setErrors({});
    setNetworkError(null);

    try {
      // フォームデータをAPI形式に変換
      const shopData = {
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        postal_code: formData.postalCode || null,
        formatted_address: formData.formattedAddress || null,
        place_id: formData.placeId || null,
        phone: formData.phone || null,
        email: formData.email || null,
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude,
        business_hours: formData.business_hours,
        image_url: formData.image_url || null,
        shop_manager_id: formData.shop_manager_id,
        is_active: false, // 最初は非アクティブで作成
      };

      // 店舗を作成
      const createdShopData = await apiService.createShop(shopData);

      // 公開状態に更新
      await apiService.updateShopBySystemAdmin(createdShopData.id, {
        is_active: true,
      });

      // 作成された店舗情報を取得
      const shop = await apiService.getShop(createdShopData.id);
      setCreatedShop(shop);
      markStepCompleted(6);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      
      if (isNetworkError(error)) {
        setNetworkError(error);
      }
      
      setErrors({
        submit: errorMessage,
      });
      setIsSubmitting(false);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下書き保存処理
  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setErrors({});
    setNetworkError(null);

    try {
      // フォームデータをAPI形式に変換
      const shopData = {
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        postal_code: formData.postalCode || null,
        formatted_address: formData.formattedAddress || null,
        place_id: formData.placeId || null,
        phone: formData.phone || null,
        email: formData.email || null,
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude,
        business_hours: formData.business_hours,
        image_url: formData.image_url || null,
        shop_manager_id: formData.shop_manager_id,
        is_active: false, // 非アクティブのまま保存
      };

      // 店舗を作成（非アクティブ）
      const createdShopData = await apiService.createShop(shopData);

      // 作成された店舗情報を取得
      const shop = await apiService.getShop(createdShopData.id);
      setCreatedShop(shop);
      markStepCompleted(6);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      
      if (isNetworkError(error)) {
        setNetworkError(error);
      }
      
      setErrors({
        submit: errorMessage,
      });
      setIsSubmitting(false);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 再試行処理
  const handleRetry = () => {
    setNetworkError(null);
    setErrors({});
    // 現在のステップに応じて再試行
    if (currentStep === 6) {
      // 公開前確認ステップの場合、公開または下書き保存を再試行
      // ユーザーが再度ボタンをクリックする必要があるため、エラーをクリアするだけ
    }
  };

  // 登録完了処理
  const handleComplete = () => {
    if (createdShop) {
      onComplete(createdShop);
      setCreatedShop(null);
      resetForm();
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center p-0 md:p-4 z-50">
      <div className="bg-white rounded-t-lg md:rounded-lg w-full md:max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* ヘッダー */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              新規店舗登録
            </h2>
            
            {/* ステップインジケーター */}
            <StepIndicator
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* グローバルエラーメッセージ */}
          {errors.submit && (
            <div className="mb-4">
              <ErrorMessage
                title="エラーが発生しました"
                message={errors.submit}
                onRetry={networkError ? handleRetry : undefined}
                variant="error"
              />
            </div>
          )}

          {/* ネットワークエラー */}
          {networkError && (
            <div className="mb-4">
              <ErrorMessage
                title="ネットワークエラー"
                message="インターネット接続を確認して、もう一度お試しください。"
                onRetry={handleRetry}
                variant="error"
              />
            </div>
          )}

          {/* ヘルプリンク */}
          <div className="mb-4 flex items-center justify-end">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // ヘルプページへのリンク（将来実装）
                alert('ヘルプページは準備中です。サポートが必要な場合は管理者にお問い合わせください。');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4" />
              ヘルプ・サポート
            </a>
          </div>

          {/* ステップコンテンツ */}
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <ShopBasicInfoStep
                formData={{
                  name: formData.name,
                  description: formData.description,
                  category: formData.category,
                }}
                onChange={updateField}
                errors={errors}
              />
            )}
            {currentStep === 2 && (
              <AddressLocationStep
                formData={{
                  postalCode: formData.postalCode,
                  address: formData.address,
                  formattedAddress: formData.formattedAddress,
                  placeId: formData.placeId,
                  latitude: formData.latitude,
                  longitude: formData.longitude,
                  phone: formData.phone,
                  email: formData.email,
                }}
                onChange={updateField}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <ShopManagerStep
                formData={{
                  shop_manager_id: formData.shop_manager_id,
                  newManagerData: formData.newManagerData,
                  managerMode: formData.managerMode,
                }}
                shopManagers={shopManagers}
                onChange={updateField}
                errors={errors}
              />
            )}
            {currentStep === 4 && (
              <BusinessHoursStep
                formData={{
                  business_hours: formData.business_hours,
                }}
                onChange={updateField}
                errors={errors}
              />
            )}
            {currentStep === 5 && (
              <ImageUploadStep
                formData={{
                  image_url: formData.image_url,
                }}
                onChange={updateField}
                errors={errors}
              />
            )}
            {currentStep > 5 && currentStep < 6 && (
              <div className="text-center py-20 text-gray-500">
                <p>ステップ {currentStep} のコンテンツ</p>
                <p className="text-sm mt-2">
                  （各ステップコンポーネントは後続のタスクで実装）
                </p>
              </div>
            )}
            {currentStep === 6 && !createdShop && (
              <PreviewStep
                formData={formData}
                shopManagers={shopManagers}
                errors={errors}
                onEdit={handleEdit}
                onPublish={handlePublish}
                onSaveDraft={handleSaveDraft}
                isSubmitting={isSubmitting}
              />
            )}
            {currentStep === 6 && createdShop && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {createdShop.is_active ? '店舗を公開しました' : '店舗を登録しました'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {createdShop.is_active
                      ? '店舗は利用者アプリで表示されています。'
                      : '店舗は下書きとして保存されました。後で公開できます。'}
                  </p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      店舗名: {createdShop.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      店舗ID: {createdShop.id}
                    </p>
                  </div>

                  {createdShop.is_active && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        <strong>利用者アプリでの表示:</strong>
                      </p>
                      <p className="text-xs text-blue-600">
                        店舗は利用者アプリで表示されています。店舗管理画面から確認できます。
                      </p>
                    </div>
                  )}

                  {!createdShop.is_active && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 mb-2">
                        <strong>次のステップ:</strong>
                      </p>
                      <p className="text-xs text-amber-700">
                        店舗管理画面から店舗を編集し、準備ができたら公開してください。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* フッター（ナビゲーションボタン）- モバイルフレンドリー */}
        {currentStep < TOTAL_STEPS && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 md:border-t-0 md:pt-6 md:mt-6 shadow-lg md:shadow-none">
            <div className="flex gap-3 md:justify-between md:flex-row flex-col">
              <Button
                type="button"
                variant="outline"
                onClick={canGoBack ? handleBack : onClose}
                className="w-full md:w-auto py-3 md:py-2 text-base md:text-sm font-medium touch-manipulation"
              >
                {canGoBack ? '戻る' : 'キャンセル'}
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isCreatingManager}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-2 text-base md:text-sm font-medium touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingManager ? '作成中...' : '次へ'}
              </Button>
            </div>
          </div>
        )}
        {currentStep === TOTAL_STEPS && createdShop && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 md:border-t-0 md:pt-6 md:mt-6 shadow-lg md:shadow-none">
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handleComplete}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 md:py-2 text-base md:text-sm font-medium touch-manipulation"
              >
                完了
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

