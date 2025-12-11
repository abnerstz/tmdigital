import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be defined in environment variables and be at least 32 characters long',
    );
  }
  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
});
