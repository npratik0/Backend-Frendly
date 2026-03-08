import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import  jwt  from "jsonwebtoken";
import { JWT_SECRET  } from "../config";
import { sendEmail } from "../config/email";
import { NotFoundError, BadRequestError } from "../errors/custom-errors";
import cloudinary from "../config/cloudinary.config";
import { UserModel } from "../models/user.model";

const CLIENT_URL = process.env.CLIENT_URL as string;


// let userRepository = new UserRepository();

// export class UserService{
export class UserService {
  constructor(
    private userRepository: UserRepository = new UserRepository()
  ) {}
    async createUser(data:CreateUserDTO) {
        // buhsiness logic before creating User
        const emailCheck = await this.userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new Error("Email already in use");
        }
        const usernameCheck = await this.userRepository.getUserByUsername(data.username);
        if(usernameCheck){
            throw new Error("Username already in use");
        }

        // hash password
        const hashedPassword = await bcryptjs.hash(data.password,10); //10 - complexity
        data.password = hashedPassword;

        // Create user
        const newUser = await this.userRepository.createUser(data);
        return newUser;
    } 

    async loginUser(data: LoginUserDTO){
        const user = await this.userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        // compare password
        const validPassword = await bcryptjs.compare(data.password, user.password);
        // plaintext, hahed
        if(!validPassword){
            throw new HttpError(401, "Invalid Credentials");
        }

        // generate jwt
        const payload = {// user indentifier
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            dateOfBirth: user.dateOfBirth,
            role: user.role 
        }
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '30d'});
        return {token,user}
    }

    // Sprint 5 addition
    async getUserById(userId: string) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateUser(userId: string, data: UpdateUserDTO) {
        const user = await this.userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await this.userRepository.getUserByEmail(data.email!);
            if(emailExists){
                throw new HttpError(403, "Email already in use");
            }
        }
        if(user.username !== data.username){
            const usernameExists = await this.userRepository.getUserByUsername(data.username!);
            if(usernameExists){
                throw new HttpError(403, "Username already in use");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await this.userRepository.updateUser(userId, data);
        return updatedUser;
    }


    async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await this.userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;
    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await this.userRepository.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            await this.userRepository.updateUser(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }



    async getUserProfile(userId: string, currentUserId: string) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isFollowing = user.followers.some(
      (follower: any) => follower._id.toString() === currentUserId
    );

    return {
      _id: user._id.toString(),
      username: user.username,
      fullName: user.fullName || user.username,
      email: user.email,
      profilePicture: user.profilePicture || "",
      bio: user.bio || "",
      followersCount: user.followers.length,
      followingCount: user.following.length,
      isFollowing,
      isOwnProfile: userId === currentUserId,
    };
  }

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestError("Search query must be at least 2 characters");
    }

    const users = await this.userRepository.searchUsers(query.trim());
    
    return users.map((user: any) => ({
      _id: user._id.toString(),
      username: user.username,
      fullName: user.fullName || user.username,
      profilePicture: user.profilePicture || "",
      bio: user.bio || "",
    }));
  }

  async followUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestError("You cannot follow yourself");
    }

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError("User not found");
    }

    await this.userRepository.followUser(userId, targetUserId);
    
    return { message: "User followed successfully" };
  }

  async unfollowUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new BadRequestError("You cannot unfollow yourself");
    }

    await this.userRepository.unfollowUser(userId, targetUserId);
    
    return { message: "User unfollowed successfully" };
  }

  async savePost(userId: string, postId: string) {
    await this.userRepository.savePost(userId, postId);
    return { message: "Post saved successfully" };
  }

  async unsavePost(userId: string, postId: string) {
    await this.userRepository.unsavePost(userId, postId);
    return { message: "Post unsaved successfully" };
  }

  async getSavedPosts(userId: string) {
    return await this.userRepository.getSavedPosts(userId);
  }

   async updateProfile(
    userId: string,
    updateData: {
      fullName?: string;
      username?: string;
      bio?: string;
      phoneNumber?: number;
      gender?: string;
    }
  ) {
    // Check if username is already taken
    if (updateData.username) {
      const existingUser = await UserModel.findOne({
        username: updateData.username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new BadRequestError("Username is already taken");
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }

    return updatedUser;
  }

  async updateProfilePicture(userId: string, imageUrl: string) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Delete old profile picture from cloudinary if exists
    if (user.profilePicture) {
      try {
        const publicId = this.extractPublicId(user.profilePicture);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    ).select("-password");

    return updatedUser;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });

    return { message: "Password changed successfully" };
  }

  private extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }
    
}