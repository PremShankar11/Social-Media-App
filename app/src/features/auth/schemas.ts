import { z } from 'zod'

export const authSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be 20 characters or less.')
    .regex(
      /^[a-z0-9_]+$/,
      'Username can only use lowercase letters, numbers, or underscores.',
    ),
  displayName: z.string().trim().min(1, 'Display name is required.'),
  bio: z.string().trim().max(160, 'Bio must be 160 characters or less.'),
})
