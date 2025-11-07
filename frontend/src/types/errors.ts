/**
 * API・ネットワークエラーの型定義
 */

/**
 * APIエラーのコード定義
 */
export const API_ERROR_CODES = {
  // ネットワークエラー
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // 認証エラー
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // バリデーションエラー
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',

  // サーバーエラー
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',

  // その他
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

/**
 * APIエラーの基底クラス
 */
export class ApiError extends Error {
  public name: string = 'ApiError';
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number = 0,
    code: ApiErrorCode = 'UNKNOWN_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;

    // プロトタイプチェーンを正しく設定（ES6 transpilation対策）
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * ユーザー向けメッセージを取得
   */
  public getUserMessage(): string {
    switch (this.code) {
      case 'NETWORK_ERROR':
        return 'ネットワークに接続できません。インターネット接続を確認してください。';
      case 'TIMEOUT_ERROR':
        return 'リクエストがタイムアウトしました。しばらく待ってから再度お試しください。';
      case 'UNAUTHORIZED':
        return 'ログインが必要です。';
      case 'FORBIDDEN':
        return 'このアクションを実行する権限がありません。';
      case 'INVALID_TOKEN':
        return 'セッションが無効です。再度ログインしてください。';
      case 'VALIDATION_ERROR':
        return '入力値に問題があります。';
      case 'NOT_FOUND':
        return 'リソースが見つかりません。';
      case 'CONFLICT':
        return 'リソースが既に存在します。';
      case 'INTERNAL_SERVER_ERROR':
        return 'サーバーでエラーが発生しました。しばらく待ってから再度お試しください。';
      default:
        return this.message || 'エラーが発生しました。';
    }
  }
}

/**
 * ネットワークエラー
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'ネットワークエラー') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * タイムアウトエラー
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'リクエストタイムアウト') {
    super(message, 0, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'ログインが必要です') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * 認可エラー
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = '権限がありません') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ApiError {
  constructor(
    message: string = '入力値が無効です',
    details?: Record<string, unknown>
  ) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * NotFoundエラー
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflictエラー
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'リソースが既に存在します') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * サーバーエラー
 */
export class ServerError extends ApiError {
  constructor(
    message: string = 'サーバーエラーが発生しました',
    status: number = 500
  ) {
    super(message, status, 'INTERNAL_SERVER_ERROR');
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * エラーから適切なApiErrorインスタンスを作成
 */
export const createApiError = (
  error: unknown,
  defaultMessage: string = 'エラーが発生しました'
): ApiError => {
  // 既にApiErrorの場合はそのまま返す
  if (error instanceof ApiError) {
    return error;
  }

  // Fetch APIのエラー
  if (error instanceof TypeError) {
    if (error.message.includes('fetch')) {
      return new NetworkError('ネットワーク接続エラー');
    }
  }

  // レスポンスオブジェクトがある場合
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    const { status, message, code, details } = error as any;
    return new ApiError(
      message || defaultMessage,
      status || 0,
      code || 'UNKNOWN_ERROR',
      details
    );
  }

  // エラーメッセージが文字列の場合
  if (typeof error === 'string') {
    return new ApiError(error, 0, 'UNKNOWN_ERROR');
  }

  // デフォルト
  return new ApiError(defaultMessage, 0, 'UNKNOWN_ERROR');
};

/**
 * エラーの型ガード
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError;
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};
