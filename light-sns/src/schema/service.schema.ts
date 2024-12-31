import { z } from 'zod';

export const postRequestSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  body: z.string().min(1, 'Post body cannot be empty')
});

export const timelineRequestSchema = z.object({
  limit: z.number().optional().default(200).transform(val => Math.min(val, 200))
});

export type PostRequest = z.infer<typeof postRequestSchema>;
export type TimelineRequest = z.infer<typeof timelineRequestSchema>;
