import z, { email } from 'zod';

export const UserSchema = z.object({
    email: z.email().min(5),
    password: z.string().min(5),
    username: z.string().min(3).max(30),
    fullName: z.string().optional(),
    phoneNumber: z.int(),
    // phoneNumber: z.string(),
    gender: z.enum(['male', 'female', 'other']),
    // gender: z.string(),
    // // additional fields
    // dateOfBirth: z.string().optional(),


    profilePicture: z.string().optional(),
    bio: z.string().max(160).optional(),
    role: z.enum(['user', 'admin']),
    // role: z.enum(['user', 'admin']).default('user'),
    // terms: z.boolean().refine((val) => val === true, {
    // message: "You must accept the terms",
    // }),

    imageUrl: z.string().optional(),
});

export type UserType = z.infer<typeof UserSchema>;