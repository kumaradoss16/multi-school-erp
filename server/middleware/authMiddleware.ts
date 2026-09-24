import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        school_id: string; // Tenant scope
        permissions: string[];
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-replace-in-production';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      id: string; 
      role: string; 
      school_id: string; 
      permissions: string[];
    };

    // Attach user profile, RBAC claims, and tenant scope to the request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      school_id: decoded.school_id,
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
