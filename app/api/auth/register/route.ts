import { db } from '../../../../src/db';
import { users } from '../../../../src/db/schema/user';
import { eq } from 'drizzle-orm';
import { createHash, randomUUID } from 'crypto';
import type { RegisterRequestBody } from '@/types/user';

export async function POST(request: Request) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if email already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return new Response(JSON.stringify({ message: 'Email already registered' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Simple SHA256 hash for password (use bcrypt in production)
    const passwordHash = createHash('sha256').update(password).digest('hex');

    const id = randomUUID();
    await db.insert(users).values({
      id,
      name,
      email,
      password: passwordHash,
      phone: phone ?? null,
    }).execute();

    // Build response object using the generated ID and provided fields
    const inserted = [{ id, name, email }];

    return new Response(JSON.stringify(inserted[0]), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
