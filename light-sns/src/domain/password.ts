import { createHash } from 'crypto';

export function hashPassword(password: string, salt: string): string {
  return createHash('sha256')
    .update(password + salt)
    .digest('hex');
}

export function generateSalt(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function verifyPassword(plainPassword: string, hashedPassword: string, salt: string): boolean {
  return hashPassword(plainPassword, salt) === hashedPassword;
}
