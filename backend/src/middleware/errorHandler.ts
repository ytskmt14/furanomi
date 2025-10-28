import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.error('Error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

  // デフォルトのエラーレスポンス
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // データベースエラーの処理
  if (error.name === 'QueryResultError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // バリデーションエラーの処理
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
  }

  // JWT エラーの処理
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // 本番環境では詳細なエラー情報を隠す
  const response: any = {
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = error.stack;
    response.details = error;
  }

  res.status(statusCode).json(response);
};

// 非同期エラーハンドラー
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
