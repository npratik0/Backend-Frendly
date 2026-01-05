import z, { email } from 'zod';

export const UserSchema = z.object({
    email: z.email().min(5),
    password: z.string().min(5),
    username: z.string().min(3).max(30),
    fullName: z.string().optional(),
    phoneNumber: z.int(),
    gender : z.enum(['male','female','other']),
    profilePicture: z.string().optional(),
    bio: z.string().max(160).optional(),
    role: z.enum(['user','admin']).default('user'),
});

export type UserType = z.infer<typeof UserSchema>;