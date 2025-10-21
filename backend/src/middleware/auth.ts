import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';

// JWT ペイロードの型定義
export interface JWTPayload {
  userId: string;
  username: string;
  role: 'shop_manager' | 'system_admin';
  shopId?: string; // 店舗管理者の場合のみ
}

// 認証ミドルウェア
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // JWT の検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
    
    // ユーザーの存在確認
    const user = await getUserById(decoded.userId, decoded.role);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    // リクエストオブジェクトにユーザー情報を追加
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      shopId: decoded.shopId
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 店舗管理者のみアクセス可能
export const requireShopManager = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'shop_manager') {
    return res.status(403).json({ error: 'Shop manager access required' });
  }
  next();
};

// システム管理者のみアクセス可能
export const requireSystemAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'system_admin') {
    return res.status(403).json({ error: 'System admin access required' });
  }
  next();
};

// ユーザー情報取得ヘルパー
async function getUserById(userId: string, role: string) {
  try {
    if (role === 'shop_manager') {
      const result = await db.query(
        'SELECT id, username, email, is_active FROM shop_managers WHERE id = $1',
        [userId]
      );
      return result.rows[0];
    } else if (role === 'system_admin') {
      const result = await db.query(
        'SELECT id, username, email, is_active FROM system_admins WHERE id = $1',
        [userId]
      );
      return result.rows[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// リクエストオブジェクトの型拡張
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: 'shop_manager' | 'system_admin';
        shopId?: string;
      };
    }
  }
}
