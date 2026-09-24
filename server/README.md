# SchoolERP Backend Middleware

## Authentication & Tenant Scoping Middleware

The `authenticateAndScope` middleware (`server/middleware/auth.ts`) handles JWT validation and tenant scoping.

### Usage Pattern

When defining API routes, apply the middleware to ensure the request is authenticated and the database query is scoped to the school ID provided in the JWT:

```typescript
import express from 'express';
import { authenticateAndScope } from './middleware/auth';
import { db } from './db'; // Assume Drizzle or similar ORM

const router = express.Router();

router.get('/students', authenticateAndScope, async (req, res) => {
  // The middleware ensures req.user.schoolId is present.
  // ALWAYS scope queries by schoolId to prevent cross-tenant leaks.
  const students = await db.select()
    .from(studentsTable)
    .where(eq(studentsTable.schoolId, req.user!.schoolId));

  res.json(students);
});
```

### Critical Security Reminder
**Never** trust `schoolId` passed in the request body or query parameters for authorization. Always derive the tenant scope (`schoolId`) from the validated `req.user` object populated by `authenticateAndScope`.
