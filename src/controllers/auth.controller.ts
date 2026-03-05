import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import z, { success } from "zod";
import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { parse } from "path";

let userService = new UserService();

export class AuthController{
    async register(req: Request, res: Response){
        try{
            //validate request body
            const parsedData = CreateUserDTO.safeParse(req.body);
            if(!parsedData.success){ // validation failed
                return res.status(400).json(
                    {
                        success: false, message: z.prettifyError(parsedData.error)
                    }
                )
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await userService.createUser(userData);
            return res.status(201).json({
                success: true, message: "User Created", data: newUser
            });
            console.log(req.body);
            
        }catch(error: Error | any){ // exception handling
            return res.status(500).json(
                {success: false, message: error.message || "Internal Service Error"}
            )
        }
    }
    async login(req: Request, res: Response){
        try{
            const parsedData = LoginUserDTO.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            const loginData: LoginUserDTO = parsedData.data;
            const {token, user} = await userService.loginUser(loginData);
            return res.status(200).json(
                {success: true, message: "Login successful", data: user, token}
            );
        }catch(error: Error | any){
            return res.status(error.statusCode ?? 500).json(
                {success: false, message: error.message || "Itenal Server Error"}
            )
        }
    }
    
    // Sprint 5 additional
    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            if (!userId) {
                return res.status(400).json(
                    { success: false, message: "User Id Not found" }
                );
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: user, message: "User profile fetched successfully" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    // async updateProfile(req: Request, res: Response) {
    //     try {
    //         const userId = req.user?._id;
    //         if (!userId) {
    //             return res.status(400).json(
    //                 { success: false, message: "User Id Not found" }
    //             );
    //         }
    //         const parsedData = UpdateUserDTO.safeParse(req.body);
    //         if (!parsedData.success) {
    //             return res.status(400).json(
    //                 { success: false, message: z.prettifyError(parsedData.error) }
    //             ); // z.prettifyError - better error messages (zod)
    //         }
    //         if (req.file) {
    //             parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
    //         }
    //         const updatedUser = await userService.updateUser(userId, parsedData.data);
    //         return res.status(200).json(
    //             { success: true, data: updatedUser, message: "User profile updated successfully" }
    //         );
    //     } catch (error: Error | any) {
    //         return res.status(error.statusCode || 500).json(
    //             { success: false, message: error.message || "Internal Server Error" }
    //         );
    //     }
    // }

    async sendResetPasswordEmail(req: Request, res: Response) {
        try {
            const email = req.body.email;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                {
                    success: true,
                    data: user,
                    message: "If the email is registered, a reset link has been sent."
                }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {

            const token = req.params.token as string;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }


    getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user?._id;
      const user = await userService.getUserProfile(userId, currentUserId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  searchUsers = async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const currentUserId = req.user?._id;
      const users = await userService.searchUsers(query, currentUserId);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  followUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const targetUserId = req.params.userId;
      const result = await userService.followUser(userId, targetUserId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  unfollowUser = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const targetUserId = req.params.userId;
      const result = await userService.unfollowUser(userId, targetUserId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  savePost = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const postId = req.params.postId;
      const result = await userService.savePost(userId, postId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  unsavePost = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const postId = req.params.postId;
      const result = await userService.unsavePost(userId, postId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  getSavedPosts = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const savedPostIds = await userService.getSavedPosts(userId);

      res.status(200).json({
        success: true,
        data: savedPostIds,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const updateData = req.body;

      const user = await userService.updateProfile(userId, updateData);

      res.status(200).json({
        success: true,
        data: user,
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  updateProfilePicture = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const file = req.file as Express.Multer.File & { path: string };

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "Image is required",
        });
      }

      const user = await userService.updateProfilePicture(
        userId,
        file.path
      );

      res.status(200).json({
        success: true,
        data: user,
        message: "Profile picture updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      const result = await userService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
}
