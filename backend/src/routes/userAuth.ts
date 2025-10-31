import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUserToken } from '../middleware/auth';

const router = express.Router();

// JWT Payload型定義
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

// ユーザー登録
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;

  // バリデーション
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // メールアドレスの重複チェック
  const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingUser.rows.length > 0) {
    return res.status(400).json({ error: 'This email is already registered' });
  }

  // パスワードのハッシュ化
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // ユーザー作成
  const result = await db.query(
    'INSERT INTO users (email, password_hash, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name, phone, created_at',
    [email, passwordHash, name, phone || null]
  );

  const user = result.rows[0];

  // JWT トークンの生成
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: 'user'
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

  res.status(201).json({
    message: 'Registration successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone
    }
  });
}));

// ログイン
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // ユーザーの検索
  const result = await db.query(
    'SELECT id, email, password_hash, name, phone FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = result.rows[0];

  // パスワードの検証
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // JWT トークンの生成
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: 'user'
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
  await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone
    }
  });
}));

// ログアウト
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});

// プロフィール更新（ニックネーム/電話）
router.put('/profile', authenticateUserToken, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { name } = req.body;

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name is required' });
  }

  const result = await db.query(
    'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, phone',
    [name.trim(), userId]
  );

  res.json({
    message: 'Profile updated',
    user: result.rows[0]
  });
}));

// 現在のユーザー情報取得
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  // JWT トークンからユーザーID取得
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temp-development-secret') as JWTPayload;

    // ユーザー情報を取得
    const result = await db.query(
      'SELECT id, email, name, phone, last_login_at, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}));

// パスワードリセット要求
router.post('/password-reset/request', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // ユーザー検索
  const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);

  // セキュリティ上の理由で、ユーザーが存在しない場合でも成功レスポンスを返す
  if (result.rows.length === 0) {
    return res.json({ message: 'If the email exists, a password reset link has been sent' });
  }

  // リセットトークンの生成
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  const resetTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後

  // トークンを保存
  await db.query(
    'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
    [resetToken, resetTokenExpiresAt, result.rows[0].id]
  );

  // TODO: メール送信実装（Phase 3以降）
  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.json({ message: 'If the email exists, a password reset link has been sent' });
}));

// パスワードリセット確認
router.post('/password-reset/confirm', asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // トークンの検証
  const result = await db.query(
    'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > CURRENT_TIMESTAMP',
    [token]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const userId = result.rows[0].id;

  // パスワードのハッシュ化
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  // パスワード更新
  await db.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
    [passwordHash, userId]
  );

  res.json({ message: 'Password reset successful' });
}));

export { router as userAuthRoutes };
