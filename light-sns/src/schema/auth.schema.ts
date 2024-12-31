import { z } from 'zod';

export const loginAuthrizationInfomation = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required')
});

export const signupAuthrizationInfomation = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  user_name: z.string().min(1, 'User name is required'),
  password: z.string().min(1, 'Password is required')
});

export type LoginAuthorizationInfo = z.infer<typeof loginAuthrizationInfomation>;
export type SignupAuthorizationInfo = z.infer<typeof signupAuthrizationInfomation>;
