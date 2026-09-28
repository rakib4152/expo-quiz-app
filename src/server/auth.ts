// Authentication and Token utilities for Express REST API
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { db, DbUser } from './db.ts';

const JWT_SECRET = process.env.AUTH_SECRET || 'quizpulse_super_secret_jwt_key_2026';
const ACCESS_TOKEN_TTL = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

// Sign custom JWT-compliant compact token
export function signToken(payload: Omit<TokenPayload, 'exp'>, expiresInMs: number = ACCESS_TOKEN_TTL): string {
  const exp = Date.now() + expiresInMs;
  const data = JSON.stringify({ ...payload, exp });
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(base64Data).digest('base64url');
  return `${base64Data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(base64Data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(base64Data, 'base64url').toString('utf8')) as TokenPayload;
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: DbUser;
  userId?: string;
}

// Authentication middleware for protected endpoints
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is missing or malformed',
      },
    });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Your session has expired. Please refresh your token or log in again.',
      },
    });
    return;
  }

  const user = db.users.find((u) => u.id === payload.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'Account associated with token no longer exists.',
      },
    });
    return;
  }

  req.user = user;
  req.userId = user.id;
  next();
}

// Optional Auth middleware (e.g. for quiz listings where user personalized stats can be attached if logged in)
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      const user = db.users.find((u) => u.id === payload.userId);
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
  }
  next();
}
