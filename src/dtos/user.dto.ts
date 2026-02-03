import z, { email } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick(
    {
        fullName: true,
        phoneNumber: true,
        gender: true,
        profilePicture: true,
        bio: true,
        email: true,
        username: true,
        password: true,
        role: true,
        // dateOfBirth: true, 
        imageUrl: true,
    }
).extend({
    confirmPassword: z.string().min(6).optional()
}). refine( // extra validation for confirmPassword
    (data) => data.password === data.confirmPassword,
    {
        message: "Password do not match",
        path: ["confirmPassword"]
    }

)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email : z.email(),
    password: z.string().min(6)
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial(); // all attributes optional
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;