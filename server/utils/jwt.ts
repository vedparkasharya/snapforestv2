import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'snapforestv2_jwt_secret_key_2024';

export interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
