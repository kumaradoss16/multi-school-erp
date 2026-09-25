import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        schoolId: string;
        permissions: string[]; // Explicit RBAC claims
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-insecure-secret');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required and must not use a default value.');
}

if (process.env.NODE_ENV !== 'production') {
  console.warn('WARNING: Using insecure default JWT_SECRET for development.');
}

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: string; 
      role: string; 
      schoolId: string; 
      permissions: string[];
    };

    // Attach user profile, RBAC claims, and tenant scope to the request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      schoolId: decoded.schoolId,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};
