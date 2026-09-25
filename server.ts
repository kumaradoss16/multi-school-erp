import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import { db } from './server/db';
import { users, students, staff, classes } from './server/db/schema';
import { eq } from 'drizzle-orm';
import argon2 from 'argon2';
import { authenticationMiddleware } from './server/middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-insecure-secret');

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}

if (process.env.NODE_ENV !== 'production') {
  console.warn('WARNING: Using insecure default JWT_SECRET for development.');
}

async function startServer() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use('/auth', limiter);

  app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, school_id: user.schoolId, permissions: user.permissions },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
  });

  app.get('/api/students', authenticationMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const studentList = await db.select().from(students)
        .where(eq(students.schoolId, req.user.schoolId));
        
    res.json(studentList);
  });

  app.get('/api/staff', authenticationMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const staffList = await db.select().from(staff)
        .where(eq(staff.schoolId, req.user.schoolId));
        
    res.json(staffList);
  });

  app.get('/api/classes', authenticationMiddleware, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    
    const classList = await db.select().from(classes)
        .where(eq(classes.schoolId, req.user.schoolId));
        
    res.json(classList);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

startServer().catch(console.error);
