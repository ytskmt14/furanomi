import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, JWTPayload } from '../middleware/auth';

const router = express.Router();

// 店舗管理者ログイン
router.post('/shop-manager/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // 店舗管理者の検索
  const result = await db.query(
    'SELECT id, username, email, password_hash, first_name, last_name, is_active FROM shop_managers WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return res.status(401).json({ error: 'Account is deactivated' });
  }

  // パスワードの検証
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 店舗情報の取得
  const shopResult = await db.query(
    'SELECT id, name FROM shops WHERE shop_manager_id = $1',
    [user.id]
  );

  // JWT トークンの生成
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: 'shop_manager',
    shopId: shopResult.rows[0]?.id
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'temp-development-secret', {
    expiresIn: '24h'
  });

  // HTTP-only クッキーにトークンを設定
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24時間
  });

  // 最終ログイン時刻の更新
  await db.query(
    'UPDATE shop_managers SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      shop: shopResult.rows[0] ? {
        id: shopResult.rows[0].id,
        name: shopResult.rows[0].name
      } : null
    }
  });
}));

// システム管理者ログイン
router.post('/system-admin/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // システム管理者の検索
  const result = await db.query(
    'SELECT id, username, email, password_hash, first_name, last_name, is_active FROM system_admins WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = result.rows[0];

  if (!user.is_active) {
    return res.status(401).json({ error: 'Account is deactivated' });
  }

  // パスワードの検証
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // JWT トークンの生成
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: 'system_admin'
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET || 'temp-development-secret', {
    expiresIn: '24h'
  });

  // HTTP-only クッキーにトークンを設定
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24時間
  });

  // 最終ログイン時刻の更新
  await db.query(
    'UPDATE system_admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    }
  });
}));

// ログアウト
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// 現在のユーザー情報取得
router.get('/me', authenticateToken, asyncHandler(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user!;

  let user;
  if (role === 'shop_manager') {
    const result = await db.query(
      'SELECT id, username, email, first_name, last_name, phone, is_active, last_login_at FROM shop_managers WHERE id = $1',
      [userId]
    );
    user = result.rows[0];

    // 店舗情報も取得
    const shopResult = await db.query(
      'SELECT id, name, address, phone, email, category FROM shops WHERE shop_manager_id = $1',
      [userId]
    );
    user.shop = shopResult.rows[0] || null;
  } else {
    const result = await db.query(
      'SELECT id, username, email, first_name, last_name, is_active, last_login_at FROM system_admins WHERE id = $1',
      [userId]
    );
    user = result.rows[0];
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role,
      ...(user.phone && { phone: user.phone }),
      ...(user.shop && { shop: user.shop })
    }
  });
}));

// トークン検証
router.get('/verify', authenticateToken, (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: req.user
  });
});

export { router as authRoutes };
