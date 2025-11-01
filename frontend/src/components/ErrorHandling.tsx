import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

// エラーバウンダリクラス
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 詳細なエラー情報をログに記録（本番環境でも確認可能）
    console.error('ErrorBoundary caught an error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // 本番環境でもエラーを外部サービスに送信する場合はここに追加
    // 例: Sentry, LogRocket, など
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// デフォルトエラーフォールバック
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900">エラーが発生しました</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-mono break-words">
                {error.message || '予期しないエラーが発生しました'}
              </p>
              {import.meta.env.DEV && error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 cursor-pointer">詳細を表示</summary>
                  <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button onClick={resetError} className="flex-1">
              再試行
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} 
              className="flex-1"
            >
              ページを再読み込み
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 一般的なエラー表示コンポーネント
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'エラーが発生しました',
  message,
  onRetry,
  variant = 'error'
}) => {
  const variantStyles = {
    error: {
      icon: '❌',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bgColor} ${styles.borderColor} border rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <div className={`text-xl ${styles.iconColor}`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${styles.textColor} mb-1`}>
            {title}
          </h3>
          <p className={`text-sm ${styles.textColor}`}>
            {message}
          </p>
          {onRetry && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              className="mt-3"
            >
              再試行
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ネットワークエラー用コンポーネント
interface NetworkErrorProps {
  onRetry: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({ onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📡</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        ネットワークエラー
      </h3>
      <p className="text-gray-600 mb-6">
        インターネット接続を確認して、もう一度お試しください。
      </p>
      <Button onClick={onRetry}>
        再試行
      </Button>
    </div>
  );
};

// データなし状態用コンポーネント
interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'データが見つかりません',
  message = '条件に一致する店舗がありません。',
  icon = '🏪',
  action
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

// 検索結果なし用コンポーネント
export const NoSearchResults: React.FC<{ onClearFilters: () => void }> = ({ 
  onClearFilters 
}) => {
  return (
    <EmptyState
      title="検索結果が見つかりません"
      message="検索条件に一致する店舗がありません。フィルターを変更してお試しください。"
      icon="🔍"
      action={{
        label: 'フィルターをクリア',
        onClick: onClearFilters
      }}
    />
  );
};
