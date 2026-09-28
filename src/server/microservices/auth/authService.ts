// Identity & Authentication Microservice
// Port 4001 equivalent - Manages user credentials, password hashing, and token issuance

import { Router, Request, Response } from 'express';
import { db, hashPassword, verifyPassword, DbUser } from '../../db.ts';
import { signToken, verifyToken, requireAuth, AuthenticatedRequest } from '../../auth.ts';
import { eventBus } from '../../events/eventBus.ts';

export const authMicroservice = Router();

// POST /register
authMicroservice.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required.' },
    });
    return;
  }

  if (password.length < 6) {
    res.status(422).json({
      success: false,
      error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' },
    });
    return;
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(409).json({
      success: false,
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists.' },
    });
    return;
  }

  const now = new Date().toISOString();
  const newUser: DbUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: email.toLowerCase().trim(),
    name: name.trim(),
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    passwordHash: hashPassword(password),
    role: 'USER',
    createdAt: now,
    updatedAt: now,
  };

  const accessToken = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });
  const refreshToken = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role }, 30 * 24 * 3600 * 1000);
  newUser.refreshToken = refreshToken;

  db.users.push(newUser);

  // Publish event to EventBus for downstream Analytics & Progress services
  eventBus.publish({
    id: `evt_reg_${Date.now()}`,
    type: 'AUTH_USER_REGISTERED',
    sourceService: 'auth-service',
    timestamp: now,
    payload: {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    },
  });
});

// POST /login
authMicroservice.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
    });
    return;
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
    return;
  }

  const accessToken = signToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = signToken({ userId: user.id, email: user.email, role: user.role }, 30 * 24 * 3600 * 1000);
  user.refreshToken = refreshToken;

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    },
  });
});

// POST /refresh
authMicroservice.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({
      success: false,
      error: { code: 'TOKEN_REQUIRED', message: 'Refresh token is required.' },
    });
    return;
  }

  const payload = verifyToken(refreshToken);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired. Please log in again.' },
    });
    return;
  }

  const user = db.users.find((u) => u.id === payload.userId);
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401).json({
      success: false,
      error: { code: 'REFRESH_TOKEN_REVOKED', message: 'Refresh token has been revoked.' },
    });
    return;
  }

  const newAccessToken = signToken({ userId: user.id, email: user.email, role: user.role });
  const newRefreshToken = signToken({ userId: user.id, email: user.email, role: user.role }, 30 * 24 * 3600 * 1000);
  user.refreshToken = newRefreshToken;

  res.json({
    success: true,
    data: {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      },
    },
  });
});

// POST /logout
authMicroservice.post('/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    req.user.refreshToken = undefined;
  }
  res.json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
});

// GET /me
authMicroservice.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
});
