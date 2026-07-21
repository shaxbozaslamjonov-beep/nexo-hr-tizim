import { jwtVerify, SignJWT } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export type AuthPayload = {
  id: string;
  email: string;
  role: string;
  companyId: string;
};

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as AuthPayload;
  } catch (error) {
    return null;
  }
}
