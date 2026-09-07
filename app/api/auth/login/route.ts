import { db } from '../../../../src/db';
import { users } from '../../../../src/db/schema/user';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import type { LoginRequestBody } from '@/types/user';

export async function POST(request: Request) {
  try {
    const body: LoginRequestBody = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Missing email or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find the user by email
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length === 0) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = existing[0];
    // Verify password (same SHA256 hash method as registration)
    const passwordHash = createHash('sha256').update(password).digest('hex');
    if (user.password !== passwordHash) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return minimal user info (add JWT / session handling here if needed)
    const responseBody = { id: user.id, name: user.name, email: user.email };
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
